import { ActivityIndicator, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { UstedLogo } from "@/components/ui/usted-logo";

export function LoadingScreen() {
  return (
    <View style={{ alignItems: "center", backgroundColor: colors.background, flex: 1, gap: 18, justifyContent: "center" }}>
      <UstedLogo size={80} />
      <ActivityIndicator color={colors.primary} />
      <AppText muted>Preparing USTED FindIt...</AppText>
    </View>
  );
}
