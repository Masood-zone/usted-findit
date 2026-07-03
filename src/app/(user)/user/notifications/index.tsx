import { router, type Href } from "expo-router";
import { Bell, CheckCheck, Circle } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { StateView } from "@/components/general/state-view";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { ReportHeader } from "@/components/reports/report-ui";
import { UserShell } from "@/components/user/user-shell";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useUserNotifications } from "@/services/queries/hooks";
import type { UserNotification } from "@/types/notifications";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short"
  }).format(new Date(value));
}

function NotificationRow({ notification, onRead }: { notification: UserNotification; onRead: (id: string) => void }) {
  const unread = !notification.readAt;

  return (
    <Pressable
      onPress={() => {
        if (unread) onRead(notification.id);
        if (notification.actionUrl) router.push(notification.actionUrl as Href);
      }}
      style={{
        backgroundColor: unread ? colors.surfaceContainerLow : colors.surface,
        borderColor: unread ? colors.primary : colors.border,
        borderRadius: radius.md,
        borderWidth: 1,
        gap: 8,
        padding: 14
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row", gap: 8 }}>
        {unread ? <Circle color={colors.primary} fill={colors.primary} size={9} /> : null}
        <AppText variant="label" style={{ color: colors.text, flex: 1 }}>
          {notification.title}
        </AppText>
        <AppText variant="caption" muted>
          {formatDate(notification.createdAt)}
        </AppText>
      </View>
      <AppText muted>{notification.message}</AppText>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const notifications = useUserNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  if (notifications.isPending) return <LoadingScreen />;
  if (notifications.isError) {
    return <StateView title="Notifications unavailable" message="We could not load your notifications right now." actionLabel="Back" onAction={() => router.back()} />;
  }

  const rows = notifications.data.notifications;

  return (
    <UserShell>
      <ReportHeader title="Notifications" subtitle="Updates about your reports, claims, and item recovery activity." />
      {rows.length ? (
        <View style={{ gap: 14 }}>
          <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between" }}>
            <AppText muted>{notifications.data.unreadCount} unread</AppText>
            <AppButton
              disabled={!notifications.data.unreadCount || markAllRead.isPending}
              icon={<CheckCheck color={colors.primary} size={18} />}
              title="Mark all read"
              variant="secondary"
              onPress={() => markAllRead.mutate()}
            />
          </View>
          {rows.map((notification) => (
            <NotificationRow key={notification.id} notification={notification} onRead={(id) => markRead.mutate(id)} />
          ))}
        </View>
      ) : (
        <StateView icon={Bell} title="No notifications yet" message="Important report and claim updates will appear here." actionLabel="Back" onAction={() => router.back()} />
      )}
    </UserShell>
  );
}
