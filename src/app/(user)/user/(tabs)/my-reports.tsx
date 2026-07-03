import { router, type Href } from "expo-router";
import { AlertCircle, FileText, Plus, ShieldCheck } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { StateView } from "@/components/general/state-view";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { ImagePreview } from "@/components/ui/image-preview";
import { StatusBadge } from "@/components/user/status-badge";
import { UserShell } from "@/components/user/user-shell";
import { UserTopBar } from "@/components/user/user-top-bar";
import { useUserClaims, useUserReports } from "@/services/queries/hooks";

export default function MyReportsScreen() {
  const reports = useUserReports();
  const claims = useUserClaims();

  if (reports.isPending || claims.isPending) return <LoadingScreen />;

  if (reports.isError || claims.isError) {
    return (
      <StateView
        title="Reports unavailable"
        message="We could not load your reports and claims right now."
        actionLabel="Try again"
        onAction={() => {
          void reports.refetch();
          void claims.refetch();
        }}
      />
    );
  }

  return (
    <UserShell>
      <UserTopBar title="My Reports" />
      <View style={{ gap: 16 }}>
        <AppButton title="New report" icon={<Plus color={colors.surface} size={18} />} onPress={() => router.push("/user/report" as Href)} />
        <AppText variant="section">Reports</AppText>
        {reports.data?.reports.length ? (
          reports.data.reports.map((report) => (
            <Pressable
              key={report.id}
              onPress={() => router.push(`/user/reports/${report.id}` as Href)}
              style={{ backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, flexDirection: "row", gap: 12, padding: 12 }}
            >
              <View style={{ backgroundColor: colors.surfaceContainer, borderRadius: radius.md, height: 82, overflow: "hidden", width: 82 }}>
                {report.primaryImageUrl ? <ImagePreview uri={report.primaryImageUrl} alt={report.title} containerStyle={{ height: "100%", width: "100%" }} /> : <FileText color={colors.primary} size={32} style={{ margin: 25 }} />}
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <AppText variant="label" numberOfLines={1}>{report.title}</AppText>
                <AppText variant="caption" muted>{report.referenceNumber} • {report.location}</AppText>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  <StatusBadge type={report.type} />
                  <StatusBadge status={report.status} />
                </View>
                {report.status === "CHANGES_REQUESTED" ? (
                  <View style={{ backgroundColor: colors.warningSoft, borderColor: colors.gold, borderRadius: radius.md, borderWidth: 1, gap: 6, padding: 8 }}>
                    <View style={{ alignItems: "center", flexDirection: "row", gap: 6 }}>
                      <AlertCircle color={colors.goldDark} size={15} />
                      <AppText variant="caption" style={{ color: colors.goldDark, fontFamily: "Inter_600SemiBold" }}>Changes requested</AppText>
                    </View>
                    <AppText variant="caption" muted numberOfLines={2}>{report.adminNotes || "Open this report to review the requested changes."}</AppText>
                    <AppButton title="Make changes" variant="secondary" style={{ minHeight: 40 }} onPress={() => router.push(`/user/reports/${report.id}/edit` as Href)} />
                  </View>
                ) : null}
                <AppText variant="caption" muted>{report.claimCount ? `${report.claimCount} claim(s) received` : "No claims yet"}</AppText>
              </View>
            </Pressable>
          ))
        ) : (
          <AppText muted>No reports yet.</AppText>
        )}
        <AppText variant="section">Claims</AppText>
        {claims.data?.claims.length ? (
          claims.data.claims.map((claim) => (
            <Pressable
              key={claim.id}
              onPress={() => router.push(`/user/claims/${claim.id}` as Href)}
              style={{ backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, flexDirection: "row", gap: 12, padding: 12 }}
            >
              <ShieldCheck color={colors.primary} size={24} />
              <View style={{ flex: 1, gap: 4 }}>
                <AppText variant="label">{claim.itemTitle}</AppText>
                <AppText variant="caption" muted>{claim.referenceNumber} • {claim.status.replace("_", " ")}</AppText>
              </View>
            </Pressable>
          ))
        ) : (
          <AppText muted>No ownership claims submitted yet.</AppText>
        )}
      </View>
    </UserShell>
  );
}
