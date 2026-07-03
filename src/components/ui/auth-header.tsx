import { View } from "react-native";
import { AppText } from "./app-text";
import { UstedLogo } from "./usted-logo";

type AuthHeaderProps = {
  title: string;
  subtitle: string;
};

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <View style={{ alignItems: "center", gap: 12 }}>
      <UstedLogo text size={112} />
      <View style={{ gap: 6 }}>
        <AppText variant="title" center>
          {title}
        </AppText>
        <AppText muted center>
          {subtitle}
        </AppText>
      </View>
    </View>
  );
}
