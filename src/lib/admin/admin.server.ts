import { and, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { adminLogs, claims, itemImages, items, user } from "@/db/schema";
import { buildNotificationMessage } from "@/services/notifications/notification-theme";
import { notifyUserById } from "@/services/notifications/notification-service.server";
import type {
  AdminClaimDetail,
  AdminClaimSummary,
  AdminDashboardResponse,
  AdminReportDetail,
  AdminReportFilters,
  AdminReportSummary,
  AdminStatisticsResponse,
  AdminUserDetail,
  AdminUserSummary
} from "@/types/admin";
import type { AuthSessionUser } from "@/types/auth";
import type { ItemStatus } from "@/types/items";
import type { ClaimStatus } from "@/types/reports";

type ItemRow = typeof items.$inferSelect;
type ImageRow = typeof itemImages.$inferSelect;
type UserRow = typeof user.$inferSelect;
type ClaimRow = typeof claims.$inferSelect;

const itemStatuses: ItemStatus[] = ["PENDING", "PUBLISHED", "CLAIMED", "RESOLVED", "REJECTED", "REMOVED", "CHANGES_REQUESTED"];
const claimStatuses: ClaimStatus[] = ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "CANCELLED"];

function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function pickupCode() {
  return `PU-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

async function logAdminAction(adminId: string, action: string, entityType: string, entityId: string, metadata?: Record<string, unknown>) {
  await db.insert(adminLogs).values({
    action,
    adminId,
    entityId,
    entityType,
    id: id("log"),
    metadata: metadata ?? null
  });
}

async function safeNotify(task: () => Promise<void>) {
  try {
    await task();
  } catch (error) {
    console.error("Notification event failed:", error);
  }
}

async function getImages(itemIds: string[]) {
  if (!itemIds.length) return new Map<string, ImageRow[]>();

  const rows = await db.select().from(itemImages).where(inArray(itemImages.itemId, itemIds)).orderBy(desc(itemImages.isPrimary), itemImages.createdAt);
  return rows.reduce((map, image) => {
    const existing = map.get(image.itemId) ?? [];
    existing.push(image);
    map.set(image.itemId, existing);
    return map;
  }, new Map<string, ImageRow[]>());
}

async function getClaimCounts(itemIds: string[]) {
  if (!itemIds.length) return new Map<string, number>();

  const rows = await db.select({ itemId: claims.itemId, value: count() }).from(claims).where(inArray(claims.itemId, itemIds)).groupBy(claims.itemId);
  return new Map(rows.map((row) => [row.itemId, row.value]));
}

function serializeReportSummary(item: ItemRow, reporter: Pick<UserRow, "name" | "email"> | null, images: ImageRow[], claimCounts: Map<string, number>): AdminReportSummary {
  return {
    category: item.category,
    claimCount: claimCounts.get(item.id) ?? 0,
    id: item.id,
    location: item.location,
    primaryImageUrl: images[0]?.url ?? null,
    referenceNumber: item.referenceNumber,
    reportedDate: item.reportedDate.toISOString(),
    reporterEmail: reporter?.email ?? null,
    reporterName: reporter?.name ?? null,
    status: item.status,
    title: item.title,
    type: item.type
  };
}

function serializeReportDetail(item: ItemRow, reporter: Pick<UserRow, "name" | "email"> | null, images: ImageRow[], claimCounts: Map<string, number>): AdminReportDetail {
  return {
    ...serializeReportSummary(item, reporter, images, claimCounts),
    adminNotes: item.adminNotes,
    brand: item.brand,
    colour: item.colour,
    description: item.description,
    eventDate: item.eventDate,
    eventTime: item.eventTime,
    hiddenVerificationDetails: item.hiddenVerificationDetails,
    images: images.map((image) => ({ alt: image.alt, id: image.id, isPrimary: image.isPrimary, url: image.url })),
    landmark: item.landmark,
    privateOwnerNotes: item.privateOwnerNotes,
    removedReason: item.removedReason,
    storageOption: item.storageOption
  };
}

function reportWhere(filters: AdminReportFilters) {
  const conditions = [];
  if (filters.status && filters.status !== "ALL" && itemStatuses.includes(filters.status)) conditions.push(eq(items.status, filters.status));
  if (filters.type && filters.type !== "ALL") conditions.push(eq(items.type, filters.type));
  if (filters.q) {
    conditions.push(
      or(
        ilike(items.title, `%${filters.q}%`),
        ilike(items.referenceNumber, `%${filters.q}%`),
        ilike(items.category, `%${filters.q}%`),
        ilike(items.location, `%${filters.q}%`)
      )!
    );
  }
  return conditions.length ? and(...conditions) : undefined;
}

export function getAdminReportFiltersFromUrl(request: Request): AdminReportFilters {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const type = url.searchParams.get("type");

  return {
    q: url.searchParams.get("q") || undefined,
    status: status && (status === "ALL" || itemStatuses.includes(status as ItemStatus)) ? (status as AdminReportFilters["status"]) : undefined,
    type: type === "LOST" || type === "FOUND" || type === "ALL" ? type : undefined
  };
}

export async function getAdminReports(filters: AdminReportFilters = {}) {
  const rows = await db
    .select({ item: items, reporter: user })
    .from(items)
    .leftJoin(user, eq(items.reportedById, user.id))
    .where(reportWhere(filters))
    .orderBy(desc(items.createdAt));
  const itemIds = rows.map((row) => row.item.id);
  const [images, claimCounts] = await Promise.all([getImages(itemIds), getClaimCounts(itemIds)]);
  return rows.map((row) => serializeReportSummary(row.item, row.reporter, images.get(row.item.id) ?? [], claimCounts));
}

export async function getAdminReport(reportId: string) {
  const rows = await db.select({ item: items, reporter: user }).from(items).leftJoin(user, eq(items.reportedById, user.id)).where(eq(items.id, reportId)).limit(1);
  const row = rows[0];
  if (!row) return null;

  const [images, claimCounts] = await Promise.all([getImages([row.item.id]), getClaimCounts([row.item.id])]);
  return serializeReportDetail(row.item, row.reporter, images.get(row.item.id) ?? [], claimCounts);
}

async function getItemForMutation(itemId: string) {
  const rows = await db.select().from(items).where(eq(items.id, itemId)).limit(1);
  return rows[0] ?? null;
}

export async function approveReport(admin: AuthSessionUser, itemId: string, adminNotes?: string) {
  const item = await getItemForMutation(itemId);
  if (!item || !["PENDING", "REJECTED"].includes(item.status)) return null;

  await db.update(items).set({ adminNotes: adminNotes || item.adminNotes, removedReason: null, status: "PUBLISHED", updatedAt: new Date() }).where(eq(items.id, itemId));
  await logAdminAction(admin.id, "REPORT_APPROVED", "item", itemId, { status: "PUBLISHED" });
  await safeNotify(() =>
    notifyUserById(
      item.reportedById,
      buildNotificationMessage({
        channels: ["IN_APP", "EMAIL", "SMS", "PUSH"],
        eventType: "REPORT_APPROVED",
        message: `${item.title} is now visible in public search. Reference: ${item.referenceNumber}.`,
        payload: { itemId, itemTitle: item.title, referenceNumber: item.referenceNumber, reportType: item.type },
        smsText: `USTED FindIt: Your report ${item.referenceNumber} has been approved.`,
        subject: `Report approved: ${item.title}`,
        title: "Report approved"
      })
    )
  );
  return getAdminReport(itemId);
}

export async function rejectReport(admin: AuthSessionUser, itemId: string, reason: string) {
  const item = await getItemForMutation(itemId);
  if (!item || !reason.trim()) return null;

  await db.update(items).set({ adminNotes: reason.trim(), status: "REJECTED", updatedAt: new Date() }).where(eq(items.id, itemId));
  await logAdminAction(admin.id, "REPORT_REJECTED", "item", itemId, { reason });
  await safeNotify(() =>
    notifyUserById(
      item.reportedById,
      buildNotificationMessage({
        channels: ["IN_APP", "EMAIL", "SMS", "PUSH"],
        eventType: "REPORT_REJECTED",
        message: `Your report for ${item.title} was rejected. Reason: ${reason.trim()}`,
        payload: { itemId, itemTitle: item.title, reason: reason.trim(), referenceNumber: item.referenceNumber, reportType: item.type },
        smsText: `USTED FindIt: Report ${item.referenceNumber} was rejected. Check the app for details.`,
        subject: `Report rejected: ${item.title}`,
        title: "Report rejected"
      })
    )
  );
  return getAdminReport(itemId);
}

export async function requestReportChanges(admin: AuthSessionUser, itemId: string, message: string) {
  const item = await getItemForMutation(itemId);
  if (!item || !message.trim()) return null;

  await db.update(items).set({ adminNotes: message.trim(), status: "CHANGES_REQUESTED", updatedAt: new Date() }).where(eq(items.id, itemId));
  await logAdminAction(admin.id, "REPORT_CHANGES_REQUESTED", "item", itemId, { message });
  await safeNotify(() =>
    notifyUserById(
      item.reportedById,
      buildNotificationMessage({
        channels: ["IN_APP", "EMAIL", "PUSH"],
        eventType: "REPORT_CHANGES_REQUESTED",
        message: `Your report for ${item.title} needs changes: ${message.trim()}`,
        payload: { itemId, itemTitle: item.title, referenceNumber: item.referenceNumber, reportType: item.type },
        subject: `Report needs changes: ${item.title}`,
        title: "Report needs changes"
      })
    )
  );
  return getAdminReport(itemId);
}

export async function removeReport(admin: AuthSessionUser, itemId: string, reason: string) {
  const item = await getItemForMutation(itemId);
  if (!item || !reason.trim()) return null;

  await db.update(items).set({ removedReason: reason.trim(), status: "REMOVED", updatedAt: new Date() }).where(eq(items.id, itemId));
  await logAdminAction(admin.id, "REPORT_REMOVED", "item", itemId, { reason });
  await safeNotify(() =>
    notifyUserById(
      item.reportedById,
      buildNotificationMessage({
        channels: ["IN_APP", "EMAIL", "SMS", "PUSH"],
        eventType: "REPORT_REMOVED",
        message: `Your report for ${item.title} was removed. Reason: ${reason.trim()}`,
        payload: { itemId, itemTitle: item.title, reason: reason.trim(), referenceNumber: item.referenceNumber, reportType: item.type },
        smsText: `USTED FindIt: Report ${item.referenceNumber} was removed. Check the app for details.`,
        subject: `Report removed: ${item.title}`,
        title: "Report removed"
      })
    )
  );
  return getAdminReport(itemId);
}

export async function resolveReport(admin: AuthSessionUser, itemId: string, adminNotes?: string) {
  const item = await getItemForMutation(itemId);
  if (!item || !["PUBLISHED", "CLAIMED"].includes(item.status)) return null;

  await db.update(items).set({ adminNotes: adminNotes || item.adminNotes, status: "RESOLVED", updatedAt: new Date() }).where(eq(items.id, itemId));
  await logAdminAction(admin.id, "REPORT_RESOLVED", "item", itemId, { status: "RESOLVED" });
  await safeNotify(() =>
    notifyUserById(
      item.reportedById,
      buildNotificationMessage({
        channels: ["IN_APP", "EMAIL", "SMS", "PUSH"],
        eventType: "REPORT_RESOLVED",
        message: `${item.title} has been marked as resolved.`,
        payload: { itemId, itemTitle: item.title, referenceNumber: item.referenceNumber, reportType: item.type },
        smsText: `USTED FindIt: Report ${item.referenceNumber} has been resolved.`,
        subject: `Report resolved: ${item.title}`,
        title: "Report resolved"
      })
    )
  );
  return getAdminReport(itemId);
}

function serializeClaimSummary(claim: ClaimRow, item: ItemRow, claimant: Pick<UserRow, "name" | "email">, images: ImageRow[]): AdminClaimSummary {
  return {
    claimantEmail: claimant.email,
    claimantName: claimant.name,
    createdAt: claim.createdAt.toISOString(),
    id: claim.id,
    itemId: item.id,
    itemImageUrl: images[0]?.url ?? null,
    itemStatus: item.status,
    itemTitle: item.title,
    itemType: item.type,
    referenceNumber: claim.referenceNumber,
    status: claim.status as ClaimStatus
  };
}

export async function getAdminClaims(status?: ClaimStatus | "ALL") {
  const where = status && status !== "ALL" && claimStatuses.includes(status) ? eq(claims.status, status) : undefined;
  const rows = await db
    .select({ claim: claims, item: items, claimant: user })
    .from(claims)
    .innerJoin(items, eq(claims.itemId, items.id))
    .innerJoin(user, eq(claims.claimantId, user.id))
    .where(where)
    .orderBy(desc(claims.createdAt));
  const images = await getImages(rows.map((row) => row.item.id));
  return rows.map((row) => serializeClaimSummary(row.claim, row.item, row.claimant, images.get(row.item.id) ?? []));
}

export async function getAdminClaim(claimId: string): Promise<AdminClaimDetail | null> {
  const rows = await db
    .select({ claim: claims, item: items, claimant: user })
    .from(claims)
    .innerJoin(items, eq(claims.itemId, items.id))
    .innerJoin(user, eq(claims.claimantId, user.id))
    .where(eq(claims.id, claimId))
    .limit(1);
  const row = rows[0];
  if (!row) return null;

  const images = await getImages([row.item.id]);
  return {
    ...serializeClaimSummary(row.claim, row.item, row.claimant, images.get(row.item.id) ?? []),
    adminNotes: row.claim.adminNotes,
    evidenceImageUrl: row.claim.evidenceImageUrl,
    hiddenDetails: row.claim.hiddenDetails,
    pickupCode: row.claim.pickupCode,
    pickupLocation: row.claim.pickupLocation,
    proofDescription: row.claim.proofDescription
  };
}

export async function approveClaim(admin: AuthSessionUser, claimId: string, pickupLocation?: string) {
  const detail = await getAdminClaim(claimId);
  if (!detail || detail.itemStatus === "RESOLVED") return null;

  const code = pickupCode();
  await db.update(claims).set({ pickupCode: code, pickupLocation: pickupLocation || "Security Office", reviewedAt: new Date(), status: "APPROVED", updatedAt: new Date() }).where(eq(claims.id, claimId));
  await db.update(items).set({ status: "CLAIMED", updatedAt: new Date() }).where(eq(items.id, detail.itemId));
  await logAdminAction(admin.id, "CLAIM_APPROVED", "claim", claimId, { itemId: detail.itemId, pickupCode: code });
  const claimRow = (await db.select({ claimantId: claims.claimantId }).from(claims).where(eq(claims.id, claimId)).limit(1))[0];
  const itemRow = await getItemForMutation(detail.itemId);
  await safeNotify(async () => {
    await notifyUserById(
      claimRow?.claimantId ?? null,
      buildNotificationMessage({
        channels: ["IN_APP", "EMAIL", "SMS", "PUSH"],
        eventType: "CLAIM_APPROVED",
        message: `Your claim for ${detail.itemTitle} was approved. Pickup code: ${code}. Pickup location: ${pickupLocation || "Security Office"}.`,
        payload: { claimId, claimReferenceNumber: detail.referenceNumber, itemId: detail.itemId, itemTitle: detail.itemTitle, pickupCode: code, pickupLocation: pickupLocation || "Security Office", referenceNumber: itemRow?.referenceNumber ?? detail.referenceNumber, reportType: itemRow?.type },
        smsText: `USTED FindIt: Claim approved for ${detail.itemTitle}. Pickup code: ${code}.`,
        subject: `Claim approved: ${detail.itemTitle}`,
        title: "Claim approved"
      })
    );
    await notifyUserById(
      itemRow?.reportedById ?? null,
      buildNotificationMessage({
        channels: ["IN_APP", "EMAIL", "PUSH"],
        eventType: "ITEM_CLAIMED",
        message: `${detail.itemTitle} has an approved claim and is now marked as claimed.`,
        payload: { claimId, claimReferenceNumber: detail.referenceNumber, itemId: detail.itemId, itemTitle: detail.itemTitle, referenceNumber: itemRow?.referenceNumber ?? detail.referenceNumber, reportType: itemRow?.type },
        subject: `Item claimed: ${detail.itemTitle}`,
        title: "Item claimed"
      })
    );
  });
  return getAdminClaim(claimId);
}

export async function rejectClaim(admin: AuthSessionUser, claimId: string, reason: string) {
  if (!reason.trim()) return null;
  const detail = await getAdminClaim(claimId);
  if (!detail) return null;

  await db.update(claims).set({ adminNotes: reason.trim(), reviewedAt: new Date(), status: "REJECTED", updatedAt: new Date() }).where(eq(claims.id, claimId));
  await logAdminAction(admin.id, "CLAIM_REJECTED", "claim", claimId, { reason, itemId: detail.itemId });
  const claimantRow = (await db.select({ claimantId: claims.claimantId }).from(claims).where(eq(claims.id, claimId)).limit(1))[0];
  await safeNotify(() =>
    notifyUserById(
      claimantRow?.claimantId ?? null,
      buildNotificationMessage({
        channels: ["IN_APP", "EMAIL", "SMS", "PUSH"],
        eventType: "CLAIM_REJECTED",
        message: `Your claim for ${detail.itemTitle} was rejected. Reason: ${reason.trim()}`,
        payload: { claimId, claimReferenceNumber: detail.referenceNumber, itemId: detail.itemId, itemTitle: detail.itemTitle, reason: reason.trim(), referenceNumber: detail.referenceNumber },
        smsText: `USTED FindIt: Your claim for ${detail.itemTitle} was rejected. Check the app for details.`,
        subject: `Claim rejected: ${detail.itemTitle}`,
        title: "Claim rejected"
      })
    )
  );
  return getAdminClaim(claimId);
}

export async function getAdminDashboard(admin: AuthSessionUser): Promise<AdminDashboardResponse> {
  const [[total], [pending], [published], [open], [resolved], [removed], pendingReports, recentClaims, recentLogs] = await Promise.all([
    db.select({ value: count() }).from(items),
    db.select({ value: count() }).from(items).where(eq(items.status, "PENDING")),
    db.select({ value: count() }).from(items).where(eq(items.status, "PUBLISHED")),
    db.select({ value: count() }).from(claims).where(inArray(claims.status, ["SUBMITTED", "UNDER_REVIEW"])),
    db.select({ value: count() }).from(items).where(eq(items.status, "RESOLVED")),
    db.select({ value: count() }).from(items).where(eq(items.status, "REMOVED")),
    getAdminReports({ status: "PENDING" }),
    getAdminClaims("SUBMITTED"),
    db.select().from(adminLogs).orderBy(desc(adminLogs.createdAt)).limit(8)
  ]);

  return {
    greetingName: admin.name.split(" ")[0] || "Admin",
    pendingReports: pendingReports.slice(0, 5),
    recentActivity: recentLogs.map((log) => ({
      action: log.action,
      createdAt: log.createdAt.toISOString(),
      entityId: log.entityId,
      entityType: log.entityType,
      id: log.id
    })),
    recentClaims: recentClaims.slice(0, 5),
    stats: {
      openClaims: open?.value ?? 0,
      pendingReports: pending?.value ?? 0,
      publishedReports: published?.value ?? 0,
      removedReports: removed?.value ?? 0,
      resolvedItems: resolved?.value ?? 0,
      totalReports: total?.value ?? 0
    }
  };
}

export async function getAdminUsers(): Promise<AdminUserSummary[]> {
  const rows = await db.select().from(user).orderBy(desc(user.createdAt));
  const [reportCounts, claimCounts] = await Promise.all([
    db.select({ userId: items.reportedById, value: count() }).from(items).groupBy(items.reportedById),
    db.select({ userId: claims.claimantId, value: count() }).from(claims).groupBy(claims.claimantId)
  ]);
  const reports = new Map(reportCounts.filter((row) => row.userId).map((row) => [row.userId!, row.value]));
  const userClaims = new Map(claimCounts.map((row) => [row.userId, row.value]));

  return rows.map((entry) => ({
    accountStatus: entry.accountStatus,
    claimsSubmitted: userClaims.get(entry.id) ?? 0,
    createdAt: entry.createdAt.toISOString(),
    email: entry.email,
    id: entry.id,
    institutionId: entry.institutionId,
    name: entry.name,
    phone: entry.phone,
    reportsSubmitted: reports.get(entry.id) ?? 0,
    role: entry.role
  }));
}

export async function getAdminUser(userId: string): Promise<AdminUserDetail | null> {
  const users = await getAdminUsers();
  const entry = users.find((candidate) => candidate.id === userId);
  if (!entry) return null;

  const [recentReports, allClaims] = await Promise.all([getAdminReports({}), getAdminClaims("ALL")]);
  return {
    ...entry,
    recentClaims: allClaims.filter((claim) => claim.claimantEmail === entry.email).slice(0, 5),
    recentReports: recentReports.filter((report) => report.reporterEmail === entry.email).slice(0, 5)
  };
}

export async function getAdminStatistics(): Promise<AdminStatisticsResponse> {
  const [dashboard, lost, found, claimed, categoryRows, locationRows, monthlyRows] = await Promise.all([
    getAdminDashboard({ id: "", name: "Admin" } as AuthSessionUser),
    db.select({ value: count() }).from(items).where(eq(items.type, "LOST")),
    db.select({ value: count() }).from(items).where(eq(items.type, "FOUND")),
    db.select({ value: count() }).from(items).where(eq(items.status, "CLAIMED")),
    db.select({ label: items.category, value: count() }).from(items).groupBy(items.category).orderBy(desc(count())).limit(8),
    db.select({ label: items.location, value: count() }).from(items).groupBy(items.location).orderBy(desc(count())).limit(8),
    db
      .select({
        label: sql<string>`to_char(${items.reportedDate}, 'Mon')`,
        lost: sql<number>`count(*) filter (where ${items.type} = 'LOST')`,
        found: sql<number>`count(*) filter (where ${items.type} = 'FOUND')`,
        resolved: sql<number>`count(*) filter (where ${items.status} = 'RESOLVED')`
      })
      .from(items)
      .groupBy(sql`to_char(${items.reportedDate}, 'Mon'), date_trunc('month', ${items.reportedDate})`)
      .orderBy(sql`date_trunc('month', ${items.reportedDate})`)
      .limit(6)
  ]);
  const totalOperational = dashboard.stats.publishedReports + dashboard.stats.resolvedItems + claimed[0].value;

  return {
    categories: categoryRows,
    locations: locationRows,
    monthly: monthlyRows.map((row) => ({ found: Number(row.found), label: row.label, lost: Number(row.lost), resolved: Number(row.resolved) })),
    totals: {
      ...dashboard.stats,
      claimedItems: claimed[0].value,
      foundReports: found[0].value,
      lostReports: lost[0].value,
      recoveryRate: totalOperational ? Math.round((dashboard.stats.resolvedItems / totalOperational) * 100) : 0
    }
  };
}
