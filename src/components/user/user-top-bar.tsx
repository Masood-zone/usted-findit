import { router, type Href } from "expo-router";
import { Bell } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { UstedLogo } from "@/components/ui/usted-logo";
import { useUserNotifications } from "@/services/queries/hooks";

type UserTopBarProps = {
  title?: string;
  subtitle?: string;
  compactLogo?: boolean;
};

export function UserTopBar({ title = "USTED FindIt", subtitle, compactLogo = true }: UserTopBarProps) {
  const notifications = useUserNotifications();
  const unreadCount = notifications.data?.unreadCount ?? 0;

  return (
    <View
      style={{
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
        paddingTop: 8
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row", flex: 1, gap: 10 }}>
        <View
          style={{
            alignItems: "center",
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.full,
            borderWidth: 1,
            height: 42,
            justifyContent: "center",
            width: 42
          }}
        >
          <UstedLogo size={30} />
        </View>
        <View style={{ flex: 1 }}>
          {subtitle ? (
            <AppText variant="caption" muted>
              {subtitle}
            </AppText>
          ) : null}
          <AppText variant={compactLogo ? "label" : "section"} style={{ color: colors.primary }}>
            {title}
          </AppText>
        </View>
      </View>
      <Pressable
        accessibilityLabel="Open notifications"
        accessibilityRole="button"
        onPress={() => router.push("/user/notifications" as Href)}
        style={{
          alignItems: "center",
          backgroundColor: colors.surface,
          borderRadius: radius.full,
          height: 42,
          justifyContent: "center",
          width: 42
        }}
      >
        <Bell color={colors.primary} size={22} />
        {unreadCount ? (
          <View
            style={{
              alignItems: "center",
              backgroundColor: colors.gold,
              borderColor: colors.surface,
              borderRadius: radius.full,
              borderWidth: 2,
              height: 18,
              justifyContent: "center",
              minWidth: 18,
              paddingHorizontal: 4,
              position: "absolute",
              right: -2,
              top: -2
            }}
          >
            <AppText variant="caption" style={{ color: colors.primary, fontSize: 10 }}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </AppText>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}
