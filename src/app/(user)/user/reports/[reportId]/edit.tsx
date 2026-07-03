import { router, useLocalSearchParams, type Href } from "expo-router";
import { Circle } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { CategorySelectField } from "@/components/reports/category-select-field";
import { DateSelectField } from "@/components/reports/date-select-field";
import { ImageUploadField } from "@/components/reports/image-upload-field";
import { ReportCard, ReportHeader } from "@/components/reports/report-ui";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { StateView } from "@/components/general/state-view";
import { UserShell } from "@/components/user/user-shell";
import { getErrorMessage } from "@/lib/get-error-message";
import { useUpdateReport, useUserReport } from "@/services/queries/hooks";
import type { CreateReportInput, ReportDraftImage } from "@/types/reports";

const editableStatuses = new Set(["PENDING", "REJECTED", "PUBLISHED", "CHANGES_REQUESTED"]);
const storageOptions = [
  { description: "Handed over to authorized personnel for safekeeping.", label: "Campus Security Office" },
  { description: "Left at the nearest reception or faculty office.", label: "Department Front Desk" },
  { description: "I still have the item. Owners will contact you via app.", label: "Personal Custody" }
];

function existingImagesToDraft(images: { alt: string | null; id: string; isPrimary: boolean; url: string }[]): ReportDraftImage[] {
  return images.map((image) => ({
    previewUrl: image.url,
    publicId: image.id,
    secureUrl: image.url,
    url: image.url
  }));
}

