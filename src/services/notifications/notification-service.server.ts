import { and, count, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import { notificationDeliveries, notifications, pushTokens, user } from "@/db/schema";
import { buildNotificationMessage } from "./notification-theme";
import { sendNotificationEmail } from "./email-channel.server";
import { sendExpoPushNotifications } from "./push-channel.server";
import { sendNotificationSms } from "./sms-channel.server";
import type { NotificationChannel, NotificationMessage, NotificationRecipient, ReportNotificationPayload } from "./notification-events";

type PushTokenInput = {
  deviceName?: string | null;
  platform?: string | null;
  token: string;
};

function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Notification delivery failed";
}

async function recordDelivery(input: {
  channel: NotificationChannel;
  error?: string;
  eventType: string;
  notificationId?: string | null;
  providerMessageId?: string | null;
  recipient?: string | null;
  status: "SENT" | "FAILED" | "SKIPPED";
  userId?: string | null;
}) {
  await db.insert(notificationDeliveries).values({
    channel: input.channel,
    errorMessage: input.error ?? null,
    eventType: input.eventType,
    id: id("delivery"),
    notificationId: input.notificationId ?? null,
    providerMessageId: input.providerMessageId ?? null,
    recipient: input.recipient ?? null,
    sentAt: input.status === "SENT" ? new Date() : null,
    status: input.status,
    userId: input.userId ?? null
  });
}

async function resolveUser(userId: string | null | undefined): Promise<NotificationRecipient | null> {
  if (!userId) return null;

  const row = (await db.select().from(user).where(eq(user.id, userId)).limit(1))[0];
  if (!row) return null;

  return {
    email: row.email,
    name: row.name,
    phone: row.phone,
    userId: row.id
  };
}

export async function getAdminNotificationRecipients(): Promise<NotificationRecipient[]> {
  const rows = await db
    .select()
    .from(user)
    .where(and(inArray(user.role, ["ADMIN", "SUPER_ADMIN"]), eq(user.accountStatus, "ACTIVE")));

  return rows.map((row) => ({
    email: row.email,
    name: row.name,
    phone: row.phone,
    userId: row.id
  }));
}

export async function dispatchNotification(recipients: (NotificationRecipient | null)[], message: NotificationMessage) {
  const uniqueRecipients = new Map<string, NotificationRecipient>();

  for (const recipient of recipients) {
    if (recipient) uniqueRecipients.set(recipient.userId, recipient);
  }

  await Promise.all([...uniqueRecipients.values()].map((recipient) => dispatchToRecipient(recipient, message)));
}

async function dispatchToRecipient(recipient: NotificationRecipient, message: NotificationMessage) {
  let notificationId: string | null = null;

  if (message.channels.includes("IN_APP")) {
    notificationId = id("notif");
    try {
      await db.insert(notifications).values({
        actionUrl: message.actionUrl ?? null,
        id: notificationId,
        message: message.message,
        metadata: message.metadata ?? null,
        title: message.title,
        type: message.type,
        userId: recipient.userId
      });
      await recordDelivery({ channel: "IN_APP", eventType: message.type, notificationId, recipient: recipient.userId, status: "SENT", userId: recipient.userId });
    } catch (error) {
      await recordDelivery({ channel: "IN_APP", error: errorMessage(error), eventType: message.type, notificationId, recipient: recipient.userId, status: "FAILED", userId: recipient.userId });
    }
  }

  if (message.channels.includes("EMAIL")) {
    if (!recipient.email) {
      await recordDelivery({ channel: "EMAIL", eventType: message.type, notificationId, status: "SKIPPED", userId: recipient.userId });
    } else {
      try {
        const providerMessageId = await sendNotificationEmail({
          html: message.emailHtml,
          subject: message.subject,
          text: message.emailText,
          to: recipient.email
        });
        await recordDelivery({ channel: "EMAIL", eventType: message.type, notificationId, providerMessageId, recipient: recipient.email, status: "SENT", userId: recipient.userId });
      } catch (error) {
        await recordDelivery({ channel: "EMAIL", error: errorMessage(error), eventType: message.type, notificationId, recipient: recipient.email, status: "FAILED", userId: recipient.userId });
      }
    }
  }

  if (message.channels.includes("SMS")) {
    if (!recipient.phone || !message.smsText) {
      await recordDelivery({ channel: "SMS", eventType: message.type, notificationId, status: "SKIPPED", userId: recipient.userId });
    } else {
      try {
        const providerMessageId = await sendNotificationSms({ message: message.smsText, to: recipient.phone });
        await recordDelivery({ channel: "SMS", eventType: message.type, notificationId, providerMessageId, recipient: recipient.phone, status: "SENT", userId: recipient.userId });
      } catch (error) {
        await recordDelivery({ channel: "SMS", error: errorMessage(error), eventType: message.type, notificationId, recipient: recipient.phone, status: "FAILED", userId: recipient.userId });
      }
    }
  }

  if (message.channels.includes("PUSH")) {
    const tokens = await db.select().from(pushTokens).where(eq(pushTokens.userId, recipient.userId));

    if (!tokens.length) {
      await recordDelivery({ channel: "PUSH", eventType: message.type, notificationId, status: "SKIPPED", userId: recipient.userId });
    } else {
      try {
        const tickets = await sendExpoPushNotifications(
          tokens.map((token) => ({
            body: message.message,
            data: { actionUrl: message.actionUrl, notificationId, type: message.type },
            sound: "default",
            title: message.title,
            to: token.token
          }))
        );

        await Promise.all(
          tokens.map((token, index) =>
            recordDelivery({
              channel: "PUSH",
              eventType: message.type,
              notificationId,
              providerMessageId: tickets[index]?.id ?? null,
              recipient: token.token,
              status: tickets[index]?.status === "error" ? "FAILED" : "SENT",
              userId: recipient.userId
            })
          )
        );
      } catch (error) {
        await Promise.all(
          tokens.map((token) =>
            recordDelivery({ channel: "PUSH", error: errorMessage(error), eventType: message.type, notificationId, recipient: token.token, status: "FAILED", userId: recipient.userId })
          )
        );
      }
    }
  }
}

