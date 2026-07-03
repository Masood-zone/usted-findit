import { z } from "zod";
import { errorResponse, internalServerErrorResponse, notFoundResponse, successResponse } from "@/lib/api-response";
import { requestReportChanges } from "@/lib/admin/admin.server";
import { guardErrorResponse, requireAdmin } from "@/lib/auth-guards.server";

const actionSchema = z.object({
  message: z.string().min(1)
});

type RouteContext = {
  reportId: string;
};

export async function PATCH(request: Request, { reportId }: RouteContext) {
  try {
    const context = await requireAdmin(request);
    const parsed = actionSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return errorResponse("INVALID_CHANGE_MESSAGE", "Enter the changes needed.");

    const report = await requestReportChanges(context.user, reportId, parsed.data.message);
    if (!report) return notFoundResponse("This report cannot be updated.");
    return successResponse({ report });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
