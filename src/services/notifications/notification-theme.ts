import type { NotificationEventType, NotificationMessage, ReportNotificationPayload } from "./notification-events";

export const notificationTheme = {
  appName: "USTED FindIt",
  fromName: "USTED FindIt",
  primary: "#680029",
  surface: "#fff8f7"
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function appUrl(path: string) {
  const baseUrl =
    process.env.EXPO_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.BETTER_AUTH_URL ||
    "";

  return baseUrl ? `${baseUrl.replace(/\/$/, "")}${path}` : path;
}

export function notificationEmailHtml(args: { body: string; ctaLabel?: string; ctaUrl?: string; title: string }) {
  const cta = args.ctaUrl
    ? `<a href="${escapeHtml(args.ctaUrl)}" style="background:${notificationTheme.primary};border-radius:8px;color:#fff;display:inline-block;margin-top:20px;padding:12px 18px;text-decoration:none">${escapeHtml(args.ctaLabel ?? "Open USTED FindIt")}</a>`
    : "";

  return `
    <div style="background:${notificationTheme.surface};font-family:Arial,sans-serif;padding:24px">
      <div style="background:#fff;border:1px solid #eadadd;border-radius:12px;margin:0 auto;max-width:560px;padding:24px">
        <p style="color:${notificationTheme.primary};font-size:13px;font-weight:700;letter-spacing:.04em;margin:0 0 12px;text-transform:uppercase">${notificationTheme.appName}</p>
        <h1 style="color:#1c1c1c;font-size:22px;margin:0 0 12px">${escapeHtml(args.title)}</h1>
        <p style="color:#474747;font-size:15px;line-height:1.6;margin:0">${escapeHtml(args.body)}</p>
        ${cta}
      </div>
    </div>
  `;
}

type BuildMessageOptions = {
  channels?: NotificationMessage["channels"];
  eventType: NotificationEventType;
  message: string;
  payload: ReportNotificationPayload;
  smsText?: string;
  subject: string;
  title: string;
};

export function buildNotificationMessage(options: BuildMessageOptions): NotificationMessage {
  const actionUrl = appUrl(options.payload.claimId ? `/user/claims/${options.payload.claimId}` : `/user/reports/${options.payload.itemId}`);

  return {
    actionUrl,
    channels: options.channels ?? ["IN_APP", "EMAIL", "PUSH"],
    emailHtml: notificationEmailHtml({
      body: options.message,
      ctaUrl: actionUrl,
      title: options.title
    }),
    emailText: options.message,
    message: options.message,
    metadata: options.payload,
    smsText: options.smsText,
    subject: options.subject,
    title: options.title,
    type: options.eventType
  };
}
