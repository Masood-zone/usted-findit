import { z } from "zod";
import { errorResponse, internalServerErrorResponse, notFoundResponse, successResponse } from "@/lib/api-response";
import { guardErrorResponse, requireUser } from "@/lib/auth-guards.server";
import { createUserClaim, getUserClaims } from "@/lib/user/reports.server";

const evidenceImageSchema = z
  .object({
    previewUrl: z.string().min(1),
    publicId: z.string().min(1),
    secureUrl: z.string().min(1),
    url: z.string().min(1)
  })
  .nullable()
  .optional();

const createClaimSchema = z.object({
  evidenceImage: evidenceImageSchema,
  hiddenDetails: z.string().min(1),
  itemId: z.string().min(1),
  proofDescription: z.string().min(1)
});

export async function GET(request: Request) {
  try {
    const context = await requireUser(request);
    const claims = await getUserClaims(context.user.id);
    return successResponse({ claims });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireUser(request);
    const body = await request.json().catch(() => null);
    const parsed = createClaimSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("INVALID_CLAIM", "Complete the required claim fields.");
    }

    const claim = await createUserClaim(context.user.id, parsed.data);

    if (!claim) {
      return notFoundResponse("This item is unavailable for claims.");
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
