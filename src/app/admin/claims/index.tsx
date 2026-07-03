import { useState } from "react";
import { AdminClaimRow, AdminShell, AdminTabs } from "@/components/admin/admin-ui";
import { StateView } from "@/components/general/state-view";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { AppText } from "@/components/ui/app-text";
import type { ClaimStatus } from "@/types/reports";
import { useAdminClaims } from "@/services/queries/hooks";

const tabs = [
  { label: "All", value: "ALL" },
  { label: "New", value: "SUBMITTED" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" }
] as const;

export default function AdminClaimsScreen() {
  const [status, setStatus] = useState<ClaimStatus | "ALL">("SUBMITTED");
  const claims = useAdminClaims(status);

  if (claims.isPending) return <LoadingScreen />;
  if (claims.isError || !claims.data) return <StateView title="Claims unavailable" message="Admin claims could not be loaded." />;

  return (
    <AdminShell title="Claims">
      <AdminTabs tabs={tabs} value={status} onChange={setStatus} />
      <AppText muted>{claims.data.claims.length} claim(s)</AppText>
      {claims.data.claims.length ? claims.data.claims.map((claim) => <AdminClaimRow key={claim.id} claim={claim} />) : <StateView title="No claims found" message="There are no claims in this status." />}
    </AdminShell>
  );
}
