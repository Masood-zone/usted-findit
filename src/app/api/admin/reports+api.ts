import { internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { getAdminReportFiltersFromUrl, getAdminReports } from "@/lib/admin/admin.server";
import { guardErrorResponse, requireAdmin } from "@/lib/auth-guards.server";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const reports = await getAdminReports(getAdminReportFiltersFromUrl(request));
    return successResponse({ reports });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
