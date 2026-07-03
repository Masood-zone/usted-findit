import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { ProgressDots } from "@/components/ui/progress-dots";
import { ScreenShell } from "@/components/ui/screen-shell";
import { UstedLogo } from "@/components/ui/usted-logo";
import { useOnboardingStore } from "@/store/onboarding-store";
import { router } from "expo-router";
import { View } from "react-native";

export default function OnboardingReportItemsScreen() {
  const markSeen = useOnboardingStore((state) => state.markPublicOnboardingSeen);

  function skip() {
    markSeen();
    router.replace("/welcome");
  }

  return (
    <ScreenShell centered>
      <UstedLogo size={96} />
      <View style={{ gap: 10 }}>
        <AppText variant="title" center>
          Report lost and found items quickly
        </AppText>
        <AppText muted center>
          Submit item details, campus location, and photos so the right person can find it faster.
        </AppText>
      </View>
      <ProgressDots count={2} activeIndex={0} />
      <View style={{ gap: 12 }}>
        <AppButton title="Next" onPress={() => router.push("/onboarding/reclaim-safely")} />
        <AppButton title="Skip" variant="ghost" onPress={skip} />
      </View>
    </ScreenShell>
  );
}
