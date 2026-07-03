import { useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type PressableStateCallbackType,
  View,
} from "react-native";
import { AppText } from "./app-text";
import { colors, radius, shadows } from "./design-system";

type AppButtonProps = PressableProps & {
  title: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  icon?: ReactNode;
};

export function AppButton({
  title,
  variant = "primary",
  loading,
  icon,
  disabled,
  style,
  onPressIn,
  onPressOut,
  ...props
}: AppButtonProps) {
  const [pressed, setPressed] = useState(false);

  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";
  const isSecondary = variant === "secondary";

  const isDisabled = disabled || loading;

  const foreground = isPrimary || isDanger ? colors.surface : colors.primary;

  const backgroundColor = isPrimary
    ? pressed
      ? colors.primaryPressed
      : colors.primary
    : isDanger
      ? colors.error
      : isSecondary
        ? colors.warningSoft
        : "transparent";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPressIn={(event) => {
        setPressed(true);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        onPressOut?.(event);
      }}
      style={[
        {
          alignItems: "center",
          alignSelf: "stretch",
          backgroundColor,
          borderColor: isPrimary
            ? colors.primary
            : isDanger
              ? colors.error
              : colors.border,
          borderRadius: radius.md,
          borderWidth: variant === "ghost" ? 0 : 1,
          flexDirection: "row",
          justifyContent: "center",
          minHeight: 52,
          paddingHorizontal: 20,
          opacity: isDisabled ? 0.55 : pressed ? 0.9 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
          ...(isPrimary || isDanger ? shadows.sm : {}),
        },
        typeof style === "function" ? style({ pressed } as PressableStateCallbackType) : style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            gap: 8,
            justifyContent: "center",
          }}
        >
          {icon}
          <AppText
            variant="label"
            style={{ color: foreground, textAlign: "center" }}
          >
            {title}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}
