import { internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { guardErrorResponse, requireUser } from "@/lib/auth-guards.server";
import { getUserNotifications, markAllNotificationsRead } from "@/services/notifications/notification-service.server";

export async function GET(request: Request) {
  try {
    const context = await requireUser(request);
    return successResponse(await getUserNotifications(context.user.id));
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}

export async function PATCH(request: Request) {
  try {
    const context = await requireUser(request);
    return successResponse(await markAllNotificationsRead(context.user.id));
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
