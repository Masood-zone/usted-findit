import { forwardRef, useState, type ReactNode } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { AppText } from "./app-text";
import { colors, radius } from "./design-system";
import { FormError } from "./form-error";

type AppInputProps = TextInputProps & {
  label: string;
  error?: string;
  left?: ReactNode;
  right?: ReactNode;
};

export const AppInput = forwardRef<TextInput, AppInputProps>(
  ({ label, error, left, right, multiline, style, onBlur, onFocus, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const borderColor = error ? colors.error : focused ? colors.primary : colors.border;

    return (
      <View>
        <AppText variant="label" muted style={{ marginBottom: 8, marginLeft: 4 }}>
          {label}
        </AppText>
        <View
          style={[
            styles.container,
            {
              alignItems: multiline ? "flex-start" : "center",
              backgroundColor: colors.surface,
              borderColor,
              height: multiline ? undefined : 48,
              minHeight: multiline ? 120 : 48
            }
          ]}
        >
          {left ? <View style={styles.leftAccessory}>{left}</View> : null}
          <TextInput
            {...props}
            multiline={multiline}
            ref={ref}
            placeholderTextColor="#8a7174"
            selectionColor={colors.primary}
            cursorColor={colors.primary}
            underlineColorAndroid="transparent"
            style={[
              styles.input,
              {
                color: colors.text,
                fontFamily: "Inter_400Regular",
                height: multiline ? undefined : "100%",
                minHeight: multiline ? 96 : undefined,
                paddingVertical: multiline ? 12 : 0,
                textAlignVertical: multiline ? "top" : "center"
              },
              style
            ]}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
          />
          {right ? <View style={styles.rightAccessory}>{right}</View> : null}
        </View>
        <FormError message={error} />
      </View>
    );
  }
);

AppInput.displayName = "AppInput";

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    borderWidth: 1.5,
    flexDirection: "row",
    paddingHorizontal: 16
  },
  input: {
    flex: 1,
    fontSize: 16,
    includeFontPadding: false,
    lineHeight: 22,
    minWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0
  },
  leftAccessory: {
    marginRight: 10
  },
  rightAccessory: {
    marginLeft: 10
  }
});
