import { ChevronDown, Check } from "lucide-react-native";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useState } from "react";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";

export const reportCategoryOptions = [
  "ID Cards",
  "Keys",
  "Electronics",
  "Phones & Tablets",
  "Laptops & Chargers",
  "Bags & Backpacks",
  "Wallets & Purses",
  "Books & Notebooks",
  "Clothing & Uniforms",
  "Eyewear",
  "Jewelry & Watches",
  "Lab/Workshop Items",
  "Sports Items",
  "Documents",
  "Other"
];

type CategorySelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function CategorySelectField({ label, value, onChange }: CategorySelectFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <AppText variant="label" muted style={{ marginBottom: 8, marginLeft: 4 }}>
        {label}
      </AppText>
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          alignItems: "center",
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.md,
          borderWidth: 1.5,
          flexDirection: "row",
          justifyContent: "space-between",
          minHeight: 48,
          paddingHorizontal: 16
        }}
      >
        <AppText muted={!value}>{value || "Select category"}</AppText>
        <ChevronDown color={colors.primary} size={20} />
      </Pressable>
      <Modal animationType="slide" transparent visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable style={{ backgroundColor: "rgba(0,0,0,0.3)", flex: 1, justifyContent: "flex-end" }} onPress={() => setOpen(false)}>
          <Pressable
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              maxHeight: "78%",
              padding: 16
            }}
          >
            <AppText variant="section" style={{ color: colors.primary, marginBottom: 12 }}>
              Select Category
            </AppText>
            <ScrollView keyboardShouldPersistTaps="handled">
              {reportCategoryOptions.map((option) => {
                const active = option === value;
                return (
                  <Pressable
                    key={option}
                    onPress={() => {
                      onChange(option);
                      setOpen(false);
                    }}
                    style={{
                      alignItems: "center",
                      borderBottomColor: colors.border,
                      borderBottomWidth: 1,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      minHeight: 48,
                      paddingVertical: 10
                    }}
                  >
                    <AppText style={{ color: active ? colors.primary : colors.text }}>{option}</AppText>
                    {active ? <Check color={colors.primary} size={20} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
