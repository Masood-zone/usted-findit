import { guardErrorResponse, requireUser } from "@/lib/auth-guards.server";
import { internalServerErrorResponse, notFoundResponse, successResponse } from "@/lib/api-response";
import { findPublicItemById } from "@/lib/user/items.server";

type RouteContext = {
  itemId: string;
};

export async function GET(request: Request, { itemId }: RouteContext) {
  try {
    const context = await requireUser(request);
    const item = await findPublicItemById(context.user.id, itemId);

    if (!item) {
      return notFoundResponse("This item is unavailable or no longer public.");
    }

    return successResponse({ item });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
