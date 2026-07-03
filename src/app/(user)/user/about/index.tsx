import { router } from "expo-router";
import { UserRound } from "lucide-react-native";
import { View } from "react-native";
import { ReportCard, ReportHeader } from "@/components/reports/report-ui";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { UserShell } from "@/components/user/user-shell";

export default function AboutScreen() {
  return (
    <UserShell>
      <ReportHeader title="About USTED FindIt" subtitle="A campus lost-and-found mobile system for secure item reporting, discovery, verification, and claims." />
      <View style={{ gap: 14 }}>
        <ReportCard>
          <AppText variant="label">Purpose</AppText>
          <AppText muted>
            USTED FindIt helps students and staff report missing or found belongings, search approved public records, and reclaim items through privacy-aware verification.
          </AppText>
        </ReportCard>
        <ReportCard>
          <AppText variant="label">Project focus</AppText>
          <AppText muted>
            The app supports protected user accounts, public item browsing, pending report review, claim tracking, and safer recovery workflows for campus facilities.
          </AppText>
        </ReportCard>
        <ReportCard>
          <AppText variant="label">Project Team</AppText>
          <View style={{ alignItems: "center", flexDirection: "row", gap: 12 }}>
            <View
              style={{
                alignItems: "center",
                backgroundColor: colors.surfaceContainerLow,
                borderColor: colors.border,
                borderRadius: radius.full,
                borderWidth: 1,
                height: 54,
                justifyContent: "center",
                width: 54
              }}
            >
              <UserRound color={colors.primary} size={28} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="label">Boateng</AppText>
              <AppText variant="caption" muted>
                Project contributor
              </AppText>
            </View>
          </View>
        </ReportCard>
        <ReportCard>
          <AppText variant="label">Version</AppText>
          <AppText muted>USTED FindIt v1.0.0</AppText>
        </ReportCard>
        <AppButton title="Back to profile" variant="secondary" onPress={() => router.back()} />
      </View>
    </UserShell>
  );
}
