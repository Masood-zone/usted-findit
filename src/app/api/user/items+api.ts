import { guardErrorResponse, requireUser } from "@/lib/auth-guards.server";
import { internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { findPublicItems, getUserItemFiltersFromUrl } from "@/lib/user/items.server";

export async function GET(request: Request) {
  try {
    const context = await requireUser(request);
    const filters = getUserItemFiltersFromUrl(request);
    const result = await findPublicItems(context.user.id, filters);

    return successResponse({
      query: filters,
      total: result.total,
      hasMore: result.hasMore,
      items: result.items
    });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