export async function notifyUserById(userId: string | null | undefined, message: NotificationMessage) {
  await dispatchNotification([await resolveUser(userId)], message);
}

export async function notifyAdmins(message: NotificationMessage) {
  await dispatchNotification(await getAdminNotificationRecipients(), message);
}

export async function notifyReportSubmitted(userId: string, payload: ReportNotificationPayload) {
  await notifyUserById(
    userId,
    buildNotificationMessage({
      channels: ["IN_APP", "EMAIL", "PUSH"],
      eventType: "REPORT_SUBMITTED",
      message: `Your ${payload.reportType?.toLowerCase() ?? "item"} report for ${payload.itemTitle} was submitted and is pending review. Reference: ${payload.referenceNumber}.`,
      payload,
      subject: `Report submitted: ${payload.itemTitle}`,
      title: "Report submitted"
    })
  );

  await notifyAdmins(
    buildNotificationMessage({
      channels: ["IN_APP", "EMAIL"],
      eventType: "ADMIN_REPORT_SUBMITTED",
      message: `A new ${payload.reportType?.toLowerCase() ?? "item"} report for ${payload.itemTitle} needs review. Reference: ${payload.referenceNumber}.`,
      payload,
      subject: `New report awaiting review: ${payload.itemTitle}`,
      title: "New report awaiting review"
    })
  );
}

export async function notifyClaimSubmitted(claimantId: string, reporterId: string | null, payload: ReportNotificationPayload) {
  const reportPayload = { ...payload, claimId: undefined };

  await notifyUserById(
    claimantId,
    buildNotificationMessage({
      channels: ["IN_APP", "EMAIL", "PUSH"],
      eventType: "CLAIM_SUBMITTED",
      message: `Your claim for ${payload.itemTitle} was submitted for staff review. Claim reference: ${payload.claimReferenceNumber}.`,
      payload,
      subject: `Claim submitted: ${payload.itemTitle}`,
      title: "Claim submitted"
    })
  );

  await notifyUserById(
    reporterId,
    buildNotificationMessage({
      channels: ["IN_APP", "EMAIL", "PUSH"],
      eventType: "ADMIN_CLAIM_SUBMITTED",
      message: `Someone submitted a claim for your report ${payload.itemTitle}. Staff will review the proof before release.`,
      payload: reportPayload,
      subject: `New claim on ${payload.itemTitle}`,
      title: "New claim received"
    })
  );

  await notifyAdmins(
    buildNotificationMessage({
      channels: ["IN_APP", "EMAIL"],
      eventType: "ADMIN_CLAIM_SUBMITTED",
      message: `A new claim for ${payload.itemTitle} needs review. Claim reference: ${payload.claimReferenceNumber}.`,
      payload: reportPayload,
      subject: `New claim awaiting review: ${payload.itemTitle}`,
      title: "New claim awaiting review"
    })
  );
}

export async function notifyPossibleMatches(userId: string, payload: ReportNotificationPayload & { matchCount: number }) {
  await notifyUserById(
    userId,
    buildNotificationMessage({
      channels: ["IN_APP", "PUSH"],
      eventType: "POSSIBLE_MATCHES_FOUND",
      message: `${payload.matchCount} possible match${payload.matchCount === 1 ? "" : "es"} found for ${payload.itemTitle}.`,
      payload,
      subject: `Possible matches found for ${payload.itemTitle}`,
      title: "Possible matches found"
    })
  );
}

export async function upsertPushToken(userId: string, input: PushTokenInput) {
  const tokenId = id("push");

  await db
    .insert(pushTokens)
    .values({
      deviceName: input.deviceName ?? null,
      id: tokenId,
      lastUsedAt: new Date(),
      platform: input.platform ?? null,
      token: input.token,
      userId
    })
    .onConflictDoUpdate({
      set: {
        deviceName: input.deviceName ?? null,
        lastUsedAt: new Date(),
        platform: input.platform ?? null,
        userId
      },
      target: pushTokens.token
    });

  return { token: input.token };
}

export async function getUserNotifications(userId: string) {
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  const unreadRows = await db
    .select({ value: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));

  return {
    notifications: rows.map((row) => ({
      actionUrl: row.actionUrl,
      createdAt: row.createdAt.toISOString(),
      id: row.id,
      message: row.message,
      metadata: row.metadata,
      readAt: row.readAt?.toISOString() ?? null,
      title: row.title,
      type: row.type
    })),
    unreadCount: unreadRows[0]?.value ?? 0
  };
}

export async function markNotificationRead(userId: string, notificationId: string) {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId), isNull(notifications.readAt)));

  return getUserNotifications(userId);
}

export async function markAllNotificationsRead(userId: string) {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));

  return getUserNotifications(userId);
}

export async function getUnreadNotificationCount(userId: string) {
  const rows = await db
    .select({ value: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));

  return rows[0]?.value ?? 0;
}
