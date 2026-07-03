import { and, count, desc, eq, inArray, ne, or } from "drizzle-orm";
import { db } from "@/db";
import { claims, itemImages, items } from "@/db/schema";
import { serializePublicItem } from "@/lib/user/items.server";
import { buildNotificationMessage } from "@/services/notifications/notification-theme";
import { notifyAdmins, notifyClaimSubmitted, notifyPossibleMatches, notifyReportSubmitted } from "@/services/notifications/notification-service.server";
import type {
  ClaimStatus,
  CreateClaimInput,
  CreateReportInput,
  PossibleMatch,
  UserClaimDetail,
  UserClaimSummary,
  UserReportDetail,
  UserReportSummary,
} from "@/types/reports";

type ItemRow = typeof items.$inferSelect;
type ImageRow = typeof itemImages.$inferSelect;
type ClaimRow = typeof claims.$inferSelect;
const editableReportStatuses = ["PENDING", "REJECTED", "PUBLISHED", "CHANGES_REQUESTED"] as const;

function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function ref(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

async function safeNotify(task: () => Promise<void>) {
  try {
    await task();
  } catch (error) {
    console.error("Notification event failed:", error);
  }
}

function getReportedDate(eventDate: string, eventTime?: string) {
  const dateParts = eventDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!dateParts) {
    return new Date();
  }

  const [, year, month, day] = dateParts;
  let hours = 12;
  let minutes = 0;
  const timeMatch = eventTime
    ?.trim()
    .match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);

  if (timeMatch) {
    const parsedHours = Number(timeMatch[1]);
    const parsedMinutes = Number(timeMatch[2] ?? "0");
    const meridiem = timeMatch[3]?.toUpperCase();

    if (
      Number.isInteger(parsedHours) &&
      Number.isInteger(parsedMinutes) &&
      parsedMinutes >= 0 &&
      parsedMinutes <= 59
    ) {
      if (meridiem) {
        if (parsedHours >= 1 && parsedHours <= 12) {
          hours = parsedHours % 12;
          if (meridiem === "PM") hours += 12;
          minutes = parsedMinutes;
        }
      } else if (parsedHours >= 0 && parsedHours <= 23) {
        hours = parsedHours;
        minutes = parsedMinutes;
      }
    }
  }

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    hours,
    minutes,
  );
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

async function getImages(itemIds: string[]) {
  if (!itemIds.length) return new Map<string, ImageRow[]>();

  const rows = await db
    .select()
    .from(itemImages)
    .where(inArray(itemImages.itemId, itemIds))
    .orderBy(desc(itemImages.isPrimary), itemImages.createdAt);

  return rows.reduce((map, image) => {
    const existing = map.get(image.itemId) ?? [];
    existing.push(image);
    map.set(image.itemId, existing);
    return map;
  }, new Map<string, ImageRow[]>());
}

async function getClaimCounts(itemIds: string[]) {
  if (!itemIds.length) return new Map<string, number>();

  const rows = await db
    .select({ itemId: claims.itemId, value: count() })
    .from(claims)
    .where(inArray(claims.itemId, itemIds))
    .groupBy(claims.itemId);

  return new Map(rows.map((row) => [row.itemId, row.value]));
}

function summary(
  item: ItemRow,
  images: ImageRow[],
  claimCounts: Map<string, number>,
): UserReportSummary {
  return {
    adminNotes: item.adminNotes,
    category: item.category,
    claimCount: claimCounts.get(item.id) ?? 0,
    eventDate: item.eventDate,
    id: item.id,
    location: item.location,
    primaryImageUrl: images[0]?.url ?? null,
    referenceNumber: item.referenceNumber,
    reportedDate: item.reportedDate.toISOString(),
    status: item.status,
    title: item.title,
    type: item.type,
  };
}

function detail(
  item: ItemRow,
  images: ImageRow[],
  claimCounts: Map<string, number>,
): UserReportDetail {
  return {
    ...summary(item, images, claimCounts),
    adminNotes: item.adminNotes,
    brand: item.brand,
    colour: item.colour,
    description: item.description,
    eventTime: item.eventTime,
    hiddenVerificationDetails: item.hiddenVerificationDetails,
    images: images.map((image) => ({
      alt: image.alt,
      id: image.id,
      isPrimary: image.isPrimary,
      url: image.url,
    })),
    landmark: item.landmark,
    privateOwnerNotes: item.privateOwnerNotes,
    storageOption: item.storageOption,
  };
}

