import type { PropsWithChildren } from "react";
import { View } from "react-native";
import { SafeAreaScreen } from "./safe-area-screen";

type ScreenShellProps = PropsWithChildren<{
  centered?: boolean;
}>;

export function ScreenShell({ children, centered }: ScreenShellProps) {
  return (
    <SafeAreaScreen>
      <View style={{ flex: 1, gap: 24, justifyContent: centered ? "center" : "flex-start" }}>{children}</View>
    </SafeAreaScreen>
  );
}
