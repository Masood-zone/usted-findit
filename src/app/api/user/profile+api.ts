import { guardErrorResponse, requireUser } from "@/lib/auth-guards.server";
import { internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { getProfileData } from "@/lib/user/items.server";

export async function GET(request: Request) {
  try {
    const context = await requireUser(request);
    const profile = await getProfileData(context.user.id, context.user);

    return successResponse(profile);
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
