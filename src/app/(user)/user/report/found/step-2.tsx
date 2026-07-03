import { router, type Href } from "expo-router";
import { Circle } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { DateSelectField } from "@/components/reports/date-select-field";
import { ReportHeader } from "@/components/reports/report-ui";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { UserShell } from "@/components/user/user-shell";
import { useReportDraftStore } from "@/store/report-draft-store";

const storageOptions = [
  {
    description: "Handed over to authorized personnel for safekeeping.",
    label: "Campus Security Office"
  },
  {
    description: "Left at the nearest reception or faculty office.",
    label: "Department Front Desk"
  },
  {
    description: "I still have the item. Owners will contact you via app.",
    label: "Personal Custody"
  }
];

export default function FoundReportStepTwo() {
  const { draft, setDraft } = useReportDraftStore();
  const presetValue = storageOptions.find((option) => option.label === draft.storageOption)?.label ?? null;
  const [storageMode, setStorageMode] = useState<"preset" | "other">(presetValue || !draft.storageOption ? "preset" : "other");
  const canContinue = draft.eventDate && draft.eventTime && draft.location && draft.storageOption.trim();

  return (
    <UserShell>
      <ReportHeader step="Step 2 of 3" title="Location & Time" subtitle="Tell us where the item was found and where it is being kept." />
      <View style={{ gap: 14 }}>
        <DateSelectField label="Date found" value={draft.eventDate} onChange={(eventDate) => setDraft({ eventDate })} />
        <AppInput label="Time found" placeholder="HH:MM" value={draft.eventTime} onChangeText={(eventTime) => setDraft({ eventTime })} />
        <AppInput label="Found location" placeholder="e.g. Main Library, Cafeteria" value={draft.location} onChangeText={(location) => setDraft({ location })} />
        <View style={{ gap: 8 }}>
          <AppText variant="label" muted style={{ marginLeft: 4 }}>
            Current handover or storage location
          </AppText>
          {storageOptions.map((option) => {
            const active = storageMode === "preset" && draft.storageOption === option.label;
            return (
              <Pressable
                key={option.label}
                onPress={() => {
                  setStorageMode("preset");
                  setDraft({ storageOption: option.label });
                }}
                style={{
                  backgroundColor: active ? colors.surfaceContainerLow : colors.surface,
                  borderColor: active ? colors.primary : colors.border,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  flexDirection: "row",
                  gap: 12,
                  padding: 14
                }}
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
              if (storageOptions.some((option) => option.label === draft.storageOption)) {
                setDraft({ storageOption: "" });
              }
            }}
            style={{
              backgroundColor: storageMode === "other" ? colors.surfaceContainerLow : colors.surface,
              borderColor: storageMode === "other" ? colors.primary : colors.border,
              borderRadius: radius.md,
              borderWidth: 1,
              flexDirection: "row",
              gap: 12,
              padding: 14
            }}
          >
            <Circle color={storageMode === "other" ? colors.primary : colors.muted} fill={storageMode === "other" ? colors.primary : "transparent"} size={18} />
            <View style={{ flex: 1, gap: 4 }}>
              <AppText variant="label">Other</AppText>
              <AppText variant="caption" muted>Please specify where the item is being kept.</AppText>
            </View>
          </Pressable>
          {storageMode === "other" ? (
            <AppInput label="Other, please specify" placeholder="e.g. Faculty accounts office" value={draft.storageOption} onChangeText={(storageOption) => setDraft({ storageOption })} />
          ) : null}
        </View>
        <AppInput label="Landmark/details" multiline placeholder="e.g. Near the entrance desk" value={draft.landmark} onChangeText={(landmark) => setDraft({ landmark })} />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <AppButton title="Back" variant="secondary" style={{ flex: 1 }} onPress={() => router.back()} />
          <AppButton title="Continue" disabled={!canContinue} style={{ flex: 1 }} onPress={() => router.push("/user/report/found/step-3" as Href)} />
        </View>
      </View>
    </UserShell>
  );
}
