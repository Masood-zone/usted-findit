import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { itemImages, items, profileUpdateRequests, savedItems } from "@/db/schema";
import type { ItemType, PublicItem, PublicItemStatus, UserItemSearchFilters } from "@/types/items";

const publicStatuses: PublicItemStatus[] = ["PUBLISHED", "CLAIMED"];

type ItemRow = typeof items.$inferSelect;
type ImageRow = typeof itemImages.$inferSelect;

function parsePositiveInt(value: string | null, fallback: number, max = 50) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(Math.floor(parsed), max);
}

export function getUserItemFiltersFromUrl(request: Request): Required<Pick<UserItemSearchFilters, "page" | "pageSize">> &
  Omit<UserItemSearchFilters, "page" | "pageSize"> {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const status = url.searchParams.get("status");

  return {
    q: url.searchParams.get("q") || undefined,
    type: type === "LOST" || type === "FOUND" ? type : undefined,
    category: url.searchParams.get("category") || undefined,
    location: url.searchParams.get("location") || undefined,
    status: status === "PUBLISHED" || status === "CLAIMED" ? status : undefined,
    page: parsePositiveInt(url.searchParams.get("page"), 1, 999),
    pageSize: parsePositiveInt(url.searchParams.get("pageSize"), 12, 30)
  };
}

function buildWhere(filters: UserItemSearchFilters) {
  const conditions = [filters.status ? eq(items.status, filters.status) : inArray(items.status, publicStatuses)];

  if (filters.type) conditions.push(eq(items.type, filters.type));
  if (filters.category) conditions.push(eq(items.category, filters.category));
  if (filters.location) conditions.push(ilike(items.location, `%${filters.location}%`));
  if (filters.q) {
    conditions.push(
      or(
        ilike(items.title, `%${filters.q}%`),
        ilike(items.description, `%${filters.q}%`),
        ilike(items.category, `%${filters.q}%`),
        ilike(items.location, `%${filters.q}%`)
      )!
    );
  }

  return and(...conditions);
}

async function getImagesForItems(itemIds: string[]) {
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

async function getSavedItemIds(userId: string, itemIds: string[]) {
  if (!itemIds.length) return new Set<string>();

  const rows = await db
    .select({ itemId: savedItems.itemId })
    .from(savedItems)
    .where(and(eq(savedItems.userId, userId), inArray(savedItems.itemId, itemIds)));

  return new Set(rows.map((row) => row.itemId));
}

export function serializePublicItem(item: ItemRow, images: ImageRow[], savedItemIds: Set<string>): PublicItem {
  return {
    id: item.id,
    title: item.title,
    type: item.type as ItemType,
    status: item.status as PublicItemStatus,
    category: item.category,
    location: item.location,
    reportedDate: item.reportedDate.toISOString(),
    description: item.description,
    referenceNumber: item.referenceNumber,
    images: images.map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      isPrimary: image.isPrimary
    })),
    isSaved: savedItemIds.has(item.id)
  };
}

export async function findPublicItems(userId: string, filters: UserItemSearchFilters) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;
  const where = buildWhere(filters);
  const offset = (page - 1) * pageSize;

  const [rows, totalRows] = await Promise.all([
    db.select().from(items).where(where).orderBy(desc(items.reportedDate)).limit(pageSize).offset(offset),
    db.select({ value: count() }).from(items).where(where)
  ]);

  const itemIds = rows.map((item) => item.id);
  const [imagesByItemId, savedItemIds] = await Promise.all([getImagesForItems(itemIds), getSavedItemIds(userId, itemIds)]);
  const total = totalRows[0]?.value ?? 0;

  return {
    page,
    pageSize,
    total,
    hasMore: offset + rows.length < total,
    items: rows.map((item) => serializePublicItem(item, imagesByItemId.get(item.id) ?? [], savedItemIds))
  };
}

export async function findPublicItemById(userId: string, itemId: string) {
  const row = await db
    .select()
    .from(items)
    .where(and(eq(items.id, itemId), inArray(items.status, publicStatuses)))
    .limit(1);

  const item = row[0];
  if (!item) return null;

  const [imagesByItemId, savedItemIds] = await Promise.all([getImagesForItems([item.id]), getSavedItemIds(userId, [item.id])]);
  return serializePublicItem(item, imagesByItemId.get(item.id) ?? [], savedItemIds);
}

