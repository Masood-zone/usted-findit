import { router } from "expo-router";
import { CheckCircle2, Mail, Phone, School, UserRound } from "lucide-react-native";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { StateView } from "@/components/general/state-view";
import { ReportCard, ReportHeader } from "@/components/reports/report-ui";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";
import { UserShell } from "@/components/user/user-shell";
import { useCreateProfileUpdateRequest, useUserProfile } from "@/services/queries/hooks";

export default function EditProfileScreen() {
  const profile = useUserProfile();
  const submitRequest = useCreateProfileUpdateRequest();
  const data = profile.data;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!data) return;

    setName(data.user.name);
    setPhone(data.user.phone || "");
    setEmail(data.user.email);
  }, [data]);

  if (profile.isPending) return <LoadingScreen />;
  if (profile.isError || !data) {
    return <StateView title="Profile unavailable" message="We could not load your profile." actionLabel="Back" onAction={() => router.back()} />;
  }

  const canSubmit = name.trim().length >= 2 && email.includes("@") && !submitRequest.isPending;

  async function submit() {
    await submitRequest.mutateAsync({
      email: email.trim(),
      name: name.trim(),
      phone: phone.trim() || null
    });
    setSubmitted(true);
  }

  return (
    <UserShell>
      <ReportHeader title="Edit Profile" subtitle="Submit changes for admin approval. Your current profile stays unchanged until approved." />
      <View style={{ gap: 14 }}>
        {data.pendingProfileUpdate ? (
          <ReportCard>
            <CheckCircle2 color={colors.goldDark} size={24} />
            <AppText variant="label">Pending approval</AppText>
            <AppText muted>
              Your latest request is waiting for admin review. You can submit another correction if needed.
            </AppText>
            <AppText variant="caption" muted>
              Requested: {data.pendingProfileUpdate.requestedName} • {data.pendingProfileUpdate.requestedEmail}
            </AppText>
          </ReportCard>
        ) : null}
        {submitted ? (
          <ReportCard>
            <CheckCircle2 color={colors.green} size={24} />
            <AppText variant="label">Request submitted</AppText>
            <AppText muted>Your profile changes are pending admin approval.</AppText>
          </ReportCard>
        ) : null}
        <ReportCard>
          <AppInput label="Full name" left={<UserRound color={colors.primary} size={20} />} value={name} onChangeText={setName} placeholder="Enter your full name" />
          <AppInput label="Phone number" left={<Phone color={colors.primary} size={20} />} value={phone} onChangeText={setPhone} placeholder="Enter phone number" keyboardType="phone-pad" />
          <AppInput label="Email address" left={<Mail color={colors.primary} size={20} />} value={email} onChangeText={setEmail} placeholder="Enter email address" autoCapitalize="none" keyboardType="email-address" />
          <View style={{ gap: 6 }}>
            <AppText variant="label">Student ID</AppText>
            <View style={{ alignItems: "center", flexDirection: "row", gap: 10 }}>
              <School color={colors.primary} size={20} />
              <AppText muted>{data.user.institutionId || "Not provided"}</AppText>
            </View>
            <AppText variant="caption" muted>
              Student ID cannot be edited by users.
            </AppText>
          </View>
        </ReportCard>
        <AppButton title="Submit for approval" loading={submitRequest.isPending} disabled={!canSubmit} onPress={submit} />
        <AppButton title="Back to profile" variant="secondary" onPress={() => router.back()} />
      </View>
    </UserShell>
  );
}
