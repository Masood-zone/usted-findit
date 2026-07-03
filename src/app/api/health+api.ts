import { successResponse } from "@/lib/api-response";

export function GET() {
  return successResponse({
    service: "usted-findit",
    timestamp: new Date().toISOString(),
  });
}
