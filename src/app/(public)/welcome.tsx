import { AuthHeader } from "@/components/ui/auth-header";
import { AppButton } from "@/components/ui/app-button";
import { ScreenShell } from "@/components/ui/screen-shell";
import { router } from "expo-router";
import { View } from "react-native";

export default function WelcomeScreen() {
  return (
    <ScreenShell centered>
      <AuthHeader
        title="Welcome to USTED FindIt"
        subtitle="Report, search, verify, and reclaim misplaced belongings across campus."
      />
      <View style={{ gap: 12 }}>
        <AppButton title="Sign in" onPress={() => router.push("/sign-in")} />
        <AppButton
          title="Create account"
          variant="secondary"
          onPress={() => router.push("/create-account")}
        />
        {/* <AppText variant="caption" muted center>
          Administrator access is available from the sign in screen.
        </AppText> */}
      </View>
    </ScreenShell>
  );
}
