import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { UstedLogo } from "@/components/ui/usted-logo";
import { router } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/onboarding/report-items");
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ alignItems: "center", backgroundColor: colors.primary, flex: 1, gap: 18, justifyContent: "center" }}>
      <UstedLogo text size={140} />
      <AppText center style={{ color: colors.surface }}>
        Lost and Found Management Portal
      </AppText>
    </View>
  );
}
