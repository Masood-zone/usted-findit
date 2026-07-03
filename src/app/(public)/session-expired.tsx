import { StateView } from "@/components/general/state-view";
import { ClockAlert } from "lucide-react-native";

export default function SessionExpiredScreen() {
  return (
    <StateView
      icon={ClockAlert}
      title="Session expired"
      message="For your security, please sign in again before continuing."
      actionLabel="Sign in"
    />
  );
}
