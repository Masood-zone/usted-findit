import * as ImagePicker from "expo-image-picker";
import { ImagePlus, Trash2 } from "lucide-react-native";
import { ActivityIndicator, Pressable, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { ImagePreview } from "@/components/ui/image-preview";
import { uploadFileToCloudinary } from "@/services/api/uploads";
import type { ReportDraftImage, UploadPurpose } from "@/types/reports";
import { useState } from "react";

type ImageUploadFieldProps = {
  label: string;
  helper: string;
  images: ReportDraftImage[];
  maxImages: number;
  purpose: UploadPurpose;
  onChange: (images: ReportDraftImage[]) => void;
  onFailure?: (message: string) => void;
};

function getAssetName(asset: ImagePicker.ImagePickerAsset, index: number) {
  return asset.fileName || `usted-upload-${Date.now()}-${index}.jpg`;
}

export function ImageUploadField({ label, helper, images, maxImages, purpose, onChange, onFailure }: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const remainingSlots = Math.max(maxImages - images.length, 0);

  async function pickImages() {
    if (!remainingSlots || uploading) return;

    setError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      const message = "Photo library permission is required to upload images.";
      setError(message);
      onFailure?.(message);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: remainingSlots > 1,
      mediaTypes: ["images"],
      quality: 0.82,
      selectionLimit: remainingSlots
    });

    if (result.canceled) return;

    setUploading(true);
    const selectedAssets = result.assets.slice(0, remainingSlots);
    setPendingImages(selectedAssets.map((asset) => asset.uri));
    try {
      const uploaded = await Promise.all(
        selectedAssets.map(async (asset, index) => {
          const file = await uploadFileToCloudinary({
            file: {
              name: getAssetName(asset, index),
              type: asset.mimeType ?? "image/jpeg",
              uri: asset.uri
            },
            purpose
          });

          return { ...file, localUri: asset.uri };
        })
      );

      onChange([...images, ...uploaded]);
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Image upload failed.";
      setError(message);
      onFailure?.(message);
    } finally {
      setPendingImages([]);
      setUploading(false);
    }
  }

  return (
    <View style={{ gap: 10 }}>
      <View style={{ gap: 4 }}>
        <AppText variant="label">{label}</AppText>
        <AppText variant="caption" muted>
          {helper}
        </AppText>
      </View>
      <Pressable
        onPress={pickImages}
        style={{
          alignItems: "center",
          backgroundColor: colors.surfaceContainerLow,
          borderColor: colors.outline,
          borderRadius: radius.lg,
          borderStyle: "dashed",
          borderWidth: 1.5,
          gap: 8,
          justifyContent: "center",
          minHeight: 140,
          opacity: uploading || !remainingSlots ? 0.7 : 1,
          padding: 18
        }}
      >
        {uploading ? <ActivityIndicator color={colors.primary} /> : <ImagePlus color={colors.primary} size={30} />}
        <AppText variant="label" center style={{ color: colors.primary }}>
          {uploading ? "Uploading..." : remainingSlots ? "Tap to upload photos" : "Maximum images added"}
        </AppText>
        <AppText variant="caption" center muted>
          JPEG, PNG, or WebP. Max 5MB per image.
        </AppText>
      </Pressable>
      {error ? (
        <AppText variant="caption" style={{ color: colors.error }}>
          {error}
        </AppText>
      ) : null}
      {images.length || pendingImages.length ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {pendingImages.map((uri) => (
            <View key={uri} style={{ borderRadius: radius.md, height: 88, opacity: 0.7, overflow: "hidden", width: 88 }}>
              <ImagePreview uri={uri} alt="Pending upload" containerStyle={{ height: "100%", width: "100%" }} />
              <View style={{ alignItems: "center", backgroundColor: "rgba(0,0,0,0.35)", bottom: 0, justifyContent: "center", left: 0, position: "absolute", right: 0, top: 0 }}>
                <ActivityIndicator color={colors.surface} />
              </View>
            </View>
          ))}
          {images.map((image) => (
            <View key={image.publicId} style={{ borderRadius: radius.md, height: 88, overflow: "hidden", width: 88 }}>
              <ImagePreview uri={image.previewUrl || image.secureUrl} alt="Uploaded image" containerStyle={{ height: "100%", width: "100%" }} />
              <Pressable
                onPress={() => onChange(images.filter((entry) => entry.publicId !== image.publicId))}
                style={{ alignItems: "center", backgroundColor: "rgba(104,0,41,0.82)", borderRadius: 15, height: 30, justifyContent: "center", position: "absolute", right: 5, top: 5, width: 30 }}
              >
                <Trash2 color={colors.surface} size={15} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
