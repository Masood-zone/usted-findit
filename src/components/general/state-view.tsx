import type { ComponentType } from "react";
import { View } from "react-native";
import { AlertTriangle, type LucideProps } from "lucide-react-native";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors } from "@/components/ui/design-system";

type StateViewProps = {
  icon?: ComponentType<LucideProps>;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function StateView({ icon: Icon = AlertTriangle, title, message, actionLabel, onAction }: StateViewProps) {
  return (
    <View style={{ alignItems: "center", flex: 1, gap: 18, justifyContent: "center", padding: 24 }}>
      <View
        style={{
          alignItems: "center",
          backgroundColor: colors.surfaceContainer,
          borderRadius: 32,
          height: 64,
          justifyContent: "center",
          width: 64
        }}
      >
        <Icon color={colors.primary} size={30} />
      </View>
      <View style={{ gap: 8 }}>
        <AppText variant="section" center>
          {title}
        </AppText>
        <AppText muted center>
          {message}
        </AppText>
      </View>
      {actionLabel ? <AppButton title={actionLabel} variant="secondary" onPress={onAction} /> : null}
    </View>
  );
}
