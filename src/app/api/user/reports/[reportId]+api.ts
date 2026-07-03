import { guardErrorResponse, requireUser } from "@/lib/auth-guards.server";
import { errorResponse, internalServerErrorResponse, notFoundResponse, successResponse } from "@/lib/api-response";
import { getUserReport, updateUserReport } from "@/lib/user/reports.server";
import { z } from "zod";

type RouteContext = {
  reportId: string;
};

const uploadedImageSchema = z.object({
  previewUrl: z.string().min(1),
  publicId: z.string().min(1),
  secureUrl: z.string().min(1),
  url: z.string().min(1),
  bytes: z.number().optional(),
  format: z.string().optional(),
  height: z.number().optional(),
  originalName: z.string().optional(),
  width: z.number().optional()
});

const updateReportSchema = z.object({
  brand: z.string().optional(),
  category: z.string().min(1),
  colour: z.string().optional(),
  description: z.string().min(1),
  eventDate: z.string().min(1),
  eventTime: z.string().min(1),
  hiddenVerificationDetails: z.string().optional(),
  images: z.array(uploadedImageSchema).max(4).default([]),
  landmark: z.string().optional(),
  location: z.string().min(1),
  storageOption: z.string().optional(),
  title: z.string().min(1),
  type: z.enum(["LOST", "FOUND"]),
  verificationQuestion: z.string().optional()
});

export async function GET(request: Request, { reportId }: RouteContext) {
  try {
    const context = await requireUser(request);
    const report = await getUserReport(context.user.id, reportId);

    if (!report) {
      return notFoundResponse("This report is unavailable.");
    }

    return successResponse({ report });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}

export async function PATCH(request: Request, { reportId }: RouteContext) {
  try {
    const context = await requireUser(request);
    const parsed = updateReportSchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
      return errorResponse("INVALID_REPORT", "Complete the required report fields.");
    }

    const report = await updateUserReport(context.user.id, reportId, parsed.data);

    if (!report) {
      return notFoundResponse("This report cannot be edited.");
    }

    return successResponse({ report });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
