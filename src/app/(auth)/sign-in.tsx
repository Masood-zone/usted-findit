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
import { PasswordInput } from "@/components/ui/password-input";
import { ScreenShell } from "@/components/ui/screen-shell";
import { getErrorMessage } from "@/lib/get-error-message";
import { getAuthUserHomeHref, signIn } from "@/lib/auth-client";
import { getUserProfile } from "@/services/api/user";
import { router } from "expo-router";

const signInSchema = z.object({
  email: z.email("Enter a valid institutional email."),
  password: z.string().min(6, "Password must be at least 6 characters.")
});

type SignInForm = z.infer<typeof signInSchema>;

export default function SignInScreen() {
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    setError
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  async function onSubmit(values: SignInForm) {
    try {
      await signIn(values);
      const profile = await getUserProfile();
      router.replace(getAuthUserHomeHref(profile.user));
    } catch (error) {
      setError("root", {
        message: getErrorMessage(error, "Unable to sign in with those details.")
      });
    }
  }

  return (
    <ScreenShell centered>
      <AuthHeader title="Sign in" subtitle="Access the USTED FindIt lost and found portal." />
      <View style={{ gap: 16 }}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onBlur, onChange, value } }) => (
            <AppInput
              autoCapitalize="none"
              autoComplete="email"
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
        <Controller
          control={control}
          name="password"
          render={({ field: { onBlur, onChange, value } }) => (
            <PasswordInput
              error={errors.password?.message}
              label="Password"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Enter your password"
              value={value}
            />
          )}
        />
        {errors.root?.message ? (
          <AppText variant="caption" style={{ color: colors.error }}>
            {errors.root.message}
          </AppText>
        ) : null}
        <AppButton title="Sign in" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
        <AppButton title="Forgot password" variant="ghost" onPress={() => router.push("/forgot-password")} />
        <AppButton title="Create account" variant="secondary" onPress={() => router.push("/create-account")} />
      </View>
    </ScreenShell>
  );
}
