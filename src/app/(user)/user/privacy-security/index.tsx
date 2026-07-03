import { router } from "expo-router";
import { LockKeyhole, ShieldCheck } from "lucide-react-native";
import { View } from "react-native";
import { ReportCard, ReportHeader } from "@/components/reports/report-ui";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { UserShell } from "@/components/user/user-shell";

export default function PrivacySecurityScreen() {
  return (
    <UserShell>
      <ReportHeader title="Privacy & Security" subtitle="How USTED FindIt protects item reports, claims, and account activity." />
      <View style={{ gap: 14 }}>
        <ReportCard>
          <ShieldCheck color={colors.primary} size={26} />
          <AppText variant="label">Private verification stays hidden</AppText>
          <AppText muted>
            Details used to verify ownership, such as serial numbers, item contents, or private notes, are never displayed in public search results or public item detail pages.
          </AppText>
        </ReportCard>
        <ReportCard>
          <LockKeyhole color={colors.primary} size={26} />
          <AppText variant="label">Claims require review</AppText>
          <AppText muted>
            Ownership claims are submitted for staff review. Claim evidence and proof descriptions are visible only to authorized review workflows.
          </AppText>
        </ReportCard>
        <ReportCard>
          <AppText variant="label">Account and report safety</AppText>
          <AppText muted>
            Your reports are tied to your signed-in account. Pending reports remain private until approved, and unavailable or removed items are not shown publicly.
          </AppText>
        </ReportCard>
        <AppButton title="Back to profile" variant="secondary" onPress={() => router.back()} />
      </View>
    </UserShell>
  );
}
