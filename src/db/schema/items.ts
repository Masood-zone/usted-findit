import { boolean, index, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const itemType = pgEnum("item_type", ["LOST", "FOUND"]);
export const itemStatus = pgEnum("item_status", ["PENDING", "PUBLISHED", "CLAIMED", "RESOLVED", "REJECTED", "REMOVED", "CHANGES_REQUESTED"]);
export const claimStatus = pgEnum("claim_status", ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "CANCELLED"]);
export const notificationChannel = pgEnum("notification_channel", ["IN_APP", "EMAIL", "SMS", "PUSH"]);
export const notificationDeliveryStatus = pgEnum("notification_delivery_status", ["PENDING", "SENT", "FAILED", "SKIPPED"]);

export const items = pgTable(
  "items",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    type: itemType("type").notNull(),
    status: itemStatus("status").notNull().default("PENDING"),
    category: text("category").notNull(),
    location: text("location").notNull(),
    colour: text("colour"),
    brand: text("brand"),
    description: text("description").notNull(),
    referenceNumber: text("reference_number").notNull().unique(),
    reportedDate: timestamp("reported_date", { withTimezone: true }).notNull(),
    eventDate: text("event_date"),
    eventTime: text("event_time"),
    landmark: text("landmark"),
    storageOption: text("storage_option"),
    reportSource: text("report_source").notNull().default("USER"),
    reportedById: text("reported_by_id").references(() => user.id, { onDelete: "set null" }),
    hiddenVerificationDetails: text("hidden_verification_details"),
    privateOwnerNotes: text("private_owner_notes"),
    adminNotes: text("admin_notes"),
    removedReason: text("removed_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("items_public_search_idx").on(table.status, table.type, table.category),
    index("items_reported_date_idx").on(table.reportedDate),
    index("items_reported_by_idx").on(table.reportedById)
  ]
);

export const claims = pgTable(
  "claims",
  {
    id: text("id").primaryKey(),
    itemId: text("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    claimantId: text("claimant_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: claimStatus("status").notNull().default("SUBMITTED"),
    referenceNumber: text("reference_number").notNull().unique(),
    proofDescription: text("proof_description").notNull(),
    hiddenDetails: text("hidden_details").notNull(),
    evidenceImageUrl: text("evidence_image_url"),
    evidenceImagePublicId: text("evidence_image_public_id"),
    adminNotes: text("admin_notes"),
    pickupLocation: text("pickup_location"),
    pickupCode: text("pickup_code"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("claims_item_id_idx").on(table.itemId),
    index("claims_claimant_id_idx").on(table.claimantId),
    index("claims_status_idx").on(table.status)
  ]
);

export const itemImages = pgTable(
  "item_images",
  {
    id: text("id").primaryKey(),
    itemId: text("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt"),
    isPrimary: boolean("is_primary").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [index("item_images_item_id_idx").on(table.itemId)]
);

export const savedItems = pgTable(
  "saved_items",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    itemId: text("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("saved_items_user_item_idx").on(table.userId, table.itemId),
    index("saved_items_user_id_idx").on(table.userId),
    index("saved_items_item_id_idx").on(table.itemId)
  ]
);

export const adminLogs = pgTable(
  "admin_logs",
  {
    id: text("id").primaryKey(),
    adminId: text("admin_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("admin_logs_admin_id_idx").on(table.adminId),
    index("admin_logs_entity_idx").on(table.entityType, table.entityId),
    index("admin_logs_created_at_idx").on(table.createdAt)
  ]
);

export const notifications = pgTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    actionUrl: text("action_url"),
    metadata: jsonb("metadata"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("notifications_user_id_idx").on(table.userId),
    index("notifications_created_at_idx").on(table.createdAt)
  ]
);

export const notificationDeliveries = pgTable(
  "notification_deliveries",
  {
    id: text("id").primaryKey(),
    notificationId: text("notification_id").references(() => notifications.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(),
    channel: notificationChannel("channel").notNull(),
    recipient: text("recipient"),
    status: notificationDeliveryStatus("status").notNull().default("PENDING"),
    providerMessageId: text("provider_message_id"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    sentAt: timestamp("sent_at", { withTimezone: true })
  },
  (table) => [
    index("notification_deliveries_notification_idx").on(table.notificationId),
    index("notification_deliveries_user_idx").on(table.userId),
    index("notification_deliveries_event_idx").on(table.eventType),
    index("notification_deliveries_status_idx").on(table.status)
  ]
);

export const pushTokens = pgTable(
  "push_tokens",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    platform: text("platform"),
    deviceName: text("device_name"),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("push_tokens_token_idx").on(table.token),
    index("push_tokens_user_idx").on(table.userId)
  ]
);
