import { CalendarDays, MapPin } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { AppButton } from "@/components/ui/app-button";
import { colors, radius } from "@/components/ui/design-system";
import { ImagePreview } from "@/components/ui/image-preview";
import type { PublicItem } from "@/types/items";
import { StatusBadge } from "./status-badge";

type ItemCardProps = {
  item: PublicItem;
  horizontal?: boolean;
  onPress?: () => void;
  actionLabel?: string;
};

export function ItemCard({ item, horizontal, onPress, actionLabel = "View Details" }: ItemCardProps) {
  const image = item.images[0];
  const cardWidth = horizontal ? 210 : undefined;

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: radius.lg,
        borderWidth: 1,
        overflow: "hidden",
        width: cardWidth
      }}
    >
      <View style={{ backgroundColor: colors.surfaceContainer, height: 140 }}>
        {image ? (
          <ImagePreview uri={image.url} alt={image.alt || item.title} containerStyle={{ height: "100%", width: "100%" }}>
            <View style={{ left: 10, position: "absolute", top: 10 }}>
              <StatusBadge type={item.type} />
            </View>
          </ImagePreview>
        ) : (
          <View style={{ alignItems: "center", flex: 1, justifyContent: "center" }}>
            <AppText muted>No image</AppText>
          </View>
        )}
        {!image ? (
          <View style={{ left: 10, position: "absolute", top: 10 }}>
            <StatusBadge type={item.type} />
          </View>
        ) : null}
      </View>
      <View style={{ gap: 8, padding: 12 }}>
        <AppText variant="label" numberOfLines={1}>
          {item.title}
        </AppText>
        <View style={{ alignItems: "center", flexDirection: "row", gap: 6 }}>
          <MapPin color={colors.muted} size={15} />
          <AppText variant="caption" muted numberOfLines={1}>
            {item.location}
          </AppText>
        </View>
        {!horizontal ? (
          <View style={{ alignItems: "center", flexDirection: "row", gap: 6 }}>
            <CalendarDays color={colors.muted} size={15} />
            <AppText variant="caption" muted>
              {new Date(item.reportedDate).toLocaleDateString()}
            </AppText>
          </View>
        ) : null}
        {!horizontal ? <AppButton title={actionLabel} variant="secondary" onPress={onPress} /> : null}
      </View>
    </Pressable>
  );
}
