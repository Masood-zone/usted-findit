import type { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, type ScrollViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "./design-system";

type SafeAreaScreenProps = PropsWithChildren<
  ScrollViewProps & {
    scroll?: boolean;
  }
>;

export function SafeAreaScreen({ children, scroll = true, contentContainerStyle, style, ...props }: SafeAreaScreenProps) {
  return (
    <SafeAreaView style={[{ backgroundColor: colors.background, flex: 1 }, style]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24} style={{ flex: 1 }}>
        {scroll ? (
          <ScrollView
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[{ flexGrow: 1, padding: 16 }, contentContainerStyle]}
            {...props}
          >
            {children}
          </ScrollView>
        ) : (
          children
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