export async function createUserReport(
  userId: string,
  input: CreateReportInput,
) {
  const itemId = id("item");
  const reportDate = getReportedDate(input.eventDate, input.eventTime);

  await db.insert(items).values({
    brand: input.brand || null,
    category: input.category,
    colour: input.colour || null,
    description: input.description,
    eventDate: input.eventDate,
    eventTime: input.eventTime,
    hiddenVerificationDetails:
      [input.verificationQuestion, input.hiddenVerificationDetails]
        .filter(Boolean)
        .join("\n\n") || null,
    id: itemId,
    landmark: input.landmark || null,
    location: input.location,
    privateOwnerNotes:
      input.type === "LOST" ? input.hiddenVerificationDetails || null : null,
    referenceNumber: ref("UST"),
    reportedById: userId,
    reportedDate: reportDate,
    reportSource: "USER",
    status: "PENDING",
    storageOption: input.storageOption || null,
    title: input.title,
    type: input.type,
  });

  if (input.images.length) {
    await db.insert(itemImages).values(
      input.images.map((image, index) => ({
        alt: input.title,
        id: id("img"),
        isPrimary: index === 0,
        itemId,
        url: image.secureUrl || image.url,
      })),
    );
  }

  const report = await getUserReport(userId, itemId);

  await safeNotify(async () => {
    await notifyReportSubmitted(userId, {
      itemId,
      itemTitle: input.title,
      referenceNumber: report?.referenceNumber ?? "",
      reportType: input.type
    });

    const matches = await getPossibleMatches(userId, itemId);
    if (matches?.length) {
      await notifyPossibleMatches(userId, {
        itemId,
        itemTitle: input.title,
        matchCount: matches.length,
        referenceNumber: report?.referenceNumber ?? "",
        reportType: input.type
      });
    }
  });

  return report;
}

export async function updateUserReport(userId: string, reportId: string, input: CreateReportInput) {
  const existingRows = await db
    .select()
    .from(items)
    .where(and(eq(items.id, reportId), eq(items.reportedById, userId)))
    .limit(1);
  const existing = existingRows[0];

  if (!existing || !editableReportStatuses.includes(existing.status as (typeof editableReportStatuses)[number])) {
    return null;
  }

  const reportDate = getReportedDate(input.eventDate, input.eventTime);

  await db
    .update(items)
    .set({
      adminNotes: null,
      brand: input.brand || null,
      category: input.category,
      colour: input.colour || null,
      description: input.description,
      eventDate: input.eventDate,
      eventTime: input.eventTime,
      hiddenVerificationDetails:
        [input.verificationQuestion, input.hiddenVerificationDetails]
          .filter(Boolean)
          .join("\n\n") || null,
      landmark: input.landmark || null,
      location: input.location,
      privateOwnerNotes:
        existing.type === "LOST" ? input.hiddenVerificationDetails || null : null,
      reportedDate: reportDate,
      status: "PENDING",
      storageOption: input.storageOption || null,
      title: input.title,
      type: existing.type,
      updatedAt: new Date()
    })
    .where(and(eq(items.id, reportId), eq(items.reportedById, userId)));

  await db.delete(itemImages).where(eq(itemImages.itemId, reportId));

  if (input.images.length) {
    await db.insert(itemImages).values(
      input.images.map((image, index) => ({
        alt: input.title,
        id: id("img"),
        isPrimary: index === 0,
        itemId: reportId,
        url: image.secureUrl || image.url,
      })),
    );
  }

  const report = await getUserReport(userId, reportId);

  await safeNotify(() =>
    notifyAdmins(
      buildNotificationMessage({
        channels: ["IN_APP", "EMAIL"],
        eventType: "REPORT_UPDATED",
        message: `${input.title} was edited by the reporter and needs review again. Reference: ${report?.referenceNumber ?? existing.referenceNumber}.`,
        payload: {
          itemId: reportId,
          itemTitle: input.title,
          referenceNumber: report?.referenceNumber ?? existing.referenceNumber,
          reportType: existing.type
        },
        subject: `Edited report awaiting review: ${input.title}`,
        title: "Edited report awaiting review"
      })
    )
  );

  return report;
}

export async function getUserReports(userId: string) {
  const rows = await db
    .select()
    .from(items)
    .where(eq(items.reportedById, userId))
    .orderBy(desc(items.createdAt));
  const itemIds = rows.map((item) => item.id);
  const [images, claimCounts] = await Promise.all([
    getImages(itemIds),
    getClaimCounts(itemIds),
  ]);

  return rows.map((item) =>
    summary(item, images.get(item.id) ?? [], claimCounts),
  );
}

export async function getUserReport(userId: string, reportId: string) {
  const rows = await db
    .select()
    .from(items)
    .where(and(eq(items.id, reportId), eq(items.reportedById, userId)))
    .limit(1);
  const item = rows[0];
  if (!item) return null;

  const [images, claimCounts] = await Promise.all([
    getImages([item.id]),
    getClaimCounts([item.id]),
  ]);
  return detail(item, images.get(item.id) ?? [], claimCounts);
}

