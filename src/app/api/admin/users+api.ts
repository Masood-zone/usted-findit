import { internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { getAdminUsers } from "@/lib/admin/admin.server";
import { guardErrorResponse, requireAdmin } from "@/lib/auth-guards.server";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const users = await getAdminUsers();
    return successResponse({ users });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
