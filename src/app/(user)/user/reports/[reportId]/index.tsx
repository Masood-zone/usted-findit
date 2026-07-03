import { router, useLocalSearchParams, type Href } from "expo-router";
import { CalendarDays, MapPin } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { StateView } from "@/components/general/state-view";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { ReportCard, ReportHeader } from "@/components/reports/report-ui";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { ImagePreview } from "@/components/ui/image-preview";
import { InfoTile } from "@/components/user/info-tile";
import { StatusBadge } from "@/components/user/status-badge";
import { UserShell } from "@/components/user/user-shell";
import { useUserReport } from "@/services/queries/hooks";

export default function UserReportDetailsScreen() {
  const params = useLocalSearchParams<{ reportId: string }>();
  const reportId = params.reportId ?? "";
  const report = useUserReport(reportId);
  const data = report.data?.report;

  if (report.isPending) return <LoadingScreen />;
  if (report.isError || !data) {
    return <StateView title="Report unavailable" message="This report could not be loaded." actionLabel="Back to My Reports" onAction={() => router.push("/user/my-reports" as Href)} />;
  }
  const canEdit = ["PENDING", "REJECTED", "PUBLISHED", "CHANGES_REQUESTED"].includes(data.status);

  return (
    <UserShell padded={false}>
      <View style={{ padding: 16 }}>
        <ReportHeader title="Report Details" subtitle={data.referenceNumber} />
      </View>
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {(data.images.length ? data.images : [{ id: "empty", url: "", alt: null, isPrimary: true }]).map((image) => (
          <View key={image.id} style={{ backgroundColor: colors.surfaceContainer, height: 240, width: 390 }}>
            {image.url ? <ImagePreview uri={image.url} alt={image.alt || data.title} containerStyle={{ height: "100%", width: "100%" }} /> : null}
          </View>
        ))}
      </ScrollView>
      <View style={{ gap: 16, padding: 16 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <StatusBadge type={data.type} />
          <StatusBadge status={data.status} />
        </View>
        <AppText variant="section" style={{ color: colors.primary }}>{data.title}</AppText>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <InfoTile icon={<MapPin color={colors.primary} size={22} />} label="Location" value={data.location} />
          <InfoTile icon={<CalendarDays color={colors.primary} size={22} />} label="Event date" value={data.eventDate || "Not set"} />
        </View>
        <ReportCard>
          <AppText variant="label">Public description</AppText>
          <AppText muted>{data.description}</AppText>
        </ReportCard>
        {data.adminNotes ? (
          <ReportCard>
            <AppText variant="label" style={{ color: colors.primary }}>Admin message</AppText>
            <AppText muted>{data.adminNotes}</AppText>
          </ReportCard>
        ) : null}
        <ReportCard>
          <AppText variant="label">Private verification details</AppText>
          <AppText muted>{data.hiddenVerificationDetails || "No private verification details were added."}</AppText>
        </ReportCard>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <AppButton title="Back" variant="secondary" style={{ flex: 1 }} onPress={() => router.back()} />
          <AppButton title="Possible matches" style={{ flex: 1 }} onPress={() => router.push(`/user/reports/${data.id}/matches` as Href)} />
        </View>
        {canEdit ? (
          <AppButton title="Edit report" variant="secondary" onPress={() => router.push(`/user/reports/${data.id}/edit` as Href)} />
        ) : null}
      </View>
    </UserShell>
  );
}
