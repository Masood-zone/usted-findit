import { useRef, useState } from "react";
import { TextInput, View } from "react-native";
import { colors, radius } from "@/components/ui/design-system";

type OtpInputProps = {
  length?: number;
  onChangeCode?: (code: string) => void;
};

export function OtpInput({ length = 6, onChangeCode }: OtpInputProps) {
  const [values, setValues] = useState(Array.from({ length }, () => ""));
  const refs = useRef<(TextInput | null)[]>([]);

  function updateValue(index: number, value: string) {
    const nextValue = value.slice(-1);
    const next = [...values];
    next[index] = nextValue;
    setValues(next);
    onChangeCode?.(next.join(""));

    if (nextValue && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  }

  return (
    <View style={{ flexDirection: "row", gap: 8, justifyContent: "center" }}>
      {values.map((value, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            refs.current[index] = ref;
          }}
          value={value}
          maxLength={1}
          keyboardType="number-pad"
          onChangeText={(text) => updateValue(index, text)}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === "Backspace" && !values[index] && index > 0) {
              refs.current[index - 1]?.focus();
            }
          }}
          style={{
            aspectRatio: 1,
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.md,
            borderWidth: 1,
            color: colors.primary,
            fontFamily: "Montserrat_700Bold",
            fontSize: 22,
            textAlign: "center",
            width: 44
          }}
        />
      ))}
    </View>
  );
}
