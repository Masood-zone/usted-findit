import { Eye, EyeOff, Lock } from "lucide-react-native";
import { useState } from "react";
import { Pressable } from "react-native";
import { AppInput } from "./app-input";
import { colors } from "./design-system";

type PasswordInputProps = Omit<React.ComponentProps<typeof AppInput>, "secureTextEntry" | "left" | "right">;

export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <AppInput
      {...props}
      secureTextEntry={!visible}
      left={<Lock color={colors.outline} size={20} />}
      right={
        <Pressable
          accessibilityLabel={visible ? "Hide password" : "Show password"}
          accessibilityRole="button"
          onPress={() => setVisible((value) => !value)}
        >
          {visible ? <EyeOff color={colors.outline} size={20} /> : <Eye color={colors.outline} size={20} />}
        </Pressable>
      }
    />
  );
}
