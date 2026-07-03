type CloudinaryTransformOptions = {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "scale" | "crop";
  quality?: "auto" | number;
  format?: "auto" | "webp" | "jpg" | "png";
};

export class CloudinaryUtils {
  static generateOptimizedUrl(publicId: string, cloudName: string | undefined, options: CloudinaryTransformOptions = {}) {
    if (!cloudName) return publicId;

    const { width, height, crop = "fill", quality = "auto", format = "auto" } = options;
    const transformations: string[] = [];

    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (crop) transformations.push(`c_${crop}`);
    if (quality) transformations.push(`q_${quality}`);
    if (format) transformations.push(`f_${format}`);

    const transformString = transformations.length ? `${transformations.join(",")}/` : "";
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}${publicId}`;
  }

  static extractPublicId(url: string) {
    try {
      if (url.includes("cloudinary.com")) {
        const parts = url.split("/");
        const uploadIndex = parts.findIndex((part) => part === "upload");
        if (uploadIndex !== -1 && uploadIndex + 1 < parts.length) {
          const nextPart = parts[uploadIndex + 1] || "";
          const publicIdStart = nextPart.includes(",") || nextPart.startsWith("v") ? uploadIndex + 2 : uploadIndex + 1;
          return parts.slice(publicIdStart).join("/").replace(/\.[^/.]+$/, "");
        }
      }

      const filename = url.split("/").pop() || "";
      return filename.replace(/\.[^/.]+$/, "");
    } catch {
      return "";
    }
  }
}
