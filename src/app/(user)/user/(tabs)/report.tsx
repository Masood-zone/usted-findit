import { router, type Href } from "expo-router";
import { PackageSearch, SearchX } from "lucide-react-native";
import { View } from "react-native";
import { ChoiceCard, ReportHeader } from "@/components/reports/report-ui";
import { AppButton } from "@/components/ui/app-button";
import { colors } from "@/components/ui/design-system";
import { UserShell } from "@/components/user/user-shell";
import { useReportDraftStore } from "@/store/report-draft-store";

export default function ChooseReportTypeScreen() {
  const { draft, resetDraft, setDraft } = useReportDraftStore();

  function start(type: "LOST" | "FOUND") {
    resetDraft();
    setDraft({ type });
    router.push(`/user/report/${type === "LOST" ? "lost" : "found"}/step-1` as Href);
  }

  return (
    <UserShell>
      <ReportHeader title="Report" subtitle="Choose the report type so we can guide you through the right details." />
      <View style={{ gap: 14 }}>
        <ChoiceCard
          active={draft.type === "LOST"}
          icon={<SearchX color={colors.primary} size={28} />}
          title="I lost an item"
          body="Create a private lost-item report and check possible matches."
          onPress={() => start("LOST")}
        />
        <ChoiceCard
          active={draft.type === "FOUND"}
          icon={<PackageSearch color={colors.primary} size={28} />}
          title="I found an item"
          body="Hand in item details safely and define private verification clues."
          onPress={() => start("FOUND")}
        />
        <AppButton title="View My Reports" variant="secondary" onPress={() => router.push("/user/my-reports" as Href)} />
      </View>
    </UserShell>
  );
}