export async function getDashboardData(userId: string, name: string) {
  const [recentFound, recentLost, resolvedCountRows, totalCountRows] = await Promise.all([
    findPublicItems(userId, { type: "FOUND", page: 1, pageSize: 6 }),
    findPublicItems(userId, { type: "LOST", page: 1, pageSize: 6 }),
    db.select({ value: count() }).from(items).where(eq(items.status, "RESOLVED")),
    db.select({ value: count() }).from(items).where(inArray(items.status, ["PUBLISHED", "CLAIMED", "RESOLVED"]))
  ]);

  const resolved = resolvedCountRows[0]?.value ?? 0;
  const total = totalCountRows[0]?.value ?? 0;

  return {
    greetingName: name.split(" ")[0] || name,
    recentFoundItems: recentFound.items,
    recentLostItems: recentLost.items,
    stats: {
      recoveryRate: total ? Math.round((resolved / total) * 100) : 0,
      itemsReturned: resolved,
      activeReports: total
    },
    categories: [
      { label: "ID Cards", value: "ID Cards", icon: "id" as const },
      { label: "Keys", value: "Keys", icon: "key" as const },
      { label: "Electronics", value: "Electronics", icon: "electronics" as const },
      { label: "Others", value: "Others", icon: "other" as const }
    ]
  };
}

export async function getSavedPublicItems(userId: string) {
  const rows = await db
    .select({ item: items })
    .from(savedItems)
    .innerJoin(items, eq(savedItems.itemId, items.id))
    .where(and(eq(savedItems.userId, userId), inArray(items.status, publicStatuses)))
    .orderBy(desc(savedItems.createdAt));

  const itemRows = rows.map((row) => row.item);
  const itemIds = itemRows.map((item) => item.id);
  const imagesByItemId = await getImagesForItems(itemIds);
  const savedItemIds = new Set(itemIds);

  return itemRows.map((item) => serializePublicItem(item, imagesByItemId.get(item.id) ?? [], savedItemIds));
}

export async function savePublicItem(userId: string, itemId: string) {
  const publicItem = await findPublicItemById(userId, itemId);
  if (!publicItem) return null;

  await db
    .insert(savedItems)
    .values({
      id: `save_${userId}_${itemId}`,
      itemId,
      userId
    })
    .onConflictDoNothing();

  return { itemId, isSaved: true };
}

export async function unsavePublicItem(userId: string, itemId: string) {
  await db.delete(savedItems).where(and(eq(savedItems.userId, userId), eq(savedItems.itemId, itemId)));
  return { itemId, isSaved: false };
}

export async function getProfileData(userId: string, authUser: { name: string; email: string; phone?: string | null; institutionId?: string | null; image?: string | null; role: string; accountStatus: string }) {
  const [savedCountRows, reportCountRows, pendingRows] = await Promise.all([
    db.select({ value: count() }).from(savedItems).where(eq(savedItems.userId, userId)),
    db.select({ value: count() }).from(items).where(eq(items.reportedById, userId)),
    db.select().from(profileUpdateRequests).where(and(eq(profileUpdateRequests.userId, userId), eq(profileUpdateRequests.status, "PENDING"))).orderBy(desc(profileUpdateRequests.createdAt)).limit(1)
  ]);
  const pendingProfileUpdate = pendingRows[0];

  return {
    user: {
      id: userId,
      name: authUser.name,
      email: authUser.email,
      phone: authUser.phone ?? null,
      institutionId: authUser.institutionId ?? null,
      image: authUser.image ?? null,
      role: authUser.role,
      accountStatus: authUser.accountStatus
    },
    stats: {
      savedItems: savedCountRows[0]?.value ?? 0,
      reportsSubmitted: reportCountRows[0]?.value ?? 0,
      claimsStarted: 0
    },
    pendingProfileUpdate: pendingProfileUpdate
      ? {
          adminNotes: pendingProfileUpdate.adminNotes,
          createdAt: pendingProfileUpdate.createdAt.toISOString(),
          id: pendingProfileUpdate.id,
          requestedEmail: pendingProfileUpdate.requestedEmail,
          requestedName: pendingProfileUpdate.requestedName,
          requestedPhone: pendingProfileUpdate.requestedPhone,
          status: pendingProfileUpdate.status
        }
      : null
  };
}