export default function EditReportScreen() {
  const params = useLocalSearchParams<{ reportId: string }>();
  const reportId = params.reportId ?? "";
  const report = useUserReport(reportId);
  const updateReport = useUpdateReport(reportId);
  const data = report.data?.report;
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [colour, setColour] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [location, setLocation] = useState("");
  const [landmark, setLandmark] = useState("");
  const [storageOption, setStorageOption] = useState("");
  const [hiddenVerificationDetails, setHiddenVerificationDetails] = useState("");
  const [images, setImages] = useState<ReportDraftImage[]>([]);
  const [storageMode, setStorageMode] = useState<"preset" | "other">("preset");
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!data) return;

    setTitle(data.title);
    setCategory(data.category);
    setBrand(data.brand ?? "");
    setColour(data.colour ?? "");
    setDescription(data.description);
    setEventDate(data.eventDate ?? "");
    setEventTime(data.eventTime ?? "");
    setLocation(data.location);
    setLandmark(data.landmark ?? "");
    setStorageOption(data.storageOption ?? "");
    setHiddenVerificationDetails(data.hiddenVerificationDetails ?? "");
    setImages(existingImagesToDraft(data.images));
    setStorageMode(storageOptions.some((option) => option.label === data.storageOption) || !data.storageOption ? "preset" : "other");
  }, [data]);

  if (report.isPending) return <LoadingScreen />;
  if (report.isError || !data) {
    return <StateView title="Report unavailable" message="This report could not be loaded." actionLabel="Back" onAction={() => router.back()} />;
  }
  const reportData = data;
  if (!editableStatuses.has(reportData.status)) {
    return <StateView title="Report locked" message="Claimed, resolved, or removed reports cannot be edited." actionLabel="Back" onAction={() => router.back()} />;
  }

  const isFound = reportData.type === "FOUND";
  const canContinueStepOne = Boolean(title && category && description);
  const canContinueStepTwo = Boolean(eventDate && eventTime && location && (!isFound || storageOption.trim()));
  const canSubmit = canContinueStepOne && canContinueStepTwo;
  const submitError = updateReport.error ? getErrorMessage(updateReport.error, "Unable to update this report right now.") : null;

  async function submit() {
    const payload: CreateReportInput = {
      brand,
      category,
      colour,
      description,
      eventDate,
      eventTime,
      hiddenVerificationDetails,
      images,
      landmark,
      location,
      storageOption,
      title,
      type: reportData.type
    };

    try {
      await updateReport.mutateAsync(payload);
      router.replace(`/user/reports/${reportData.id}` as Href);
    } catch {
      // Rendered below.
    }
  }

  return (
    <UserShell>
      <ReportHeader title="Edit Report" step={`Step ${step} of 3`} subtitle="Saving changes sends this report back for admin review." />
      <View style={{ gap: 14 }}>
        {reportData.adminNotes ? (
          <ReportCard>
            <AppText variant="label" style={{ color: colors.primary }}>Admin requested changes</AppText>
            <AppText muted>{reportData.adminNotes}</AppText>
          </ReportCard>
        ) : null}
        {step === 1 ? (
          <>
            <AppInput label="Item name" value={title} onChangeText={setTitle} />
            <CategorySelectField label="Category" value={category} onChange={setCategory} />
            <AppInput label="Brand (optional)" value={brand} onChangeText={setBrand} />
            <AppInput label="Colour" value={colour} onChangeText={setColour} />
            <AppInput label="Public description" multiline value={description} onChangeText={setDescription} />
          </>
        ) : null}
        {step === 2 ? (
          <>
            <DateSelectField label={isFound ? "Date found" : "Date lost"} value={eventDate} onChange={setEventDate} />
            <AppInput label={isFound ? "Time found" : "Time lost"} placeholder="HH:MM" value={eventTime} onChangeText={setEventTime} />
            <AppInput label={isFound ? "Found location" : "Last seen location"} value={location} onChangeText={setLocation} />
            {isFound ? (
              <View style={{ gap: 8 }}>
                <AppText variant="label" muted style={{ marginLeft: 4 }}>Current handover or storage location</AppText>
                {storageOptions.map((option) => {
                  const active = storageMode === "preset" && storageOption === option.label;
                  return (
                    <Pressable
                      key={option.label}
                      onPress={() => {
                        setStorageMode("preset");
                        setStorageOption(option.label);
                      }}
                      style={{ backgroundColor: active ? colors.surfaceContainerLow : colors.surface, borderColor: active ? colors.primary : colors.border, borderRadius: radius.md, borderWidth: 1, flexDirection: "row", gap: 12, padding: 14 }}
                    >
                      <Circle color={active ? colors.primary : colors.muted} fill={active ? colors.primary : "transparent"} size={18} />
                      <View style={{ flex: 1, gap: 4 }}>
                        <AppText variant="label">{option.label}</AppText>
                        <AppText variant="caption" muted>{option.description}</AppText>
                      </View>
                    </Pressable>
                  );
                })}
                <Pressable
                  onPress={() => {
                    setStorageMode("other");
                    if (storageOptions.some((option) => option.label === storageOption)) setStorageOption("");
                  }}
                  style={{ backgroundColor: storageMode === "other" ? colors.surfaceContainerLow : colors.surface, borderColor: storageMode === "other" ? colors.primary : colors.border, borderRadius: radius.md, borderWidth: 1, flexDirection: "row", gap: 12, padding: 14 }}
                >
                  <Circle color={storageMode === "other" ? colors.primary : colors.muted} fill={storageMode === "other" ? colors.primary : "transparent"} size={18} />
                  <View style={{ flex: 1, gap: 4 }}>
                    <AppText variant="label">Other</AppText>
                    <AppText variant="caption" muted>Please specify where the item is being kept.</AppText>
                  </View>
                </Pressable>
                {storageMode === "other" ? <AppInput label="Other, please specify" value={storageOption} onChangeText={setStorageOption} /> : null}
              </View>
            ) : null}
            <AppInput label="Landmark/details" multiline value={landmark} onChangeText={setLandmark} />
          </>
        ) : null}
        {step === 3 ? (
          <>
            <AppInput label={isFound ? "Hidden verification details" : "Private owner notes"} multiline value={hiddenVerificationDetails} onChangeText={setHiddenVerificationDetails} />
            <ImageUploadField
              helper={reportData.type === "LOST" ? "Optional: keep existing photos or upload up to 4 clear photos." : "Optional: keep existing photos or upload clear photos to help owners identify their item."}
              images={images}
              label="Photos optional"
              maxImages={4}
              purpose="reportImage"
              onChange={setImages}
            />
            <ReportCard>
              <AppText variant="label" style={{ color: colors.primary }}>Review before submitting</AppText>
              <AppText>{title}</AppText>
              <AppText muted>{category} - {location}</AppText>
              <AppText muted>{eventDate} at {eventTime}</AppText>
            </ReportCard>
          </>
        ) : null}
        {submitError ? <AppText variant="caption" style={{ color: colors.error }}>{submitError}</AppText> : null}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <AppButton title={step === 1 ? "Cancel" : "Back"} variant="secondary" style={{ flex: 1 }} onPress={() => (step === 1 ? router.back() : setStep((value) => value - 1))} />
          {step < 3 ? (
            <AppButton title="Continue" disabled={step === 1 ? !canContinueStepOne : !canContinueStepTwo} style={{ flex: 1 }} onPress={() => setStep((value) => value + 1)} />
          ) : (
            <AppButton title="Submit for review" disabled={!canSubmit} loading={updateReport.isPending} style={{ flex: 1 }} onPress={submit} />
          )}
        </View>
      </View>
    </UserShell>
  );
}
