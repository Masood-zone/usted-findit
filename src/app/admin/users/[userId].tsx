import { router, useLocalSearchParams, type Href } from "expo-router";
import { View } from "react-native";
import { AdminCard, AdminClaimRow, AdminReportRow, AdminShell, AdminStatusBadge } from "@/components/admin/admin-ui";
import { StateView } from "@/components/general/state-view";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { useAdminUser } from "@/services/queries/hooks";

export default function AdminUserProfileScreen() {
  const params = useLocalSearchParams<{ userId: string }>();
  const userId = params.userId ?? "";
  const userQuery = useAdminUser(userId);
  const entry = userQuery.data?.user;

  if (userQuery.isPending) return <LoadingScreen />;
  if (userQuery.isError || !entry) return <StateView title="User unavailable" message="This user profile could not be loaded." actionLabel="Back to users" onAction={() => router.push("/admin/users" as Href)} />;

  return (
    <AdminShell title="User Review">
      <AppButton title="Back to users" variant="ghost" onPress={() => router.push("/admin/users" as Href)} style={{ alignSelf: "flex-start", minHeight: 40, paddingHorizontal: 8 }} />
      <AdminCard>
        <View style={{ alignItems: "center", gap: 10 }}>
          <View style={{ alignItems: "center", backgroundColor: colors.surfaceContainer, borderRadius: radius.full, height: 82, justifyContent: "center", width: 82 }}>
            <AppText variant="title" style={{ color: colors.primary }}>
              {entry.name.slice(0, 1).toUpperCase()}
            </AppText>
          </View>
          <AppText variant="title" style={{ color: colors.primary }}>{entry.name}</AppText>
          <AppText muted>{entry.email}</AppText>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            <AdminStatusBadge status={entry.accountStatus === "ACTIVE" ? "APPROVED" : "REJECTED"} />
            <View style={{ backgroundColor: colors.surfaceSubtle, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 5 }}>
              <AppText variant="caption">{entry.role.replace("_", " ")}</AppText>
            </View>
          </View>
        </View>
      </AdminCard>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <Mini label="Reports" value={entry.reportsSubmitted} />
        <Mini label="Claims" value={entry.claimsSubmitted} />
      </View>
      <AdminCard>
        <AppText variant="section">Profile Details</AppText>
        <Info label="Phone" value={entry.phone || "Not provided"} />
        <Info label="Institution ID" value={entry.institutionId || "Not provided"} />
        <Info label="Created" value={new Date(entry.createdAt).toLocaleDateString()} />
      </AdminCard>
      <AdminCard>
        <AppText variant="section">Recent Reports</AppText>
        {entry.recentReports.length ? entry.recentReports.map((report) => <AdminReportRow key={report.id} report={report} />) : <AppText muted>No reports submitted.</AppText>}
      </AdminCard>
      <AdminCard>
        <AppText variant="section">Recent Claims</AppText>
        {entry.recentClaims.length ? entry.recentClaims.map((claim) => <AdminClaimRow key={claim.id} claim={claim} />) : <AppText muted>No claims submitted.</AppText>}
      </AdminCard>
    </AdminShell>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <View style={{ backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, flex: 1, minWidth: 140, padding: 16 }}>
      <AppText muted>{label}</AppText>
      <AppText variant="title" style={{ color: colors.primary }}>{value}</AppText>
    </View>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 3 }}>
      <AppText variant="caption" muted>{label}</AppText>
      <AppText>{value}</AppText>
    </View>
  );
}
