import { z } from "zod";
import { errorResponse, internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { guardErrorResponse, requireUser } from "@/lib/auth-guards.server";
import { uploadImageBuffer } from "@/lib/cloudinary/cloudinary-service";
import { CloudinaryUtils } from "@/lib/cloudinary/cloudinary-utils";
import { getServerEnv } from "@/lib/env.server";
import type { UploadPurpose } from "@/types/reports";

const maxFileBytes = 5 * 1024 * 1024;
const uploadPurposeSchema = z.enum(["reportImage", "claimEvidence", "profileImage"]);
const allowedTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

type UploadedFormFile = {
  arrayBuffer: () => Promise<ArrayBuffer>;
  name?: string;
  size?: number;
  type?: string;
};

function isUploadedFormFile(value: unknown): value is UploadedFormFile {
  return Boolean(value && typeof value === "object" && "arrayBuffer" in value && typeof value.arrayBuffer === "function");
}

export async function POST(request: Request) {
  try {
    await requireUser(request);

    const formData = (await request.formData()) as unknown as FormData & {
      get(name: string): FormDataEntryValue | null;
    };
    const purpose = uploadPurposeSchema.safeParse(formData.get("purpose"));
    const file = formData.get("file");

    if (!purpose.success) {
      return errorResponse("INVALID_UPLOAD_PURPOSE", "Choose a valid upload purpose.");
    }

    if (!isUploadedFormFile(file)) {
      return errorResponse("INVALID_FILE", "Choose an image file to upload.");
    }

    const fileType = file.type || "application/octet-stream";
    const fileSize = file.size ?? 0;
    const fileName = file.name || "upload";

    if (!allowedTypes.has(fileType)) {
      return errorResponse("UNSUPPORTED_FILE_TYPE", "Only JPEG, PNG, and WebP images are supported.");
    }

    if (fileSize > maxFileBytes) {
      return errorResponse("FILE_TOO_LARGE", "Images must be 5MB or smaller.");
    }

    const result = await uploadImageBuffer({
      buffer: await file.arrayBuffer(),
      filename: fileName,
      purpose: purpose.data as UploadPurpose
    });
    const env = getServerEnv();
    const previewUrl = CloudinaryUtils.generateOptimizedUrl(result.public_id, env.CLOUDINARY_CLOUD_NAME, {
      height: 480,
      width: 480
    });

    return successResponse({
      bytes: result.bytes,
      format: result.format,
      height: result.height,
      originalName: result.original_filename || fileName,
      previewUrl,
      publicId: result.public_id,
      secureUrl: result.secure_url,
      url: result.url,
      width: result.width
    });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      if (error instanceof Error) {
        return errorResponse("UPLOAD_FAILED", error.message, 500);
      }

      return internalServerErrorResponse();
    }
  }
}
