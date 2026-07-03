import { View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import type { ItemStatus, ItemType } from "@/types/items";

type StatusBadgeProps = {
  type?: ItemType;
  status?: ItemStatus;
};

export function StatusBadge({ type, status }: StatusBadgeProps) {
  const isFound = type === "FOUND";
  const rawLabel = type ?? status ?? "PUBLISHED";
  const label = rawLabel === "CHANGES_REQUESTED" ? "NEEDS CHANGES" : rawLabel.replace("_", " ");
  const backgroundColor = isFound || status === "CLAIMED" ? colors.green : status === "CHANGES_REQUESTED" ? colors.goldDark : colors.primary;

  return (
    <View style={{ backgroundColor, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4 }}>
      <AppText variant="caption" style={{ color: colors.surface, fontFamily: "Inter_600SemiBold" }}>
        {label}
      </AppText>
    </View>
  );
}
