import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { Platform } from "react-native";
import { useTypedSession } from "@/lib/auth-client";
import { useRegisterPushToken } from "@/services/queries/hooks";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

function getProjectId() {
  return Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId ?? null;
}

function permissionGranted(permission: unknown) {
  const value = permission as { granted?: boolean; status?: string };
  return value.granted === true || value.status === "granted";
}

export function NotificationProvider({ children }: PropsWithChildren) {
  const session = useTypedSession();
  const registerPushToken = useRegisterPushToken();
  const userId = session.data?.user.id;

  useEffect(() => {
    if (!userId || Platform.OS === "web" || !Device.isDevice) return;

    let cancelled = false;

    async function register() {
      const projectId = getProjectId();
      if (!projectId) return;

      const existingPermission = await Notifications.getPermissionsAsync();
      const finalPermission =
        permissionGranted(existingPermission)
          ? existingPermission
          : await Notifications.requestPermissionsAsync();

      if (!permissionGranted(finalPermission) || cancelled) return;

      const token = await Notifications.getExpoPushTokenAsync({ projectId });
      if (cancelled) return;

      registerPushToken.mutate({
        deviceName: Device.deviceName,
        platform: Platform.OS,
        token: token.data
      });
    }

    void register().catch(() => {
      // Push registration should never block the app shell.
    });

    return () => {
      cancelled = true;
    };
  }, [registerPushToken, userId]);

  return children;
}
