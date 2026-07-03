import { Image } from "expo-image";
import { View } from "react-native";

type UstedLogoProps = {
  text?: boolean;
  size?: number;
};

export function UstedLogo({ text, size = 72 }: UstedLogoProps) {
  return (
    <View style={{ alignItems: "center" }}>
      <Image
        source={text ? require("../../../assets/images/logo-text.png") : require("../../../assets/images/logo.png")}
        contentFit="contain"
        style={{
          height: text ? Math.round(size * 0.7) : size,
          width: text ? Math.round(size * 2.8) : size
        }}
      />
    </View>
  );
}
