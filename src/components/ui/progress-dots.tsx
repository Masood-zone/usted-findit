import { View } from "react-native";
import { colors, radius } from "./design-system";

type ProgressDotsProps = {
  count: number;
  activeIndex: number;
};

export function ProgressDots({ count, activeIndex }: ProgressDotsProps) {
  return (
    <View style={{ flexDirection: "row", gap: 8, justifyContent: "center" }}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={{
            backgroundColor: index === activeIndex ? colors.primary : colors.border,
            borderRadius: radius.full,
            height: 8,
            width: index === activeIndex ? 28 : 8
          }}
        />
      ))}
    </View>
  );
}
