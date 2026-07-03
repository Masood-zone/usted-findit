import Constants from "expo-constants";

const fallbackApiUrl = "http://localhost:8081";

function getExpoHostApiUrl() {
  const hostUri = Constants.expoConfig?.hostUri;

  if (!hostUri) {
    return null;
  }

  const host = hostUri.split(":")[0];

  if (!host) {
    return null;
  }

  return `http://${host}:8081`;
}

function isLocalhostUrl(value: string) {
  return value.includes("://localhost") || value.includes("://127.0.0.1");
}

export function getApiBaseUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl || fallbackApiUrl;
  const expoHostUrl = getExpoHostApiUrl();

  if (expoHostUrl && isLocalhostUrl(configuredUrl)) {
    return expoHostUrl;
  }

  return configuredUrl;
}

export function getAppEnv() {
  return process.env.EXPO_PUBLIC_APP_ENV || "development";
}
