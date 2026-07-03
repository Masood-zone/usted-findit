type ExpoPushMessage = {
  body: string;
  data?: Record<string, unknown>;
  sound?: "default";
  title: string;
  to: string;
};

export async function sendExpoPushNotifications(messages: ExpoPushMessage[]) {
  if (!messages.length) return [];

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    body: JSON.stringify(messages),
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`Expo push provider returned ${response.status}`);
  }

  const body = (await response.json().catch(() => null)) as { data?: { id?: string; status?: string }[] } | null;
  return body?.data ?? [];
}
