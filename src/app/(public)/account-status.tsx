import { StateView } from "@/components/general/state-view";
import { ShieldAlert } from "lucide-react-native";

export default function AccountStatusScreen() {
  return (
    <StateView
      icon={ShieldAlert}
      title="Account needs attention"
      message="Your account is not currently active. Contact the USTED FindIt administrator for help."
    />
  );
}
