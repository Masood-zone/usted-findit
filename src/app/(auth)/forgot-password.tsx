import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { z } from "zod";
import { AuthHeader } from "@/components/ui/auth-header";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { ScreenShell } from "@/components/ui/screen-shell";
import { router } from "expo-router";

const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid institutional email.")
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const {
    control,
    formState: { errors, isSubmitSuccessful, isSubmitting },
    handleSubmit
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ""
    }
  });

  async function onSubmit() {
    await new Promise((resolve) => setTimeout(resolve, 450));
  }

  return (
    <ScreenShell centered>
      <AuthHeader title="Forgot password" subtitle="Enter your institutional email to receive reset instructions." />
      <View style={{ gap: 16 }}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onBlur, onChange, value } }) => (
            <AppInput
              autoCapitalize="none"
              error={errors.email?.message}
              keyboardType="email-address"
              label="Institutional email"
              left={<Mail color={colors.outline} size={20} />}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="name@usted.edu.gh"
              value={value}
            />
          )}
        />
        {isSubmitSuccessful ? (
          <AppText variant="caption" style={{ color: colors.green }}>
            If that email exists, reset instructions will be sent shortly.
          </AppText>
        ) : null}
        <AppButton title="Send reset email" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
        <AppButton title="Back to sign in" variant="ghost" onPress={() => router.push("/sign-in")} />
      </View>
    </ScreenShell>
  );
}
