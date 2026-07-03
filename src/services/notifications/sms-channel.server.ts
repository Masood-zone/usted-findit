type SendSmsInput = {
  message: string;
  to: string;
};

function formatPhoneNumber(phoneNumber: string) {
  const cleaned = phoneNumber.replace(/\D/g, "");

  if ((cleaned.length === 10 || cleaned.length === 11) && cleaned.startsWith("0")) {
    return `233${cleaned.substring(1)}`;
  }

  return cleaned;
}

export async function sendNotificationSms(input: SendSmsInput) {
  const apiKey = process.env.USTED_UELLOSEND_API_KEY || process.env.UELLOSEND_API_KEY;
  const senderId = process.env.USTED_UELLOSEND_SENDER_ID || process.env.UELLOSEND_SENDER_ID || "USTED";
  const baseUrl = process.env.USTED_UELLOSEND_API_URL || process.env.UELLOSEND_API_URL || process.env.UELLOSEND_BASE_URL || "https://uellosend.com/quicksend/";

  if (!apiKey) {
    throw new Error("UelloSend API key is missing");
  }

  const response = await fetch(baseUrl, {
    body: JSON.stringify({
      api_key: apiKey,
      message: input.message,
      recipient: formatPhoneNumber(input.to),
      sender_id: senderId
    }),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`SMS provider returned ${response.status}`);
  }

  return response.headers.get("x-message-id") ?? undefined;
}
