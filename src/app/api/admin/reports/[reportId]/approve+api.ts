import { z } from "zod";
import { errorResponse, internalServerErrorResponse, notFoundResponse, successResponse } from "@/lib/api-response";
import { approveReport } from "@/lib/admin/admin.server";
import { guardErrorResponse, requireAdmin } from "@/lib/auth-guards.server";

const actionSchema = z.object({
  adminNotes: z.string().optional()
});

type RouteContext = {
  reportId: string;
};

export async function PATCH(request: Request, { reportId }: RouteContext) {
  try {
    const context = await requireAdmin(request);
    const parsed = actionSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return errorResponse("INVALID_ADMIN_ACTION", "Unable to approve this report.");

    const report = await approveReport(context.user, reportId, parsed.data.adminNotes);
    if (!report) return notFoundResponse("This report cannot be approved.");
    return successResponse({ report });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
