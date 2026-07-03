import { useMutation } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { authClient } from "@/lib/auth-client";
import { getApiBaseUrl } from "@/lib/env";
import type { ApiResponseBody } from "@/types/api";
import type { UploadedCloudinaryFile, UploadPurpose } from "@/types/reports";

export type UploadFileInput = {
  file: {
    uri: string;
    name: string;
    type?: string;
  };
  purpose: UploadPurpose;
};

export async function uploadFileToCloudinary({ file, purpose }: UploadFileInput): Promise<UploadedCloudinaryFile> {
  const cookie = authClient.getCookie();
  const body = new FormData();

  body.append("purpose", purpose);
  body.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.type ?? "application/octet-stream"
  } as unknown as Blob);

  const response = await fetch(`${getApiBaseUrl()}/api/user/uploads`, {
    body,
    credentials: "omit",
    headers: {
      ...(cookie
        ? {
            cookie,
            "x-usted-findit-auth-cookie": cookie
          }
        : {}),
      "expo-origin": Linking.createURL("", { scheme: "ustedfindit" }),
      Accept: "application/json",
      "x-skip-oauth-proxy": "true"
    },
    method: "POST"
  });
  const payload = (await response.json()) as ApiResponseBody<UploadedCloudinaryFile>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.success ? "File upload failed" : payload.error.message);
  }

  return payload.data;
}

export function useUploadFile() {
  return useMutation({
    mutationFn: uploadFileToCloudinary
  });
}
