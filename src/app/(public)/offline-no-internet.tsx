import { StateView } from "@/components/general/state-view";
import { WifiOff } from "lucide-react-native";

export default function OfflineNoInternetScreen() {
  return (
    <StateView
      icon={WifiOff}
      title="No internet connection"
      message="Check your connection and try again. Your current screen will stay available."
      actionLabel="Retry"
    />
  );
}
