import { z } from "zod";
import { errorResponse, internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { guardErrorResponse, requireUser } from "@/lib/auth-guards.server";
import { upsertPushToken } from "@/services/notifications/notification-service.server";

const pushTokenSchema = z.object({
  deviceName: z.string().optional().nullable(),
  platform: z.string().optional().nullable(),
  token: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const context = await requireUser(request);
    const parsed = pushTokenSchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
      return errorResponse("INVALID_PUSH_TOKEN", "Unable to register this device for notifications.");
    }

    return successResponse(await upsertPushToken(context.user.id, parsed.data));
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
