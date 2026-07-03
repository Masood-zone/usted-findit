import { z } from "zod";
import { guardErrorResponse, requireUser } from "@/lib/auth-guards.server";
import { errorResponse, internalServerErrorResponse, notFoundResponse, successResponse } from "@/lib/api-response";
import { getSavedPublicItems, savePublicItem, unsavePublicItem } from "@/lib/user/items.server";

const savedItemSchema = z.object({
  itemId: z.string().min(1)
});

async function parseBody(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = savedItemSchema.safeParse(body);

  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}

export async function GET(request: Request) {
  try {
    const context = await requireUser(request);
    const items = await getSavedPublicItems(context.user.id);

    return successResponse({ items });
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
    const body = await parseBody(request);

    if (!body) {
      return errorResponse("INVALID_INPUT", "A valid item ID is required.");
    }

    const result = await savePublicItem(context.user.id, body.itemId);

    if (!result) {
      return notFoundResponse("This item is unavailable or no longer public.");
    }

    return successResponse(result);
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}

export async function DELETE(request: Request) {
  try {
    const context = await requireUser(request);
    const body = await parseBody(request);

    if (!body) {
      return errorResponse("INVALID_INPUT", "A valid item ID is required.");
    }

    const result = await unsavePublicItem(context.user.id, body.itemId);
    return successResponse(result);
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
