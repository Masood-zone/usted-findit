import { internalServerErrorResponse, notFoundResponse, successResponse } from "@/lib/api-response";
import { getAdminClaim } from "@/lib/admin/admin.server";
import { guardErrorResponse, requireAdmin } from "@/lib/auth-guards.server";

type RouteContext = {
  claimId: string;
};

export async function GET(request: Request, { claimId }: RouteContext) {
  try {
    await requireAdmin(request);
    const claim = await getAdminClaim(claimId);

    if (!claim) return notFoundResponse("This claim is unavailable.");
    return successResponse({ claim });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
