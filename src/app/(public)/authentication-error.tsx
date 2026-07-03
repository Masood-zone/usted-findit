import { StateView } from "@/components/general/state-view";
import { ShieldAlert } from "lucide-react-native";

export default function AuthenticationErrorScreen() {
  return (
    <StateView
      icon={ShieldAlert}
      title="Authentication error"
      message="We could not confirm your session. Please sign in again to continue."
      actionLabel="Go to sign in"
    />
  );
}
