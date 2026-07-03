import { router, type Href } from "expo-router";
import { CheckCircle2 } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { ImageUploadField } from "@/components/reports/image-upload-field";
import { ReportCard, ReportHeader } from "@/components/reports/report-ui";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { UserShell } from "@/components/user/user-shell";
import { useCreateReport } from "@/services/queries/hooks";
import { useReportDraftStore } from "@/store/report-draft-store";
import type { CreateReportInput } from "@/types/reports";
import { getErrorMessage } from "@/lib/get-error-message";

export default function LostReportStepThree() {
  const { draft, resetDraft, setDraft } = useReportDraftStore();
  const createReport = useCreateReport();
  const canSubmit = draft.title && draft.category && draft.description && draft.eventDate && draft.eventTime && draft.location && draft.confirmed;
  const submitError = createReport.error ? getErrorMessage(createReport.error, "Unable to submit this report right now.") : null;

  async function submit() {
    const payload: CreateReportInput = {
      brand: draft.brand,
      category: draft.category,
      colour: draft.colour,
      description: draft.description,
      eventDate: draft.eventDate,
      eventTime: draft.eventTime,
      hiddenVerificationDetails: draft.hiddenVerificationDetails,
      images: draft.images,
      landmark: draft.landmark,
      location: draft.location,
      title: draft.title,
      type: "LOST"
    };
    try {
      const result = await createReport.mutateAsync(payload);
      setDraft({ submittedReportId: result.report.id });
      resetDraft();
      router.replace(`/user/report/submitted?reportId=${result.report.id}` as Href);
    } catch {
      // The mutation error is rendered below.
    }
  }

  return (
    <UserShell>
      <ReportHeader step="Step 3 of 3" title="Visual Evidence" subtitle="Photos are optional. A detailed description can still help us find strong matches." />
      <View style={{ gap: 16 }}>
        <ImageUploadField
          helper="Optional: upload up to 4 clear photos if you have them."
          images={draft.images}
          label="Photos optional"
          maxImages={4}
          purpose="reportImage"
          onChange={(images) => setDraft({ images })}
          onFailure={(message) => router.push(`/user/report/upload-failed?message=${encodeURIComponent(message)}` as Href)}
        />
        <ReportCard>
          <AppText variant="label" style={{ color: colors.primary }}>
            Report Summary
          </AppText>
          <AppText>{draft.title}</AppText>
          <AppText muted>{draft.category} • {draft.location}</AppText>
          <AppText muted>{draft.eventDate} at {draft.eventTime}</AppText>
        </ReportCard>
        <Pressable
          onPress={() => setDraft({ confirmed: !draft.confirmed })}
          style={{ alignItems: "center", borderColor: draft.confirmed ? colors.primary : colors.border, borderRadius: radius.md, borderWidth: 1, flexDirection: "row", gap: 10, padding: 12 }}
        >
          <CheckCircle2 color={draft.confirmed ? colors.primary : colors.muted} size={22} />
          <AppText style={{ flex: 1 }}>I confirm this report is accurate and does not expose private verification details publicly.</AppText>
        </Pressable>
        {submitError ? (
          <AppText variant="caption" style={{ color: colors.error }}>
            {submitError}
          </AppText>
        ) : null}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <AppButton title="Back" variant="secondary" style={{ flex: 1 }} onPress={() => router.back()} />
          <AppButton title="Submit lost-item report" disabled={!canSubmit} loading={createReport.isPending} style={{ flex: 1 }} onPress={submit} />
        </View>
      </View>
    </UserShell>
  );
}
