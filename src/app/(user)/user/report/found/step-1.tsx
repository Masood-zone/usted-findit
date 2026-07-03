import { router, type Href } from "expo-router";
import { View } from "react-native";
import { CategorySelectField } from "@/components/reports/category-select-field";
import { ReportHeader } from "@/components/reports/report-ui";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { UserShell } from "@/components/user/user-shell";
import { useReportDraftStore } from "@/store/report-draft-store";

export default function FoundReportStepOne() {
  const { draft, setDraft } = useReportDraftStore();
  const canContinue = draft.title && draft.category && draft.description;

  return (
    <UserShell>
      <ReportHeader step="Step 1 of 3" title="Report a Found Item" subtitle="Add public identifying details. Keep proof-only information for the verification step." />
      <View style={{ gap: 14 }}>
        <AppInput label="Item name" placeholder="e.g. Blue Backpack, Student ID" value={draft.title} onChangeText={(title) => setDraft({ title, type: "FOUND" })} />
        <CategorySelectField label="Category" value={draft.category} onChange={(category) => setDraft({ category })} />
        <AppInput label="Colour" placeholder="e.g. Matte black" value={draft.colour} onChangeText={(colour) => setDraft({ colour })} />
        <AppInput label="Public description" multiline placeholder="Describe visible markings without serial numbers or private contents..." value={draft.description} onChangeText={(description) => setDraft({ description })} />
        <AppButton title="Continue" disabled={!canContinue} onPress={() => router.push("/user/report/found/step-2" as Href)} />
      </View>
    </UserShell>
  );
}
