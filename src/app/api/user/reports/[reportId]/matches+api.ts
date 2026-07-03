import { guardErrorResponse, requireUser } from "@/lib/auth-guards.server";
import { internalServerErrorResponse, notFoundResponse, successResponse } from "@/lib/api-response";
import { getPossibleMatches } from "@/lib/user/reports.server";

type RouteContext = {
  reportId: string;
};

export async function GET(request: Request, { reportId }: RouteContext) {
  try {
    const context = await requireUser(request);
    const matches = await getPossibleMatches(context.user.id, reportId);

    if (!matches) {
      return notFoundResponse("This report is unavailable.");
    }

    return successResponse({ matches });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
