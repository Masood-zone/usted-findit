import { z } from "zod";
import { errorResponse, internalServerErrorResponse, notFoundResponse, successResponse } from "@/lib/api-response";
import { rejectReport } from "@/lib/admin/admin.server";
import { guardErrorResponse, requireAdmin } from "@/lib/auth-guards.server";

const actionSchema = z.object({
  reason: z.string().min(1)
});

type RouteContext = {
  reportId: string;
};

export async function PATCH(request: Request, { reportId }: RouteContext) {
  try {
    const context = await requireAdmin(request);
    const parsed = actionSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return errorResponse("INVALID_REJECTION_REASON", "Enter a rejection reason.");

    const report = await rejectReport(context.user, reportId, parsed.data.reason);
    if (!report) return notFoundResponse("This report cannot be rejected.");
    return successResponse({ report });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
