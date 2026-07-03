import { internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { guardErrorResponse, requireUser } from "@/lib/auth-guards.server";
import { markNotificationRead } from "@/services/notifications/notification-service.server";

type RouteContext = {
  notificationId: string;
};

export async function PATCH(request: Request, { notificationId }: RouteContext) {
  try {
    const context = await requireUser(request);
    return successResponse(await markNotificationRead(context.user.id, notificationId));
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
