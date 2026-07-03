import type { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, type ScrollViewProps, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/components/ui/design-system";

type UserShellProps = PropsWithChildren<
  ScrollViewProps & {
    padded?: boolean;
  }
>;

export function UserShell({ children, padded = true, contentContainerStyle, style, ...props }: UserShellProps) {
  return (
    <SafeAreaView edges={["top"]} style={[{ backgroundColor: colors.background, flex: 1 }, style]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24} style={{ flex: 1 }}>
        <ScrollView
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[{ flexGrow: 1, paddingBottom: 110, paddingHorizontal: padded ? 16 : 0 }, contentContainerStyle]}
          {...props}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function UserSection({ children }: PropsWithChildren) {
  return <View style={{ gap: 12, marginBottom: 24 }}>{children}</View>;
}
