import { router, type Href } from "expo-router";
import { View } from "react-native";
import { ImageUploadField } from "@/components/reports/image-upload-field";
import { ReportCard, ReportHeader } from "@/components/reports/report-ui";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { UserShell } from "@/components/user/user-shell";
import { useCreateReport } from "@/services/queries/hooks";
import { useReportDraftStore } from "@/store/report-draft-store";
import type { CreateReportInput } from "@/types/reports";
import { getErrorMessage } from "@/lib/get-error-message";

export default function FoundReportStepThree() {
  const { draft, resetDraft, setDraft } = useReportDraftStore();
  const createReport = useCreateReport();
  const canSubmit = draft.title && draft.category && draft.description && draft.eventDate && draft.eventTime && draft.location && draft.storageOption && draft.hiddenVerificationDetails;
  const submitError = createReport.error ? getErrorMessage(createReport.error, "Unable to submit this report right now.") : null;

  async function submit() {
    const payload: CreateReportInput = {
      category: draft.category,
      colour: draft.colour,
      description: draft.description,
      eventDate: draft.eventDate,
      eventTime: draft.eventTime,
      hiddenVerificationDetails: draft.hiddenVerificationDetails,
      images: draft.images,
      landmark: draft.landmark,
      location: draft.location,
      storageOption: draft.storageOption,
      title: draft.title,
      type: "FOUND",
      verificationQuestion: draft.verificationQuestion
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
      <ReportHeader step="Step 3 of 3" title="Finalize Report" subtitle="Add photos and private verification details that only staff should use." />
      <View style={{ gap: 16 }}>
        <ImageUploadField
          helper="Upload clear photos to help owners identify their item."
          images={draft.images}
          label="Photos"
          maxImages={4}
          purpose="reportImage"
          onChange={(images) => setDraft({ images })}
          onFailure={(message) => router.push(`/user/report/upload-failed?message=${encodeURIComponent(message)}` as Href)}
        />
        <AppInput label="Verification question" placeholder="e.g. What is the lock screen wallpaper?" value={draft.verificationQuestion} onChangeText={(verificationQuestion) => setDraft({ verificationQuestion })} />
        <AppInput
          label="Hidden verification details"
          multiline
          placeholder="e.g. Serial ending, contents, unique scratch, sticker..."
          value={draft.hiddenVerificationDetails}
          onChangeText={(hiddenVerificationDetails) => setDraft({ hiddenVerificationDetails })}
        />
        <ReportCard>
          <AppText variant="label" style={{ color: colors.primary }}>
            Report Summary
          </AppText>
          <AppText>{draft.title}</AppText>
          <AppText muted>{draft.category} • {draft.location}</AppText>
          <AppText muted>Storage: {draft.storageOption}</AppText>
        </ReportCard>
        {submitError ? (
          <AppText variant="caption" style={{ color: colors.error }}>
            {submitError}
          </AppText>
        ) : null}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <AppButton title="Back" variant="secondary" style={{ flex: 1 }} onPress={() => router.back()} />
          <AppButton title="Submit found-item report" disabled={!canSubmit} loading={createReport.isPending} style={{ flex: 1 }} onPress={submit} />
        </View>
      </View>
    </UserShell>
  );
}
