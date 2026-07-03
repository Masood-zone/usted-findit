import { router, type Href } from "expo-router";
import { BarChart3, CheckCircle2, ClipboardList, FileClock, FileText, ShieldAlert } from "lucide-react-native";
import { View } from "react-native";
import { AdminCard, AdminClaimRow, AdminMetricCard, AdminReportRow, AdminShell } from "@/components/admin/admin-ui";
import { StateView } from "@/components/general/state-view";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { useAdminDashboard } from "@/services/queries/hooks";

export default function AdminDashboardScreen() {
  const dashboard = useAdminDashboard();
  const data = dashboard.data;

  if (dashboard.isPending) return <LoadingScreen />;
  if (dashboard.isError || !data) return <StateView title="Dashboard unavailable" message="Admin statistics could not be loaded." />;

  return (
    <AdminShell>
      <View style={{ gap: 6 }}>
        <AppText variant="title" style={{ color: colors.primary }}>
          Good day, {data.greetingName}
        </AppText>
        <AppText muted>Latest operational status for USTED FindIt.</AppText>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <AdminMetricCard icon={<FileText color={colors.primary} size={22} />} label="Total Reports" value={data.stats.totalReports} />
        <AdminMetricCard icon={<FileClock color={colors.goldDark} size={22} />} label="Pending Review" value={data.stats.pendingReports} tone="gold" />
        <AdminMetricCard icon={<ClipboardList color={colors.primary} size={22} />} label="Open Claims" value={data.stats.openClaims} />
        <AdminMetricCard icon={<CheckCircle2 color={colors.green} size={22} />} label="Resolved Items" value={data.stats.resolvedItems} tone="green" />
        <AdminMetricCard icon={<ShieldAlert color={colors.error} size={22} />} label="Removed Reports" value={data.stats.removedReports} tone="danger" />
        <AdminMetricCard icon={<BarChart3 color={colors.primary} size={22} />} label="Published" value={data.stats.publishedReports} />
      </View>
      <AdminCard>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <AppText variant="section">Pending Reports</AppText>
            <AppText muted>Approve valid lost/found reports into public search.</AppText>
          </View>
          <AppButton title="View all" variant="ghost" onPress={() => router.push("/admin/reports" as Href)} style={{ alignSelf: "flex-start", minHeight: 40, paddingHorizontal: 8 }} />
        </View>
        {data.pendingReports.length ? data.pendingReports.map((report) => <AdminReportRow key={report.id} report={report} />) : <AppText muted>No reports waiting for review.</AppText>}
      </AdminCard>
      <AdminCard>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <AppText variant="section">Recent Claims</AppText>
            <AppText muted>Review ownership proof and pickup readiness.</AppText>
          </View>
          <AppButton title="View all" variant="ghost" onPress={() => router.push("/admin/claims" as Href)} style={{ alignSelf: "flex-start", minHeight: 40, paddingHorizontal: 8 }} />
        </View>
        {data.recentClaims.length ? data.recentClaims.map((claim) => <AdminClaimRow key={claim.id} claim={claim} />) : <AppText muted>No open claims yet.</AppText>}
      </AdminCard>
      <AdminCard>
        <AppText variant="section">Recent Activity</AppText>
        {data.recentActivity.length ? (
          data.recentActivity.map((activity) => (
            <View key={activity.id} style={{ borderBottomColor: colors.border, borderBottomWidth: 1, gap: 4, paddingBottom: 10 }}>
              <AppText variant="label">{activity.action.replaceAll("_", " ")}</AppText>
              <AppText muted>
                {activity.entityType} {activity.entityId} | {new Date(activity.createdAt).toLocaleString()}
              </AppText>
            </View>
          ))
        ) : (
          <AppText muted>No admin activity logged yet.</AppText>
        )}
      </AdminCard>
    </AdminShell>
  );
}
