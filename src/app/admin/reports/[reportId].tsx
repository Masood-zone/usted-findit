import { router, useLocalSearchParams, type Href } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { AdminActionModal, AdminCard, AdminShell, AdminStatusBadge } from "@/components/admin/admin-ui";
import { StateView } from "@/components/general/state-view";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { ImagePreview } from "@/components/ui/image-preview";
import { useAdminReport, useApproveAdminReport, useRejectAdminReport, useRemoveAdminReport, useRequestAdminReportChanges, useResolveAdminReport } from "@/services/queries/hooks";

type ModalMode = "reject" | "changes" | "remove" | null;

export default function AdminReportDetailsScreen() {
  const params = useLocalSearchParams<{ reportId: string }>();
  const reportId = params.reportId ?? "";
  const reportQuery = useAdminReport(reportId);
  const approve = useApproveAdminReport(reportId);
  const reject = useRejectAdminReport(reportId);
  const changes = useRequestAdminReportChanges(reportId);
  const remove = useRemoveAdminReport(reportId);
  const resolve = useResolveAdminReport(reportId);
  const [mode, setMode] = useState<ModalMode>(null);
  const [message, setMessage] = useState("");
  const report = reportQuery.data?.report;

  if (reportQuery.isPending) return <LoadingScreen />;
  if (reportQuery.isError || !report) return <StateView title="Report unavailable" message="This report could not be loaded." actionLabel="Back to reports" onAction={() => router.push("/admin/reports" as Href)} />;

  const modalCopy = {
    reject: { title: "Reject Report", label: "Reason", placeholder: "Explain why this report is rejected.", confirmTitle: "Reject", danger: true },
    changes: { title: "Request Changes", label: "Message", placeholder: "Tell the reporter what needs to change.", confirmTitle: "Send" },
    remove: { title: "Remove Report", label: "Reason", placeholder: "Document the fraud, privacy, duplicate, or inappropriate content reason.", confirmTitle: "Remove", danger: true }
  }[mode ?? "changes"];

  function confirmModal() {
    if (mode === "reject") reject.mutate({ reason: message }, { onSuccess: closeModal });
    if (mode === "changes") changes.mutate({ message }, { onSuccess: closeModal });
    if (mode === "remove") remove.mutate({ reason: message }, { onSuccess: closeModal });
  }

  function closeModal() {
    setMode(null);
    setMessage("");
  }

  return (
    <AdminShell title="Report Review">
      <AppButton title="Back to reports" variant="ghost" onPress={() => router.push("/admin/reports" as Href)} style={{ alignSelf: "flex-start", minHeight: 40, paddingHorizontal: 8 }} />
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <AdminStatusBadge type={report.type} />
          <AdminStatusBadge status={report.status} />
        </View>
        <AppText variant="title" style={{ color: colors.primary }}>
          {report.title}
        </AppText>
        <AppText muted>{report.referenceNumber} | Submitted {new Date(report.reportedDate).toLocaleDateString()}</AppText>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row", gap: 12 }}>
          {(report.images.length ? report.images : [{ id: "empty", url: "", alt: null, isPrimary: true }]).map((image) => (
            <View key={image.id} style={{ backgroundColor: colors.surfaceContainer, borderRadius: radius.lg, height: 220, overflow: "hidden", width: 300 }}>
              {image.url ? <ImagePreview uri={image.url} alt={image.alt || report.title} containerStyle={{ height: "100%", width: "100%" }} /> : <View style={{ alignItems: "center", flex: 1, justifyContent: "center" }}><AppText muted>No image</AppText></View>}
            </View>
          ))}
        </View>
      </ScrollView>
      <AdminCard>
        <AppText variant="section">Item Details</AppText>
        <AppText muted>{report.description}</AppText>
        <Info label="Category" value={report.category} />
        <Info label="Location" value={report.location} />
        <Info label="Event date" value={[report.eventDate, report.eventTime].filter(Boolean).join(" ") || "Not provided"} />
        <Info label="Brand / Colour" value={[report.brand, report.colour].filter(Boolean).join(" / ") || "Not provided"} />
        <Info label="Landmark" value={report.landmark || "Not provided"} />
      </AdminCard>
      <AdminCard>
        <AppText variant="section">Verification Features</AppText>
        <Info label="Hidden verification details" value={report.hiddenVerificationDetails || "Not provided"} />
        <Info label="Private owner notes" value={report.privateOwnerNotes || "Not provided"} />
        <Info label="Storage / hand-off" value={report.storageOption || "Not provided"} />
        <Info label="Admin notes" value={report.adminNotes || report.removedReason || "None"} />
      </AdminCard>
      <AdminCard>
        <AppText variant="section">Reporter</AppText>
        <Info label="Name" value={report.reporterName || "Unknown"} />
        <Info label="Email" value={report.reporterEmail || "Unknown"} />
        <Info label="Claims" value={String(report.claimCount)} />
      </AdminCard>
      <View style={{ gap: 10 }}>
        <AppButton title="Approve & Publish" loading={approve.isPending} disabled={!["PENDING", "REJECTED"].includes(report.status)} onPress={() => approve.mutate({})} />
        <AppButton title="Mark Resolved" variant="secondary" loading={resolve.isPending} disabled={!["PUBLISHED", "CLAIMED"].includes(report.status)} onPress={() => resolve.mutate({})} />
        <AppButton title="Request Changes" variant="secondary" onPress={() => setMode("changes")} />
        <AppButton title="Reject Report" variant="danger" onPress={() => setMode("reject")} />
        <AppButton title="Remove Report" variant="ghost" onPress={() => setMode("remove")} />
      </View>
      <AdminActionModal
        visible={Boolean(mode)}
        title={modalCopy.title}
        label={modalCopy.label}
        placeholder={modalCopy.placeholder}
        confirmTitle={modalCopy.confirmTitle}
        danger={modalCopy.danger}
        value={message}
        onChangeText={setMessage}
        onCancel={closeModal}
        onConfirm={confirmModal}
        loading={reject.isPending || changes.isPending || remove.isPending}
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
