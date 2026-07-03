import { zodResolver } from "@hookform/resolvers/zod";
import { Badge, Mail, Phone, User } from "lucide-react-native";
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
import { signUp } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/get-error-message";
import { router } from "expo-router";

const createAccountSchema = z
  .object({
    name: z.string().min(2, "Enter your full name."),
    email: z.email("Enter a valid institutional email."),
    phone: z.string().min(7, "Enter a valid phone number.").optional().or(z.literal("")),
    institutionId: z.string().min(3, "Enter your student or staff ID.").optional().or(z.literal("")),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm your password.")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  });

type CreateAccountForm = z.infer<typeof createAccountSchema>;

export default function CreateAccountScreen() {
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    setError
  } = useForm<CreateAccountForm>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      institutionId: "",
      password: "",
      confirmPassword: ""
    }
  });

  async function onSubmit(values: CreateAccountForm) {
    try {
      await signUp({
        email: values.email,
        institutionId: values.institutionId || undefined,
        name: values.name,
        password: values.password,
        phone: values.phone || undefined
      });
      router.replace("/");
    } catch (error) {
      setError("root", {
        message: getErrorMessage(error, "Unable to create your account.")
      });
    }
  }

  return (
    <ScreenShell>
      <AuthHeader title="Create account" subtitle="Join USTED FindIt to report and claim campus items." />
      <View style={{ gap: 16 }}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onBlur, onChange, value } }) => (
            <AppInput
              error={errors.name?.message}
              label="Full name"
              left={<User color={colors.outline} size={20} />}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Your full name"
              value={value}
            />
          )}
        />
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
        <Controller
          control={control}
          name="institutionId"
          render={({ field: { onBlur, onChange, value } }) => (
            <AppInput
              error={errors.institutionId?.message}
              label="Student or staff ID"
              left={<Badge color={colors.outline} size={20} />}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="USTED ID number"
              value={value}
            />
          )}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field: { onBlur, onChange, value } }) => (
            <AppInput
              error={errors.phone?.message}
              keyboardType="phone-pad"
              label="Phone number"
              left={<Phone color={colors.outline} size={20} />}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="024 000 0000"
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
              placeholder="Create a password"
              value={value}
            />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onBlur, onChange, value } }) => (
            <PasswordInput
              error={errors.confirmPassword?.message}
              label="Confirm password"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Repeat password"
              value={value}
            />
          )}
        />
        {errors.root?.message ? (
          <AppText variant="caption" style={{ color: colors.error }}>
            {errors.root.message}
          </AppText>
        ) : null}
        <AppButton title="Create account" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
        <AppButton title="I already have an account" variant="ghost" onPress={() => router.push("/sign-in")} />
      </View>
    </ScreenShell>
  );
}
