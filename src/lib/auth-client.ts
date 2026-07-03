import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import type { AuthSessionUser } from "@/types/auth";
import type { Href } from "expo-router";
import { clearStoredSessionToken, getStoredSessionToken, setStoredSessionToken } from "./auth-session-token";
import { getApiBaseUrl } from "./env";

type AuthTokenResult = {
  token?: string | null;
};

type BetterFetchSuccessContext = {
  response: Response;
  data?: AuthTokenResult;
  request: {
    url: string | URL;
  };
};

type BetterFetchInitOptions = {
  headers?: Record<string, string | undefined> | Headers;
} & Record<string, unknown>;

type AuthClientWithCookie = ReturnType<typeof createAuthClient> & {
  getCookie: () => string;
};

function withBearerHeader(headers: BetterFetchInitOptions["headers"], token: string) {
  const nextHeaders =
    headers instanceof Headers
      ? Object.fromEntries(headers.entries())
      : Object.fromEntries(
          Object.entries(headers ?? {}).filter((entry): entry is [string, string] => typeof entry[1] === "string")
        );

  return {
    ...nextHeaders,
    Authorization: `Bearer ${token}`
  };
}

function ustedBearerClient() {
  return {
    id: "usted-findit-bearer-session",
    fetchPlugins: [
      {
        id: "usted-findit-bearer-session",
        name: "USTED FindIt Bearer Session",
        hooks: {
          async onSuccess(context: BetterFetchSuccessContext) {
            const token = context.response.headers.get("set-auth-token") ?? context.data?.token;

            if (token) {
              await setStoredSessionToken(token);
            }

            if (context.request.url.toString().includes("/sign-out")) {
              await clearStoredSessionToken();
            }
          }
        },
        async init(url: string, options?: BetterFetchInitOptions) {
          const token = getStoredSessionToken();

          if (!token) {
            return { url, options };
          }

          return {
            url,
            options: {
              ...options,
              headers: withBearerHeader(options?.headers, token)
            }
          };
        }
      }
    ]
  };
}

export const authClient = createAuthClient({
  baseURL: `${getApiBaseUrl()}/api/auth`,
  plugins: [
    expoClient({
      scheme: "ustedfindit",
      storagePrefix: "usted-findit",
      storage: SecureStore
    }),
    ustedBearerClient()
  ]
}) as AuthClientWithCookie;

export const useSession = authClient.useSession;
export const getCookie = authClient.getCookie;

type AuthClientResult<TData = unknown> = {
  data?: TData;
  error?: { message?: string } | null;
};

function unwrapAuthResult<TData>(result: AuthClientResult<TData>) {
  if (result.error) {
    throw result.error;
  }

  return result.data;
}

export type SignUpInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  institutionId?: string;
};

export type SignInInput = {
  email: string;
  password: string;
};

export function getAuthUserHomeHref(user?: { accountStatus?: string | null; role?: string | null } | null): Href {
  if (!user) {
    return "/sign-in" as Href;
  }

  if (user.accountStatus !== "ACTIVE") {
    return "/account-status" as Href;
  }

  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
    return "/admin" as Href;
  }

  return "/user" as Href;
}

export async function getSession() {
  return unwrapAuthResult(await authClient.getSession());
}

export async function signUp(input: SignUpInput) {
  const data = unwrapAuthResult(await authClient.signUp.email(input));
  await setStoredSessionToken((data as AuthTokenResult | undefined)?.token);
  return data;
}

export async function signIn(input: SignInInput) {
  const data = unwrapAuthResult(await authClient.signIn.email(input));
  await setStoredSessionToken((data as AuthTokenResult | undefined)?.token);
  return data;
}


export async function signOut() {
  await clearStoredSessionToken();
  return authClient.signOut();
}

export function useTypedSession() {
  return useSession() as ReturnType<typeof useSession> & {
    data?: {
      user: AuthSessionUser;
      session: unknown;
    } | null;
  };
}
