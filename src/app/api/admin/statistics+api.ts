import { internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { getAdminStatistics } from "@/lib/admin/admin.server";
import { guardErrorResponse, requireAdmin } from "@/lib/auth-guards.server";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const statistics = await getAdminStatistics();
    return successResponse(statistics);
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
