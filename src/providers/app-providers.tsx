import type { PropsWithChildren } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NotificationProvider } from "./notification-provider";
import { QueryProvider } from "./query-provider";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        {/* <NotificationProvider>
        </NotificationProvider> */}
        {children}
      </QueryProvider>
    </SafeAreaProvider>
  );
}
