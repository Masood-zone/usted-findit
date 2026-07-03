import { StateView } from "@/components/general/state-view";
import { CircleX } from "lucide-react-native";

export default function ClaimRejectedScreen() {
  return (
    <StateView
      icon={CircleX}
      title="Claim rejected"
      message="The submitted ownership details were not enough to verify this claim."
      actionLabel="View claim status"
    />
  );
}
