import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { ProgressDots } from "@/components/ui/progress-dots";
import { ScreenShell } from "@/components/ui/screen-shell";
import { UstedLogo } from "@/components/ui/usted-logo";
import { useOnboardingStore } from "@/store/onboarding-store";
import { router } from "expo-router";
import { View } from "react-native";

export default function OnboardingReclaimSafelyScreen() {
  const markSeen = useOnboardingStore((state) => state.markPublicOnboardingSeen);

  function finish() {
    markSeen();
    router.replace("/welcome");
  }

  return (
    <ScreenShell centered>
      <UstedLogo size={96} />
      <View style={{ gap: 10 }}>
        <AppText variant="title" center>
          Verify ownership and reclaim safely
        </AppText>
        <AppText muted center>
          Claims are reviewed before items are released, helping protect students, staff, and visitors.
        </AppText>
      </View>
      <ProgressDots count={2} activeIndex={1} />
      <View style={{ gap: 12 }}>
        <AppButton title="Get started" onPress={finish} />
        <AppButton title="Back" variant="ghost" onPress={() => router.back()} />
      </View>
    </ScreenShell>
  );
}
