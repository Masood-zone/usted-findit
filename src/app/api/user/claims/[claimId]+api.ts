import { guardErrorResponse, requireUser } from "@/lib/auth-guards.server";
import { internalServerErrorResponse, notFoundResponse, successResponse } from "@/lib/api-response";
import { getUserClaim } from "@/lib/user/reports.server";

type RouteContext = {
  claimId: string;
};

export async function GET(request: Request, { claimId }: RouteContext) {
  try {
    const context = await requireUser(request);
    const claim = await getUserClaim(context.user.id, claimId);

    if (!claim) {
      return notFoundResponse("This claim is unavailable.");
    }

    return successResponse({ claim });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
