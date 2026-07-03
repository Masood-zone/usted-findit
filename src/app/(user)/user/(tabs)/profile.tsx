import { Bookmark, CircleHelp, Info, LogOut, Mail, Phone, School, ShieldCheck, UserRound } from "lucide-react-native";
import { router, type Href } from "expo-router";
import { Pressable, View } from "react-native";
import { StateView } from "@/components/general/state-view";
import { ReportCard } from "@/components/reports/report-ui";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { ProfileMenuSection } from "@/components/user/profile-menu-section";
import { UserShell } from "@/components/user/user-shell";
import { signOut } from "@/lib/auth-client";
import { useUserProfile } from "@/services/queries/hooks";

function ProfileField({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note?: string }) {
  return (
    <View style={{ gap: 6 }}>
      <AppText variant="label">{label}</AppText>
      <View
        style={{
          alignItems: "center",
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.md,
          borderWidth: 1,
          flexDirection: "row",
          gap: 10,
          minHeight: 48,
          paddingHorizontal: 14
        }}
      >
        {icon}
        <AppText style={{ flex: 1 }} numberOfLines={1}>
          {value}
        </AppText>
      </View>
      {note ? (
        <AppText variant="caption" muted>
          {note}
        </AppText>
      ) : null}
    </View>
  );
}

export default function ProfileScreen() {
  const profile = useUserProfile();
  const data = profile.data;

  if (profile.isPending) return <LoadingScreen />;
  if (profile.isError || !data) {
    return <StateView title="Profile unavailable" message="We could not load your profile." actionLabel="Try again" onAction={() => profile.refetch()} />;
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/sign-in");
  }

  const department = data.user.institutionId ? "USTED Student" : "Department not set";

  return (
    <UserShell>
      <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 18 }}>
        <View style={{ alignItems: "center", flexDirection: "row", gap: 12 }}>
          <View
            style={{
              alignItems: "center",
              backgroundColor: colors.surfaceContainerLow,
              borderRadius: radius.full,
              height: 44,
              justifyContent: "center",
              width: 44
            }}
          >
            <UserRound color={colors.primary} size={25} />
          </View>
          <AppText variant="section" style={{ color: colors.primary }}>
            Profile
          </AppText>
        </View>
      </View>

      <View style={{ alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Pressable>
          <View
            style={{
              alignItems: "center",
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: 70,
              borderWidth: 4,
              height: 132,
              justifyContent: "center",
              width: 132
            }}
          >
            <UserRound color={colors.primary} size={62} />
          </View>
          <View
            style={{
              alignItems: "center",
              backgroundColor: colors.gold,
              borderRadius: radius.full,
              bottom: 4,
              height: 34,
              justifyContent: "center",
              position: "absolute",
              right: 4,
              width: 34
            }}
          >
            <UserRound color={colors.primary} size={17} />
          </View>
        </Pressable>
        <View style={{ alignItems: "center", gap: 4 }}>
          <AppText variant="section" center style={{ color: colors.primary }}>
            {data.user.name}
          </AppText>
          <AppText variant="caption" muted center>
            {department}
          </AppText>
        </View>
      </View>

      <View style={{ gap: 14 }}>
        <ReportCard>
          {data.pendingProfileUpdate ? (
            <View style={{ backgroundColor: colors.warningSoft, borderColor: colors.gold, borderRadius: radius.md, borderWidth: 1, gap: 4, padding: 12 }}>
              <AppText variant="label" style={{ color: colors.goldDark }}>
                Profile update pending approval
              </AppText>
              <AppText variant="caption" muted>
                Requested name/email changes will apply after admin approval.
              </AppText>
            </View>
          ) : null}
          <ProfileField icon={<UserRound color={colors.primary} size={20} />} label="Full name" value={data.user.name} />
          <ProfileField icon={<Phone color={colors.primary} size={20} />} label="Phone number" value={data.user.phone || "Not provided"} />
          <ProfileField icon={<Mail color={colors.primary} size={20} />} label="Email address" value={data.user.email} />
          <ProfileField
            icon={<School color={colors.primary} size={20} />}
            label="Institution ID"
            value={data.user.institutionId || "Not provided"}
            note="Profile and department updates require administrative approval."
          />
        </ReportCard>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, flex: 1, padding: 14 }}>
            <AppText variant="section" center style={{ color: colors.primary }}>
              {data.stats.savedItems}
            </AppText>
            <AppText variant="caption" muted center>
              Saved Items
            </AppText>
          </View>
          <View style={{ backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, flex: 1, padding: 14 }}>
            <AppText variant="section" center style={{ color: colors.primary }}>
              {data.stats.reportsSubmitted}
            </AppText>
            <AppText variant="caption" muted center>
              Reports
            </AppText>
          </View>
          <View style={{ backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, flex: 1, padding: 14 }}>
            <AppText variant="section" center style={{ color: colors.primary }}>
              {data.stats.claimsStarted}
            </AppText>
            <AppText variant="caption" muted center>
              Claims
            </AppText>
          </View>
        </View>

        <ProfileMenuSection
          title="Account"
          items={[
            { label: "Edit profile", icon: <UserRound color={colors.primary} size={22} />, onPress: () => router.push("/user/edit-profile" as Href) },
            { label: `My saved items (${data.stats.savedItems})`, icon: <Bookmark color={colors.primary} size={22} /> },
            { label: "Privacy & Security", icon: <ShieldCheck color={colors.primary} size={22} />, onPress: () => router.push("/user/privacy-security" as Href) }
          ]}
        />
        <ProfileMenuSection
          title="Support"
          items={[
            { label: "Help", icon: <CircleHelp color={colors.primary} size={22} />, onPress: () => router.push("/user/help" as Href) },
            { label: "About", icon: <Info color={colors.primary} size={22} />, onPress: () => router.push("/user/about" as Href) }
          ]}
        />

        <AppButton title="Sign out" variant="danger" icon={<LogOut color={colors.surface} size={18} />} onPress={handleSignOut} />
        <View style={{ marginTop: 12 }}>
          <AppText variant="caption" muted center>
            USTED FindIt v1.0.0
          </AppText>
        </View>
      </View>
    </UserShell>
  );
}
