import { router, type Href } from "expo-router";
import { ArchiveX } from "lucide-react-native";
import { StateView } from "@/components/general/state-view";

export default function ItemUnavailableScreen() {
  return (
    <StateView
      icon={ArchiveX}
      title="Item unavailable"
      message="This item may have been resolved, archived, or removed from public view."
      actionLabel="View My Reports History"
      onAction={() => router.push("/user/my-reports" as Href)}
    />
  );
}
