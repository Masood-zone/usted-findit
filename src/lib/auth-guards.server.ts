import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { forbiddenResponse, suspendedResponse, unauthorizedResponse } from "@/lib/api-response";
import type { AppRole, AuthSessionUser } from "@/types/auth";

export type AuthenticatedContext = {
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
  user: AuthSessionUser;
};

export class ApiGuardError extends Error {
  constructor(public response: Response) {
    super("API guard failed");
  }
}

function getSessionHeaders(headers: Headers) {
  const sessionHeaders = new Headers(headers);
  const cookie = sessionHeaders.get("cookie");
  const forwardedCookie = sessionHeaders.get("x-usted-findit-auth-cookie");

  if (!cookie && forwardedCookie) {
    sessionHeaders.set("cookie", forwardedCookie);
  }

  return sessionHeaders;
}

export async function getAuthenticatedUser(request: Request): Promise<AuthenticatedContext | null> {
  const session = await auth.api.getSession({
    headers: getSessionHeaders(request.headers)
  });

  if (!session?.user?.id) {
    return null;
  }

  const currentUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id)
  });

  if (!currentUser) {
    return null;
  }

  return {
    session,
    user: currentUser as AuthSessionUser
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
