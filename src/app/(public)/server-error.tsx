import { StateView } from "@/components/general/state-view";
import { ServerCrash } from "lucide-react-native";

export default function ServerErrorScreen() {
  return (
    <StateView
      icon={ServerCrash}
      title="Server error"
      message="USTED FindIt services are temporarily unavailable. Please try again shortly."
      actionLabel="Try again"
    />
  );
}
