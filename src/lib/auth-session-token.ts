import * as SecureStore from "expo-secure-store";

const SESSION_TOKEN_KEY = "usted_findit_session_token";

export function getStoredSessionToken() {
  return SecureStore.getItem(SESSION_TOKEN_KEY);
}

export async function setStoredSessionToken(token: string | null | undefined) {
  if (!token) {
    return;
  }

  await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
}

export async function clearStoredSessionToken() {
  await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
}
