import { router, type Href } from "expo-router";
import { CircleHelp, PackageSearch, Search, ShieldCheck } from "lucide-react-native";
import { View } from "react-native";
import { ReportCard, ReportHeader } from "@/components/reports/report-ui";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { UserShell } from "@/components/user/user-shell";

export default function HelpScreen() {
  return (
    <UserShell>
      <ReportHeader title="Help" subtitle="Quick guidance for reporting, searching, and reclaiming items on campus." />
      <View style={{ gap: 14 }}>
        <ReportCard>
          <PackageSearch color={colors.primary} size={26} />
          <AppText variant="label">Report lost or found items</AppText>
          <AppText muted>
            Use the Report tab to submit item details, location, date, and photos. Found-item reports can include hidden verification details for safer claims.
          </AppText>
        </ReportCard>
        <ReportCard>
          <Search color={colors.primary} size={26} />
          <AppText variant="label">Search public items</AppText>
          <AppText muted>
            Search only shows approved public items. Pending reports remain private while staff review them.
          </AppText>
        </ReportCard>
        <ReportCard>
          <ShieldCheck color={colors.primary} size={26} />
          <AppText variant="label">Claim safely</AppText>
          <AppText muted>
            If an item may be yours, submit a claim with details only you would know. False claims may delay recovery and can be rejected.
          </AppText>
        </ReportCard>
        <ReportCard>
          <CircleHelp color={colors.primary} size={26} />
          <AppText variant="label">Need more help?</AppText>
          <AppText muted>
            Visit the campus security or student affairs desk with your claim reference, report reference, and institutional ID.
          </AppText>
        </ReportCard>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <AppButton title="Start report" style={{ flex: 1 }} onPress={() => router.push("/user/report" as Href)} />
          <AppButton title="Back" variant="secondary" style={{ flex: 1 }} onPress={() => router.back()} />
        </View>
      </View>
    </UserShell>
  );
}
