import { router, useLocalSearchParams, type Href } from "expo-router";
import { CheckCircle2, Clock3, ShieldCheck } from "lucide-react-native";
import { View } from "react-native";
import { StateView } from "@/components/general/state-view";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { ReportCard, ReportHeader } from "@/components/reports/report-ui";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { ImagePreview } from "@/components/ui/image-preview";
import { UserShell } from "@/components/user/user-shell";
import { useUserClaim } from "@/services/queries/hooks";

export default function ClaimStatusTrackingScreen() {
  const params = useLocalSearchParams<{ claimId: string }>();
  const claimId = params.claimId ?? "";
  const claim = useUserClaim(claimId);
  const data = claim.data?.claim;

  if (claim.isPending) return <LoadingScreen />;
  if (claim.isError || !data) {
    return <StateView title="Claim unavailable" message="This claim could not be loaded." actionLabel="Back to My Reports" onAction={() => router.push("/user/my-reports" as Href)} />;
  }

  const approved = data.status === "APPROVED";

  return (
    <UserShell>
      <ReportHeader title={`Claim Reference: ${data.referenceNumber}`} subtitle={`Submitted on ${new Date(data.createdAt).toLocaleDateString()}`} />
      <ReportCard>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ backgroundColor: colors.surfaceContainer, borderRadius: radius.md, height: 80, overflow: "hidden", width: 80 }}>
            {data.itemImageUrl ? <ImagePreview uri={data.itemImageUrl} alt={data.itemTitle} containerStyle={{ height: "100%", width: "100%" }} /> : null}
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <AppText variant="label">{data.itemTitle}</AppText>
            <AppText muted>Status: {data.status.replace("_", " ")}</AppText>
          </View>
        </View>
      </ReportCard>
      <View style={{ gap: 14, marginTop: 16 }}>
        <ReportCard>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <CheckCircle2 color={colors.green} size={22} />
            <View style={{ flex: 1 }}>
              <AppText variant="label">Claim Submitted</AppText>
              <AppText muted>Your proof has been received.</AppText>
            </View>
          </View>
        </ReportCard>
        <ReportCard>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Clock3 color={colors.primary} size={22} />
            <View style={{ flex: 1 }}>
              <AppText variant="label">Verification Under Review</AppText>
              <AppText muted>Staff will compare your proof with hidden item details.</AppText>
            </View>
          </View>
        </ReportCard>
        {approved ? (
          <ReportCard>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <ShieldCheck color={colors.green} size={22} />
              <View style={{ flex: 1 }}>
                <AppText variant="label">Claim Approved</AppText>
                <AppText muted>Pickup: {data.pickupLocation || "Security Office"}</AppText>
                <AppText muted>Code: {data.pickupCode || "Available at desk"}</AppText>
              </View>
            </View>
          </ReportCard>
        ) : null}
        <AppButton title="Back to My Reports" variant="secondary" onPress={() => router.push("/user/my-reports" as Href)} />
      </View>
    </UserShell>
  );
}
