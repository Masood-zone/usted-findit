import { router, type Href } from "expo-router";
import { View } from "react-native";
import { CategorySelectField } from "@/components/reports/category-select-field";
import { ReportHeader } from "@/components/reports/report-ui";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { UserShell } from "@/components/user/user-shell";
import { useReportDraftStore } from "@/store/report-draft-store";

export default function LostReportStepOne() {
  const { draft, setDraft } = useReportDraftStore();
  const canContinue = draft.title && draft.category && draft.description;

  return (
    <UserShell>
      <ReportHeader step="Step 1 of 3" title="Report a Lost Item" subtitle="Describe the item clearly without exposing sensitive verification details." />
      <View style={{ gap: 14 }}>
        <AppInput label="Item name" placeholder="e.g. iPhone 13 Pro, Leather Wallet" value={draft.title} onChangeText={(title) => setDraft({ title, type: "LOST" })} />
        <CategorySelectField label="Category" value={draft.category} onChange={(category) => setDraft({ category })} />
        <AppInput label="Brand (optional)" placeholder="e.g. Apple, Samsung, Gucci" value={draft.brand} onChangeText={(brand) => setDraft({ brand })} />
        <AppInput label="Colour" placeholder="e.g. Black, Silver, Maroon" value={draft.colour} onChangeText={(colour) => setDraft({ colour })} />
        <AppInput label="Public description" multiline placeholder="No photo? Describe the item carefully: shape, size, marks, stickers, contents, scratches, or where it was last seen." value={draft.description} onChangeText={(description) => setDraft({ description })} />
        <AppButton title="Continue" disabled={!canContinue} onPress={() => router.push("/user/report/lost/step-2" as Href)} />
      </View>
    </UserShell>
  );
}
