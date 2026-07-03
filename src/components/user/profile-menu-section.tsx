import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";

type ProfileMenuSectionProps = {
  title: string;
  items: {
    label: string;
    icon: ReactNode;
    onPress?: () => void;
  }[];
};

export function ProfileMenuSection({ title, items }: ProfileMenuSectionProps) {
  return (
    <View style={{ backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, overflow: "hidden" }}>
      <View style={{ backgroundColor: colors.surfaceSubtle, borderBottomColor: colors.border, borderBottomWidth: 1, padding: 12 }}>
        <AppText variant="caption" muted style={{ fontFamily: "Inter_600SemiBold", textTransform: "uppercase" }}>
          {title}
        </AppText>
      </View>
      {items.map((item, index) => (
        <Pressable
          key={item.label}
          onPress={item.onPress}
          style={{
            alignItems: "center",
            borderBottomColor: colors.border,
            borderBottomWidth: index === items.length - 1 ? 0 : 1,
            flexDirection: "row",
            gap: 12,
            justifyContent: "space-between",
            padding: 16
          }}
        >
          <View style={{ alignItems: "center", flexDirection: "row", flex: 1, gap: 12 }}>
            {item.icon}
            <AppText>{item.label}</AppText>
          </View>
          <ChevronRight color={colors.outline} size={18} />
        </Pressable>
      ))}
    </View>
  );
}
