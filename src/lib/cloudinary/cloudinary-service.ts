import type { UploadPurpose } from "@/types/reports";
import { getServerEnv } from "@/lib/env.server";

export type CloudinaryUploadResponse = {
  public_id: string;
  secure_url: string;
  url: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  created_at?: string;
  original_filename?: string;
};

let clockOffsetMs = 0;
let clockOffsetCheckedAt = 0;

const purposeFolders: Record<UploadPurpose, string> = {
  claimEvidence: "usted-findit/claims",
  profileImage: "usted-findit/profiles",
  reportImage: "usted-findit/reports"
};

async function sha1Hex(value: string) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-1", data);

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getCredentials() {
  const env = getServerEnv();

  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary credentials are missing from environment");
  }

  return {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET
  };
}

async function createSignature(params: Record<string, string | number>, apiSecret: string) {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== "" && value !== undefined && value !== null)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return sha1Hex(`${payload}${apiSecret}`);
}

async function getUploadTimestamp() {
  const now = Date.now();
  const offsetTtlMs = 5 * 60 * 1000;

  if (clockOffsetCheckedAt && now - clockOffsetCheckedAt < offsetTtlMs) {
    return Math.floor((now + clockOffsetMs) / 1000);
  }

  try {
    const response = await fetch("https://api.cloudinary.com", { cache: "no-store", method: "HEAD" });
    const cloudinaryDate = response.headers.get("date");

    if (cloudinaryDate) {
      const serverTime = new Date(cloudinaryDate).getTime();
      if (!Number.isNaN(serverTime)) {
        clockOffsetMs = serverTime - now;
        clockOffsetCheckedAt = now;
      }
    }
  } catch {
    // Local development can upload without clock calibration.
  }

  return Math.floor((Date.now() + clockOffsetMs) / 1000);
}

export function getCloudinaryFolder(purpose: UploadPurpose) {
  return purposeFolders[purpose] ?? "usted-findit/uploads";
}

export async function uploadImageBuffer(args: {
  buffer: ArrayBuffer;
  filename?: string;
  purpose: UploadPurpose;
}) {
  const credentials = getCredentials();
  const timestamp = await getUploadTimestamp();
  const folder = getCloudinaryFolder(args.purpose);
  const uploadParams = {
    folder,
    timestamp,
    unique_filename: "true",
    use_filename: "true"
  };
  const formData = new FormData();

  formData.append("file", new Blob([args.buffer]), args.filename || "upload");
  formData.append("api_key", credentials.apiKey);
  formData.append("folder", uploadParams.folder);
  formData.append("timestamp", String(uploadParams.timestamp));
  formData.append("unique_filename", uploadParams.unique_filename);
  formData.append("use_filename", uploadParams.use_filename);
  formData.append("signature", await createSignature(uploadParams, credentials.apiSecret));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${credentials.cloudName}/image/upload`, {
    body: formData,
    method: "POST"
  });
  const result = (await response.json()) as CloudinaryUploadResponse & { error?: { message?: string } };

  if (!response.ok) {
    throw new Error(result.error?.message || "Cloudinary upload failed");
  }

  return result;
}
