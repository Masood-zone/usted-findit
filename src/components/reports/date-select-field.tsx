import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react-native";
import { Modal, Pressable, View } from "react-native";
import { useMemo, useState } from "react";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";

type DateSelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function toDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function displayDate(value: string) {
  if (!value) return "Select date";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

function daysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function DateSelectField({ label, value, onChange }: DateSelectFieldProps) {
  const initial = value ? new Date(`${value}T12:00:00`) : new Date();
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(Number.isNaN(initial.getTime()) ? new Date() : initial);
  const days = useMemo(() => Array.from({ length: daysInMonth(visibleMonth) }, (_, index) => index + 1), [visibleMonth]);
  const monthLabel = visibleMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  function moveMonth(delta: number) {
    setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + delta, 1));
  }

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
          gap: 10,
          minHeight: 48,
          paddingHorizontal: 16
        }}
      >
        <CalendarDays color={colors.primary} size={20} />
        <AppText muted={!value}>{displayDate(value)}</AppText>
      </Pressable>
      <Modal animationType="slide" transparent visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable style={{ backgroundColor: "rgba(0,0,0,0.3)", flex: 1, justifyContent: "flex-end" }} onPress={() => setOpen(false)}>
          <Pressable style={{ backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: 16 }}>
            <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
              <Pressable onPress={() => moveMonth(-1)} style={{ padding: 8 }}>
                <ChevronLeft color={colors.primary} size={24} />
              </Pressable>
              <AppText variant="section" style={{ color: colors.primary }}>
                {monthLabel}
              </AppText>
              <Pressable onPress={() => moveMonth(1)} style={{ padding: 8 }}>
                <ChevronRight color={colors.primary} size={24} />
              </Pressable>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {days.map((day) => {
                const optionDate = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
                const option = toDateValue(optionDate);
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
                      backgroundColor: active ? colors.primary : colors.surfaceSubtle,
                      borderRadius: radius.md,
                      height: 42,
                      justifyContent: "center",
                      width: "12.6%"
                    }}
                  >
                    <AppText variant="label" center style={{ color: active ? colors.surface : colors.text }}>
                      {day}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
