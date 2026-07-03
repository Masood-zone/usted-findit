import { internalServerErrorResponse, notFoundResponse, successResponse } from "@/lib/api-response";
import { getAdminUser } from "@/lib/admin/admin.server";
import { guardErrorResponse, requireAdmin } from "@/lib/auth-guards.server";

type RouteContext = {
  userId: string;
};

export async function GET(request: Request, { userId }: RouteContext) {
  try {
    await requireAdmin(request);
    const adminUser = await getAdminUser(userId);

    if (!adminUser) return notFoundResponse("This user is unavailable.");
    return successResponse({ user: adminUser });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
