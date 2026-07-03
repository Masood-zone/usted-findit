import type { PropsWithChildren } from "react";
import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";

export function ReportHeader({ title, subtitle, step }: { title: string; subtitle?: string; step?: string }) {
  return (
    <View style={{ gap: 6, marginBottom: 18 }}>
      {step ? (
        <AppText variant="caption" style={{ color: colors.primary }}>
          {step}
        </AppText>
      ) : null}
      <AppText variant="section" style={{ color: colors.primary }}>
        {title}
      </AppText>
      {subtitle ? <AppText muted>{subtitle}</AppText> : null}
    </View>
  );
}

export function ReportCard({ children }: PropsWithChildren) {
  return (
    <View style={{ backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, gap: 14, padding: 16 }}>
      {children}
    </View>
  );
}

export function ChoiceCard({ active, icon, title, body, onPress }: { active?: boolean; icon: React.ReactNode; title: string; body: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: active ? colors.surfaceContainerLow : colors.surface,
        borderColor: active ? colors.primary : colors.border,
        borderRadius: radius.lg,
        borderWidth: 1.5,
        flexDirection: "row",
        gap: 14,
        padding: 16
      }}
    >
      {icon}
      <View style={{ flex: 1, gap: 4 }}>
        <AppText variant="label">{title}</AppText>
        <AppText muted>{body}</AppText>
      </View>
    </Pressable>
  );
}

export function FieldRow({ children }: PropsWithChildren) {
  return <View style={{ gap: 12 }}>{children}</View>;
}
