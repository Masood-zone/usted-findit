import { Image, type ImageContentFit } from "expo-image";
import { X } from "lucide-react-native";
import type { PropsWithChildren } from "react";
import { useState } from "react";
import { Modal, Pressable, ScrollView, useWindowDimensions, View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";

type ImagePreviewProps = PropsWithChildren<{
  uri: string;
  alt?: string | null;
  contentFit?: ImageContentFit;
  containerStyle?: StyleProp<ViewStyle>;
}>;

export function ImagePreview({ uri, alt, children, contentFit = "cover", containerStyle }: ImagePreviewProps) {
  const [visible, setVisible] = useState(false);
  const { height, width } = useWindowDimensions();

  return (
    <>
      <Pressable accessibilityLabel={alt ?? "Open image preview"} accessibilityRole="button" onPress={() => setVisible(true)} style={containerStyle}>
        <Image source={{ uri }} contentFit={contentFit} style={{ height: "100%", width: "100%" }} />
        {children}
      </Pressable>
      <Modal animationType="fade" visible={visible} onRequestClose={() => setVisible(false)}>
        <SafeAreaView style={{ backgroundColor: "#050505", flex: 1 }}>
          <View style={{ alignItems: "center", flexDirection: "row", gap: 12, justifyContent: "space-between", padding: 14 }}>
            <AppText numberOfLines={1} style={{ color: colors.surface, flex: 1 }}>
              {alt || "Image preview"}
            </AppText>
            <Pressable
              accessibilityLabel="Close image preview"
              accessibilityRole="button"
              onPress={() => setVisible(false)}
              style={{ alignItems: "center", backgroundColor: "rgba(255,255,255,0.14)", borderRadius: radius.full, height: 42, justifyContent: "center", width: 42 }}
            >
              <X color={colors.surface} size={24} />
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={{ alignItems: "center", flexGrow: 1, justifyContent: "center" }}
            maximumZoomScale={3}
            minimumZoomScale={1}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          >
            <Image source={{ uri }} contentFit="contain" style={{ height: Math.max(320, height - 120), width }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}
