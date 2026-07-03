import { router, useLocalSearchParams, type Href } from "expo-router";
import { UploadCloud } from "lucide-react-native";
import { StateView } from "@/components/general/state-view";

export default function UploadFailedScreen() {
  const params = useLocalSearchParams<{ message?: string }>();

  return (
    <StateView
      icon={UploadCloud}
      title="Upload failed"
      message={params.message || "We couldn't process your file. Check your connection and use a JPEG, PNG, or WebP image under 5MB."}
      actionLabel="Back to report"
      onAction={() => {
        if (router.canGoBack()) {
          router.back();
          return;
        }

        router.push("/user/report" as Href);
      }}
    />
  );
}
