import { Stack } from "expo-router";
import { colors } from "@/components/ui/design-system";

export default function ReportFlowLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitle: "Report",
        headerTitleStyle: { color: colors.primary, fontFamily: "Montserrat_700Bold" }
      }}
    />
  );
}
