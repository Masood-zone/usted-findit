import { router, useLocalSearchParams, type Href } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { AdminActionModal, AdminCard, AdminShell, AdminStatusBadge } from "@/components/admin/admin-ui";
import { StateView } from "@/components/general/state-view";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { ImagePreview } from "@/components/ui/image-preview";
import { useAdminClaim, useApproveAdminClaim, useRejectAdminClaim } from "@/services/queries/hooks";

export default function AdminClaimDetailsScreen() {
  const params = useLocalSearchParams<{ claimId: string }>();
  const claimId = params.claimId ?? "";
  const claimQuery = useAdminClaim(claimId);
  const approve = useApproveAdminClaim(claimId);
  const reject = useRejectAdminClaim(claimId);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const claim = claimQuery.data?.claim;

  if (claimQuery.isPending) return <LoadingScreen />;
  if (claimQuery.isError || !claim) return <StateView title="Claim unavailable" message="This claim could not be loaded." actionLabel="Back to claims" onAction={() => router.push("/admin/claims" as Href)} />;

  return (
    <AdminShell title="Claim Verification">
      <AppButton title="Back to claims" variant="ghost" onPress={() => router.push("/admin/claims" as Href)} style={{ alignSelf: "flex-start", minHeight: 40, paddingHorizontal: 8 }} />
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <AdminStatusBadge status={claim.status} />
          <AdminStatusBadge status={claim.itemStatus} />
        </View>
        <AppText variant="title" style={{ color: colors.primary }}>
          {claim.itemTitle}
        </AppText>
        <AppText muted>{claim.referenceNumber} | Claimed by {claim.claimantName}</AppText>
      </View>
      <AdminCard>
        <AppText variant="section">Claimant Proof</AppText>
        <Info label="Claimant" value={`${claim.claimantName} (${claim.claimantEmail})`} />
        <Info label="Proof description" value={claim.proofDescription} />
        <Info label="Hidden details" value={claim.hiddenDetails} />
        {claim.evidenceImageUrl ? (
          <View style={{ backgroundColor: colors.surfaceContainer, borderRadius: radius.lg, height: 220, overflow: "hidden" }}>
            <ImagePreview uri={claim.evidenceImageUrl} alt={`${claim.claimantName} evidence for ${claim.itemTitle}`} containerStyle={{ height: "100%", width: "100%" }} />
          </View>
        ) : (
          <AppText muted>No evidence image attached.</AppText>
        )}
      </AdminCard>
      <AdminCard>
        <AppText variant="section">Pickup Decision</AppText>
        <Info label="Pickup location" value={claim.pickupLocation || "Security Office"} />
        <Info label="Pickup code" value={claim.pickupCode || "Generated after approval"} />
        <Info label="Admin notes" value={claim.adminNotes || "None"} />
      </AdminCard>
      <View style={{ gap: 10 }}>
        <AppButton title="Approve Claim" loading={approve.isPending} disabled={claim.itemStatus === "RESOLVED" || claim.status === "APPROVED"} onPress={() => approve.mutate({ pickupLocation: "Security Office" })} />
        <AppButton title="Reject Claim" variant="danger" loading={reject.isPending} disabled={claim.status === "REJECTED"} onPress={() => setRejectOpen(true)} />
      </View>
      <AdminActionModal
        visible={rejectOpen}
        title="Reject Claim"
        label="Reason"
        placeholder="Explain why the ownership proof is not sufficient."
        confirmTitle="Reject"
        danger
        value={reason}
        onChangeText={setReason}
        onCancel={() => {
          setRejectOpen(false);
          setReason("");
        }}
        onConfirm={() => reject.mutate({ reason }, { onSuccess: () => { setRejectOpen(false); setReason(""); } })}
        loading={reject.isPending}
      />
    </AdminShell>
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
