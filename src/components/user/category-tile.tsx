import { Badge, Grid2X2, KeyRound, Smartphone } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";

const icons = {
  id: Badge,
  key: KeyRound,
  electronics: Smartphone,
  other: Grid2X2
};

type CategoryTileProps = {
  label: string;
  icon: keyof typeof icons;
  onPress?: () => void;
};

export function CategoryTile({ label, icon, onPress }: CategoryTileProps) {
  const Icon = icons[icon];

  return (
    <Pressable onPress={onPress} style={{ alignItems: "center", flex: 1, gap: 8 }}>
      <View
        style={{
          alignItems: "center",
          backgroundColor: colors.surfaceContainer,
          borderColor: colors.border,
          borderRadius: radius.lg,
          borderWidth: 1,
          height: 58,
          justifyContent: "center",
          width: 58
        }}
      >
        <Icon color={colors.primary} size={24} />
      </View>
      <AppText variant="caption" center numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}
