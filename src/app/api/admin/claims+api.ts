import { internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { getAdminClaims } from "@/lib/admin/admin.server";
import { guardErrorResponse, requireAdmin } from "@/lib/auth-guards.server";
import type { ClaimStatus } from "@/types/reports";

const statuses: ClaimStatus[] = ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "CANCELLED"];

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const claims = await getAdminClaims(status === "ALL" || statuses.includes(status as ClaimStatus) ? (status as ClaimStatus | "ALL") : undefined);
    return successResponse({ claims });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
