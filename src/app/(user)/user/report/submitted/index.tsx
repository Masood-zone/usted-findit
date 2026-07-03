import { router, useLocalSearchParams, type Href } from "expo-router";
import { CheckCircle2 } from "lucide-react-native";
import { View } from "react-native";
import { StateView } from "@/components/general/state-view";
import { AppButton } from "@/components/ui/app-button";

export default function ReportSubmittedScreen() {
  const params = useLocalSearchParams<{ reportId?: string }>();

  return (
    <View style={{ flex: 1 }}>
      <StateView
        icon={CheckCircle2}
        title="Report submitted"
        message="Your report is pending review and is visible in My Reports. It will not appear in public search until approved."
        actionLabel="View My Reports"
        onAction={() => router.replace("/user/my-reports" as Href)}
      />
      {params.reportId ? (
        <View style={{ bottom: 24, left: 24, position: "absolute", right: 24 }}>
          <AppButton title="See possible matches" variant="secondary" onPress={() => router.push(`/user/reports/${params.reportId}/matches` as Href)} />
        </View>
      ) : null}
    </View>
  );
}
