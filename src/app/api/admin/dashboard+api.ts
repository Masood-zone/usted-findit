import { internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { getAdminDashboard } from "@/lib/admin/admin.server";
import { guardErrorResponse, requireAdmin } from "@/lib/auth-guards.server";

export async function GET(request: Request) {
  try {
    const context = await requireAdmin(request);
    const dashboard = await getAdminDashboard(context.user);
    return successResponse(dashboard);
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
