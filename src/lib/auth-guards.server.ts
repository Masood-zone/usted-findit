import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { session, user } from "@/db/schema";
import { forbiddenResponse, suspendedResponse, unauthorizedResponse } from "@/lib/api-response";
import type { AppRole, AuthSessionUser } from "@/types/auth";

export type AuthenticatedContext = {
  session: typeof session.$inferSelect;
  user: AuthSessionUser;
};

export class ApiGuardError extends Error {
  constructor(public response: Response) {
    super("API guard failed");
  }
}

function parseCookies(value: string | null) {
  const cookies = new Map<string, string>();
  if (!value) return cookies;

  for (const entry of value.split(";")) {
    const [name, ...rest] = entry.trim().split("=");
    if (!name || !rest.length) continue;
    cookies.set(name, decodeURIComponent(rest.join("=")));
  }

  return cookies;
}

function getRequestSessionToken(headers: Headers) {
  const authorization = headers.get("authorization");
  const bearer = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  if (bearer) return bearer;

  const cookieHeader = headers.get("cookie") || headers.get("x-usted-findit-auth-cookie");
  const cookies = parseCookies(cookieHeader);

  return (
    cookies.get("better-auth.session_token") ||
    cookies.get("__Secure-better-auth.session_token") ||
    cookies.get("better-auth.session-token") ||
    cookies.get("__Secure-better-auth.session-token") ||
    null
  );
}

export async function getAuthenticatedUser(request: Request): Promise<AuthenticatedContext | null> {
  const token = getRequestSessionToken(request.headers);

  if (!token) {
    return null;
  }

  const row = (
    await db
      .select({ session, user })
      .from(session)
      .innerJoin(user, eq(session.userId, user.id))
      .where(and(eq(session.token, token), gt(session.expiresAt, new Date())))
      .limit(1)
  )[0];

  if (!row) {
    return null;
  }

  return {
    session: row.session,
    user: row.user as AuthSessionUser
  };
}

export async function requireSession(request: Request) {
  const context = await getAuthenticatedUser(request);

  if (!context) {
    throw new ApiGuardError(unauthorizedResponse());
  }

  if (context.user.accountStatus === "SUSPENDED") {
    throw new ApiGuardError(suspendedResponse());
  }

  return context;
}

export async function requireRole(request: Request, roles: readonly AppRole[]) {
  const context = await requireSession(request);

  if (!roles.includes(context.user.role)) {
    throw new ApiGuardError(forbiddenResponse());
  }

  return context;
}

export function guardErrorResponse(error: unknown) {
  if (error instanceof ApiGuardError) {
    return error.response;
  }

  throw error;
}

export function requireUser(request: Request) {
  return requireRole(request, ["USER"]);
}

export function requireAdmin(request: Request) {
  return requireRole(request, ["ADMIN", "SUPER_ADMIN"]);
}
