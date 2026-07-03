import { StateView } from "@/components/general/state-view";
import { CopyCheck } from "lucide-react-native";

export default function DuplicateReportWarningScreen() {
  return (
    <StateView
      icon={CopyCheck}
      title="Possible duplicate report"
      message="A similar item may already exist. Review possible matches before submitting a new report."
      actionLabel="Review matches"
    />
  );
}
