import { internalServerErrorResponse, notFoundResponse, successResponse } from "@/lib/api-response";
import { getAdminReport } from "@/lib/admin/admin.server";
import { guardErrorResponse, requireAdmin } from "@/lib/auth-guards.server";

type RouteContext = {
  reportId: string;
};

export async function GET(request: Request, { reportId }: RouteContext) {
  try {
    await requireAdmin(request);
    const report = await getAdminReport(reportId);

    if (!report) return notFoundResponse("This report is unavailable.");
    return successResponse({ report });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
