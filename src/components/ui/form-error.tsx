import { AppText } from "./app-text";
import { colors } from "./design-system";

type FormErrorProps = {
  message?: string;
};

export function FormError({ message }: FormErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <AppText variant="caption" style={{ color: colors.error, marginLeft: 4, marginTop: 6 }}>
      {message}
    </AppText>
  );
}
