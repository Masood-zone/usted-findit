export type NotificationEventType =
  | "REPORT_SUBMITTED"
  | "ADMIN_REPORT_SUBMITTED"
  | "REPORT_UPDATED"
  | "POSSIBLE_MATCHES_FOUND"
  | "REPORT_APPROVED"
  | "REPORT_REJECTED"
  | "REPORT_CHANGES_REQUESTED"
  | "REPORT_REMOVED"
  | "REPORT_RESOLVED"
  | "CLAIM_SUBMITTED"
  | "ADMIN_CLAIM_SUBMITTED"
  | "CLAIM_APPROVED"
  | "CLAIM_REJECTED"
  | "ITEM_CLAIMED";

export type NotificationChannel = "IN_APP" | "EMAIL" | "SMS" | "PUSH";

export type NotificationRecipient = {
  email?: string | null;
  name: string;
  phone?: string | null;
  userId: string;
};

export type NotificationMessage = {
  actionUrl?: string;
  channels: NotificationChannel[];
  emailHtml?: string;
  emailText: string;
  message: string;
  metadata?: Record<string, unknown>;
  smsText?: string;
  subject: string;
  title: string;
  type: NotificationEventType;
};

export type ReportNotificationPayload = {
  adminMessage?: string;
  claimId?: string;
  claimReferenceNumber?: string;
  itemId: string;
  itemTitle: string;
  pickupCode?: string;
  pickupLocation?: string;
  reason?: string;
  referenceNumber: string;
  reportType?: "LOST" | "FOUND";
};
