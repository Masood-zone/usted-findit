import { z } from "zod";
import { errorResponse, internalServerErrorResponse, notFoundResponse, successResponse } from "@/lib/api-response";
import { rejectClaim } from "@/lib/admin/admin.server";
import { guardErrorResponse, requireAdmin } from "@/lib/auth-guards.server";

const actionSchema = z.object({
  reason: z.string().min(1)
});

type RouteContext = {
  claimId: string;
};

export async function PATCH(request: Request, { claimId }: RouteContext) {
  try {
    const context = await requireAdmin(request);
    const parsed = actionSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return errorResponse("INVALID_CLAIM_REJECTION", "Enter a rejection reason.");

    const claim = await rejectClaim(context.user, claimId, parsed.data.reason);
    if (!claim) return notFoundResponse("This claim cannot be rejected.");
    return successResponse({ claim });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
