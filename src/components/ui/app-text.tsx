import type { PropsWithChildren } from "react";
import { Text, type TextProps } from "react-native";
import { colors } from "./design-system";

type AppTextProps = TextProps &
  PropsWithChildren<{
    variant?: "display" | "title" | "section" | "body" | "label" | "caption";
    muted?: boolean;
    center?: boolean;
  }>;

const variants = {
  display: {
    fontFamily: "Montserrat_800ExtraBold",
    fontSize: 34,
    lineHeight: 42
  },
  title: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 28,
    lineHeight: 34
  },
  section: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 22,
    lineHeight: 28
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    lineHeight: 24
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    lineHeight: 20
  },
  caption: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 16
  }
};

export function AppText({ children, variant = "body", muted, center, style, ...props }: AppTextProps) {
  return (
    <Text
      style={[
        variants[variant],
        {
          color: muted ? colors.muted : colors.text,
          textAlign: center ? "center" : "left"
        },
        style
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}
