import type { ReactNode } from "react";
import { View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";

type InfoTileProps = {
  icon: ReactNode;
  label: string;
  value: string;
};

export function InfoTile({ icon, label, value }: InfoTileProps) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: radius.lg,
        borderWidth: 1,
        flex: 1,
        gap: 6,
        minWidth: 120,
        padding: 14
      }}
    >
      {icon}
      <AppText variant="caption" muted>
        {label}
      </AppText>
      <AppText variant="label">{value}</AppText>
    </View>
  );
}
