import { Check } from "lucide-react-native";
import { View } from "react-native";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { ScreenShell } from "@/components/ui/screen-shell";
import { UstedLogo } from "@/components/ui/usted-logo";
import { router } from "expo-router";

export default function ResetSuccessScreen() {
  return (
    <ScreenShell centered>
      <UstedLogo text size={112} />
      <View
        style={{
          alignItems: "center",
          backgroundColor: colors.green,
          borderRadius: radius.full,
          height: 96,
          justifyContent: "center",
          width: 96
        }}
      >
        <Check color={colors.surface} size={48} />
      </View>
      <View style={{ gap: 10 }}>
        <AppText variant="section" center>
          Password Reset Successful
        </AppText>
        <AppText muted center>
          Your account credentials have been updated. You can now sign in with your new password.
        </AppText>
      </View>
      <AppButton title="Sign in" onPress={() => router.replace("/sign-in")} />
    </ScreenShell>
  );
}
