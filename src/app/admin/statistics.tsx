import { View } from "react-native";
import { BarChart3, CheckCircle2, ClipboardList, FileText, MapPin, PieChart } from "lucide-react-native";
import { AdminCard, AdminMetricCard, AdminShell } from "@/components/admin/admin-ui";
import { StateView } from "@/components/general/state-view";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { useAdminStatistics } from "@/services/queries/hooks";

export default function AdminStatisticsScreen() {
  const statistics = useAdminStatistics();
  const data = statistics.data;

  if (statistics.isPending) return <LoadingScreen />;
  if (statistics.isError || !data) return <StateView title="Statistics unavailable" message="Admin statistics could not be loaded." />;

  return (
    <AdminShell title="Statistics">
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <AdminMetricCard icon={<FileText color={colors.primary} size={22} />} label="Total Reports" value={data.totals.totalReports} />
        <AdminMetricCard icon={<ClipboardList color={colors.goldDark} size={22} />} label="Pending" value={data.totals.pendingReports} tone="gold" />
        <AdminMetricCard icon={<CheckCircle2 color={colors.green} size={22} />} label="Resolved" value={data.totals.resolvedItems} tone="green" />
        <AdminMetricCard icon={<BarChart3 color={colors.primary} size={22} />} label="Recovery Rate" value={`${data.totals.recoveryRate}%`} />
      </View>
      <AdminCard>
        <AppText variant="section">Report Split</AppText>
        <Row label="Lost reports" value={data.totals.lostReports} color={colors.primary} />
        <Row label="Found reports" value={data.totals.foundReports} color={colors.goldDark} />
        <Row label="Claimed items" value={data.totals.claimedItems} color={colors.green} />
        <Row label="Removed reports" value={data.totals.removedReports} color={colors.error} />
      </AdminCard>
      <Breakdown title="Reports by Category" icon={<PieChart color={colors.primary} size={22} />} rows={data.categories} />
      <Breakdown title="Campus Hotspots" icon={<MapPin color={colors.primary} size={22} />} rows={data.locations} />
      <AdminCard>
        <AppText variant="section">Monthly Trend</AppText>
        {data.monthly.length ? (
          data.monthly.map((row) => (
            <View key={row.label} style={{ gap: 8 }}>
              <AppText variant="label">{row.label}</AppText>
              <Row label="Lost" value={row.lost} color={colors.primary} />
              <Row label="Found" value={row.found} color={colors.goldDark} />
              <Row label="Resolved" value={row.resolved} color={colors.green} />
            </View>
          ))
        ) : (
          <AppText muted>No monthly data yet.</AppText>
        )}
      </AdminCard>
    </AdminShell>
  );
}

function Breakdown({ title, icon, rows }: { title: string; icon: React.ReactNode; rows: { label: string; value: number }[] }) {
  return (
    <AdminCard>
      <View style={{ alignItems: "center", flexDirection: "row", gap: 8 }}>
        {icon}
        <AppText variant="section">{title}</AppText>
      </View>
      {rows.length ? rows.map((row) => <Row key={row.label} label={row.label} value={row.value} color={colors.primary} />) : <AppText muted>No data available.</AppText>}
    </AdminCard>
  );
}

function Row({ label, value, color }: { label: string; value: number; color: string }) {
  const width = Math.min(100, Math.max(8, value * 12));
  return (
    <View style={{ gap: 5 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
        <AppText muted>{label}</AppText>
        <AppText variant="label">{value}</AppText>
      </View>
      <View style={{ backgroundColor: colors.surfaceContainer, borderRadius: 3, height: 6, overflow: "hidden" }}>
        <View style={{ backgroundColor: color, height: 6, width: `${width}%` }} />
      </View>
    </View>
  );
}
