import { useMemo, useState } from "react";
import { AdminReportRow, AdminSearch, AdminShell, AdminTabs } from "@/components/admin/admin-ui";
import { StateView } from "@/components/general/state-view";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { AppText } from "@/components/ui/app-text";
import type { AdminReportFilters } from "@/types/admin";
import { useAdminReports } from "@/services/queries/hooks";

const tabs = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Needs Changes", value: "CHANGES_REQUESTED" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Claimed", value: "CLAIMED" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Removed", value: "REMOVED" }
] as const;

export default function AdminReportsScreen() {
  const [status, setStatus] = useState<AdminReportFilters["status"]>("PENDING");
  const [q, setQ] = useState("");
  const filters = useMemo(() => ({ q, status }), [q, status]);
  const reports = useAdminReports(filters);

  if (reports.isPending) return <LoadingScreen />;
  if (reports.isError || !reports.data) return <StateView title="Reports unavailable" message="Admin reports could not be loaded." />;

  return (
    <AdminShell title="Reports">
      <AdminSearch value={q} onChangeText={setQ} placeholder="Search reference, item or location..." />
      <AdminTabs tabs={tabs} value={status ?? "ALL"} onChange={setStatus} />
      <AppText muted>{reports.data.reports.length} report(s)</AppText>
      {reports.data.reports.length ? reports.data.reports.map((report) => <AdminReportRow key={report.id} report={report} />) : <StateView title="No reports found" message="Try another status or search term." />}
    </AdminShell>
  );
}
