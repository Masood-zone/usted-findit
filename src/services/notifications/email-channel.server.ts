import nodemailer from "nodemailer";

type SendEmailInput = {
  html?: string;
  subject: string;
  text: string;
  to: string;
};

function createTransporter() {
  const host = process.env.USTED_SMTP_HOST || process.env.SMTP_HOST || "smtp.gmail.com";
  const secure = (process.env.USTED_SMTP_SECURE || process.env.SMTP_SECURE) === "true";
  const user = process.env.USTED_SMTP_USER || process.env.SMTP_USER || "";
  const pass = process.env.USTED_SMTP_PASS || process.env.SMTP_PASS || "";

  if (host === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      secure,
      auth: { pass, user }
    });
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.USTED_SMTP_PORT || process.env.SMTP_PORT || 587),
    secure,
    auth: { pass, user }
  });
}

export async function sendNotificationEmail(input: SendEmailInput) {
  const user = process.env.USTED_SMTP_USER || process.env.SMTP_USER;
  const pass = process.env.USTED_SMTP_PASS || process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error("SMTP credentials are missing");
  }

  const transporter = createTransporter();
  const result = await transporter.sendMail({
    from: process.env.USTED_SMTP_FROM || process.env.SMTP_FROM || user,
    html: input.html,
    subject: input.subject,
    text: input.text,
    to: input.to
  });

  return result.messageId;
}
