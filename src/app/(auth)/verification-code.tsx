import { MailCheck } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { ScreenShell } from "@/components/ui/screen-shell";
import { UstedLogo } from "@/components/ui/usted-logo";
import { OtpInput } from "@/components/user/otp-input";
import { router, type Href } from "expo-router";

export default function VerificationCodeScreen() {
  const [code, setCode] = useState("");
  const complete = code.length === 6;

  return (
    <ScreenShell centered>
      <View style={{ alignItems: "center", gap: 14 }}>
        <UstedLogo text size={112} />
        <View
          style={{
            alignItems: "center",
            backgroundColor: colors.surfaceContainer,
            borderRadius: radius.full,
            height: 64,
            justifyContent: "center",
            width: 64
          }}
        >
          <MailCheck color={colors.primary} size={32} />
        </View>
        <AppText variant="section" center>
          Verify your email
        </AppText>
        <AppText muted center>
          Enter the 6-digit verification code sent to your institutional email.
        </AppText>
      </View>
      <OtpInput onChangeCode={setCode} />
      <View style={{ gap: 12 }}>
        <AppButton title="Verify code" disabled={!complete} onPress={() => router.replace("/reset-success" as Href)} />
        <AppButton title="Resend code" variant="ghost" />
      </View>
    </ScreenShell>
  );
}
