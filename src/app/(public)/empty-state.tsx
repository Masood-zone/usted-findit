import { StateView } from "@/components/general/state-view";
import { Inbox } from "lucide-react-native";

export default function EmptyStateScreen() {
  return <StateView icon={Inbox} title="Nothing here yet" message="When records are available, they will appear here." />;
}
