import type { ApiErrorBody, ApiSuccessBody } from "@/types/api";

export function successResponse<TData>(data: TData, init?: ResponseInit) {
  return Response.json(
    {
      success: true,
      data
    } satisfies ApiSuccessBody<TData>,
    init
  );
}

export function errorResponse(code: string, message: string, status = 400) {
  return Response.json(
    {
      success: false,
      error: {
        code,
        message
      }
    } satisfies ApiErrorBody,
    { status }
  );
}

export function unauthorizedResponse() {
  return errorResponse("UNAUTHORIZED", "Please sign in to continue.", 401);
}

export function forbiddenResponse() {
  return errorResponse("FORBIDDEN", "You do not have permission to access this resource.", 403);
}

export function notFoundResponse(message = "The requested resource was not found.") {
  return errorResponse("NOT_FOUND", message, 404);
}

export function suspendedResponse() {
  return errorResponse("ACCOUNT_SUSPENDED", "This account is currently suspended.", 403);
}

export function internalServerErrorResponse() {
  return errorResponse("INTERNAL_SERVER_ERROR", "Something went wrong on our end.", 500);
}
