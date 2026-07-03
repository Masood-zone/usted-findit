import { guardErrorResponse, requireUser } from "@/lib/auth-guards.server";
import { internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { getDashboardData } from "@/lib/user/items.server";

export async function GET(request: Request) {
  try {
    const context = await requireUser(request);
    const dashboard = await getDashboardData(context.user.id, context.user.name);

    return successResponse(dashboard);
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
