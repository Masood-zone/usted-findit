import { router, type Href } from "expo-router";
import { View } from "react-native";
import { DateSelectField } from "@/components/reports/date-select-field";
import { ReportHeader } from "@/components/reports/report-ui";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { UserShell } from "@/components/user/user-shell";
import { useReportDraftStore } from "@/store/report-draft-store";

export default function LostReportStepTwo() {
  const { draft, setDraft } = useReportDraftStore();
  const canContinue = draft.eventDate && draft.eventTime && draft.location;

  return (
    <UserShell>
      <ReportHeader step="Step 2 of 3" title="Location & Time" subtitle="Tell us where and when the item was last seen." />
      <View style={{ gap: 14 }}>
        <DateSelectField label="Date lost" value={draft.eventDate} onChange={(eventDate) => setDraft({ eventDate })} />
        <AppInput label="Time lost" placeholder="HH:MM" value={draft.eventTime} onChangeText={(eventTime) => setDraft({ eventTime })} />
        <AppInput label="Campus location" placeholder="e.g. Main Library, SRC Office" value={draft.location} onChangeText={(location) => setDraft({ location })} />
        <AppInput label="Landmark/details" multiline placeholder="e.g. Near the vending machine on the 2nd floor" value={draft.landmark} onChangeText={(landmark) => setDraft({ landmark })} />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <AppButton title="Back" variant="secondary" style={{ flex: 1 }} onPress={() => router.back()} />
          <AppButton title="Continue" disabled={!canContinue} style={{ flex: 1 }} onPress={() => router.push("/user/report/lost/step-3" as Href)} />
        </View>
      </View>
    </UserShell>
  );
}
