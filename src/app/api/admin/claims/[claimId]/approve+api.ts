import { z } from "zod";
import { errorResponse, internalServerErrorResponse, notFoundResponse, successResponse } from "@/lib/api-response";
import { approveClaim } from "@/lib/admin/admin.server";
import { guardErrorResponse, requireAdmin } from "@/lib/auth-guards.server";

const actionSchema = z.object({
  pickupLocation: z.string().optional()
});

type RouteContext = {
  claimId: string;
};

export async function PATCH(request: Request, { claimId }: RouteContext) {
  try {
    const context = await requireAdmin(request);
    const parsed = actionSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return errorResponse("INVALID_CLAIM_APPROVAL", "Unable to approve this claim.");

    const claim = await approveClaim(context.user, claimId, parsed.data.pickupLocation);
    if (!claim) return notFoundResponse("This claim cannot be approved.");
    return successResponse({ claim });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
