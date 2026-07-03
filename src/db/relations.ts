import { relations } from "drizzle-orm";
import { account, adminLogs, claims, itemImages, items, notificationDeliveries, notifications, profileUpdateRequests, pushTokens, savedItems, session, user } from "./schema";

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  claims: many(claims),
  adminLogs: many(adminLogs),
  notifications: many(notifications),
  notificationDeliveries: many(notificationDeliveries),
  profileUpdateRequests: many(profileUpdateRequests),
  pushTokens: many(pushTokens),
  reportedItems: many(items),
  savedItems: many(savedItems)
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id]
  })
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id]
  })
}));

export const itemRelations = relations(items, ({ many, one }) => ({
  claims: many(claims),
  images: many(itemImages),
  savedBy: many(savedItems),
  reportedBy: one(user, {
    fields: [items.reportedById],
    references: [user.id]
  })
}));

export const itemImageRelations = relations(itemImages, ({ one }) => ({
  item: one(items, {
    fields: [itemImages.itemId],
    references: [items.id]
  })
}));

export const savedItemRelations = relations(savedItems, ({ one }) => ({
  item: one(items, {
    fields: [savedItems.itemId],
    references: [items.id]
  }),
  user: one(user, {
    fields: [savedItems.userId],
    references: [user.id]
  })
}));

export const claimRelations = relations(claims, ({ one }) => ({
  item: one(items, {
    fields: [claims.itemId],
    references: [items.id]
  }),
  claimant: one(user, {
    fields: [claims.claimantId],
    references: [user.id]
  })
}));

export const profileUpdateRequestRelations = relations(profileUpdateRequests, ({ one }) => ({
  user: one(user, {
    fields: [profileUpdateRequests.userId],
    references: [user.id]
  })
}));

export const adminLogRelations = relations(adminLogs, ({ one }) => ({
  admin: one(user, {
    fields: [adminLogs.adminId],
    references: [user.id]
  })
}));

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(user, {
    fields: [notifications.userId],
    references: [user.id]
  })
}));

export const notificationDeliveryRelations = relations(notificationDeliveries, ({ one }) => ({
  notification: one(notifications, {
    fields: [notificationDeliveries.notificationId],
    references: [notifications.id]
  }),
  user: one(user, {
    fields: [notificationDeliveries.userId],
    references: [user.id]
  })
}));

export const pushTokenRelations = relations(pushTokens, ({ one }) => ({
  user: one(user, {
    fields: [pushTokens.userId],
    references: [user.id]
  })
}));