function matchScore(report: UserReportDetail, candidate: ItemRow) {
  let score = 0;
  const reasons: string[] = [];
  const haystack =
    `${candidate.title} ${candidate.description} ${candidate.category} ${candidate.location}`.toLowerCase();

  if (candidate.category === report.category) {
    score += 35;
    reasons.push("Same category");
  }
  if (
    candidate.location.toLowerCase().includes(report.location.toLowerCase()) ||
    report.location.toLowerCase().includes(candidate.location.toLowerCase())
  ) {
    score += 25;
    reasons.push("Similar location");
  }

  for (const word of `${report.title} ${report.description}`
    .toLowerCase()
    .split(/\W+/)
    .filter((entry) => entry.length > 3)) {
    if (haystack.includes(word)) score += 5;
  }

  if (score >= 45 && !reasons.includes("Description overlap"))
    reasons.push("Description overlap");
  return { reasons, score: Math.min(score, 98) };
}

export async function getPossibleMatches(
  userId: string,
  reportId: string,
): Promise<PossibleMatch[] | null> {
  const report = await getUserReport(userId, reportId);
  if (!report) return null;

  const rows = await db
    .select()
    .from(items)
    .where(
      and(
        ne(items.id, reportId),
        eq(items.type, report.type === "LOST" ? "FOUND" : "LOST"),
        or(
          inArray(items.status, ["PUBLISHED", "CLAIMED"]),
          eq(items.reportedById, userId),
        )!,
      ),
    )
    .limit(20);
  const images = await getImages(rows.map((item) => item.id));

  return rows
    .map((item) => {
      const result = matchScore(report, item);
      return {
        item: serializePublicItem(item, images.get(item.id) ?? [], new Set()),
        reasons: result.reasons,
        score: result.score,
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);
}

function claimSummary(
  claim: ClaimRow,
  item: ItemRow,
  images: ImageRow[],
): UserClaimSummary {
  return {
    createdAt: claim.createdAt.toISOString(),
    id: claim.id,
    itemId: item.id,
    itemImageUrl: images[0]?.url ?? null,
    itemTitle: item.title,
    referenceNumber: claim.referenceNumber,
    status: claim.status as ClaimStatus,
  };
}

export async function createUserClaim(userId: string, input: CreateClaimInput) {
  const publicItem = await db
    .select()
    .from(items)
    .where(
      and(
        eq(items.id, input.itemId),
        eq(items.status, "PUBLISHED"),
      ),
    )
    .limit(1);

  const item = publicItem[0];
  if (!item) return null;

  const claimId = id("claim");
  const referenceNumber = ref("CLM");
  await db.insert(claims).values({
    claimantId: userId,
    evidenceImagePublicId: input.evidenceImage?.publicId ?? null,
    evidenceImageUrl: input.evidenceImage?.secureUrl ?? null,
    hiddenDetails: input.hiddenDetails,
    id: claimId,
    itemId: input.itemId,
    proofDescription: input.proofDescription,
    referenceNumber,
    status: "SUBMITTED",
  });

  const claim = await getUserClaim(userId, claimId);

  await safeNotify(() =>
    notifyClaimSubmitted(userId, item.reportedById, {
      claimId,
      claimReferenceNumber: referenceNumber,
      itemId: item.id,
      itemTitle: item.title,
      referenceNumber: item.referenceNumber,
      reportType: item.type
    })
  );

  return claim;
}

export async function getUserClaims(userId: string) {
  const rows = await db
    .select({ claim: claims, item: items })
    .from(claims)
    .innerJoin(items, eq(claims.itemId, items.id))
    .where(eq(claims.claimantId, userId))
    .orderBy(desc(claims.createdAt));
  const images = await getImages(rows.map((row) => row.item.id));

  return rows.map((row) =>
    claimSummary(row.claim, row.item, images.get(row.item.id) ?? []),
  );
}

export async function getUserClaim(
  userId: string,
  claimId: string,
): Promise<UserClaimDetail | null> {
  const rows = await db
    .select({ claim: claims, item: items })
    .from(claims)
    .innerJoin(items, eq(claims.itemId, items.id))
    .where(and(eq(claims.id, claimId), eq(claims.claimantId, userId)))
    .limit(1);
  const row = rows[0];
  if (!row) return null;

  const images = await getImages([row.item.id]);
  return {
    ...claimSummary(row.claim, row.item, images.get(row.item.id) ?? []),
    pickupCode: row.claim.status === "APPROVED" ? row.claim.pickupCode : null,
    pickupLocation:
      row.claim.status === "APPROVED" ? row.claim.pickupLocation : null,
    proofDescription: row.claim.proofDescription,
  };
}
