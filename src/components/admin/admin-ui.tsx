import { router, type Href } from "expo-router";
import type { ComponentType, PropsWithChildren, ReactNode } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { BarChart3, ClipboardCheck, FileText, LayoutDashboard, LogOut, Menu, Search, Users, X, type LucideProps } from "lucide-react-native";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors, radius, shadows } from "@/components/ui/design-system";
import { ImagePreview } from "@/components/ui/image-preview";
import { signOut, useTypedSession } from "@/lib/auth-client";
import type { AdminClaimSummary, AdminReportSummary } from "@/types/admin";
import type { ClaimStatus } from "@/types/reports";
import type { ItemStatus, ItemType } from "@/types/items";

export function AdminShell({ children, title = "Administrator", scroll = true }: PropsWithChildren<{ title?: string; scroll?: boolean }>) {
  const session = useTypedSession();
  const insets = useSafeAreaInsets();
  const content = <View style={{ gap: 18, padding: 16, paddingBottom: 110 }}>{children}</View>;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ backgroundColor: colors.background, flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24} style={{ flex: 1 }}>
        <View
          style={{
            alignItems: "center",
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
            flexDirection: "row",
            gap: 12,
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 12
          }}
        >
          <View style={{ alignItems: "center", flexDirection: "row", flex: 1, gap: 10 }}>
            <Menu color={colors.primary} size={24} />
            <AppText numberOfLines={1} variant="section" style={{ color: colors.primary, flex: 1 }}>
              {title}
            </AppText>
          </View>
          <Pressable
            onPress={() => {
              void signOut().finally(() => router.replace("/sign-in" as Href));
            }}
            style={{ alignItems: "center", flexDirection: "row", gap: 8 }}
          >
            <View style={{ alignItems: "center", backgroundColor: colors.surfaceContainer, borderRadius: radius.full, height: 36, justifyContent: "center", width: 36 }}>
              <AppText variant="caption" style={{ color: colors.primary }}>
                {(session.data?.user.name || "A").slice(0, 1).toUpperCase()}
              </AppText>
            </View>
            <LogOut color={colors.primary} size={20} />
          </Pressable>
        </View>
        {scroll ? <ScrollView keyboardShouldPersistTaps="handled">{content}</ScrollView> : content}
        <AdminBottomNav bottomInset={insets.bottom} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AdminBottomNav({ bottomInset }: { bottomInset: number }) {
  const items: { href: Href; icon: ComponentType<LucideProps>; label: string }[] = [
    { href: "/admin" as Href, icon: LayoutDashboard, label: "Home" },
    { href: "/admin/reports" as Href, icon: FileText, label: "Reports" },
    { href: "/admin/claims" as Href, icon: ClipboardCheck, label: "Claims" },
    { href: "/admin/users" as Href, icon: Users, label: "Users" },
    { href: "/admin/statistics" as Href, icon: BarChart3, label: "Stats" }
  ];

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        borderTopWidth: 1,
        bottom: 0,
        flexDirection: "row",
        gap: 2,
        left: 0,
        paddingHorizontal: 8,
        paddingBottom: Math.max(8, bottomInset),
        paddingTop: 8,
        position: "absolute",
        right: 0
      }}
    >
      {items.map((item) => (
        <Pressable key={item.label} onPress={() => router.push(item.href)} style={{ alignItems: "center", flex: 1, gap: 4, paddingVertical: 4 }}>
          <item.icon color={colors.primary} size={21} />
          <AppText variant="caption" numberOfLines={1} style={{ color: colors.primary, fontSize: 11 }}>
            {item.label}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

export function AdminMetricCard({ icon, label, value, tone = "primary" }: { icon: ReactNode; label: string; value: number | string; tone?: "primary" | "green" | "gold" | "danger" }) {
  const toneColor = tone === "green" ? colors.green : tone === "gold" ? colors.goldDark : tone === "danger" ? colors.error : colors.primary;
  return (
    <View style={{ backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, flex: 1, gap: 10, minWidth: 150, padding: 16, ...shadows.sm }}>
      <View style={{ alignItems: "center", backgroundColor: colors.surfaceContainerLow, borderRadius: radius.md, height: 38, justifyContent: "center", width: 38 }}>{icon}</View>
      <AppText muted variant="caption">
        {label}
      </AppText>
      <AppText variant="title" style={{ color: toneColor }}>
        {value}
      </AppText>
    </View>
  );
}

export function AdminCard({ children }: PropsWithChildren) {
  return <View style={{ backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, gap: 12, padding: 16 }}>{children}</View>;
}

export function AdminStatusBadge({ status, type }: { status?: ItemStatus | ClaimStatus; type?: ItemType }) {
  const value = status ?? type;
  const isDanger = value === "REJECTED" || value === "REMOVED";
  const isGood = value === "PUBLISHED" || value === "APPROVED" || value === "RESOLVED" || value === "FOUND";
  const backgroundColor = isDanger ? colors.errorSoft : isGood ? colors.greenSoft : colors.warningSoft;
  const color = isDanger ? colors.error : isGood ? colors.green : colors.goldDark;

  return (
    <View style={{ backgroundColor, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 5 }}>
      <AppText variant="caption" style={{ color, fontFamily: "Inter_600SemiBold" }}>
        {String(value ?? "").replace("_", " ")}
      </AppText>
    </View>
  );
}

export function AdminSearch({ value, onChangeText, placeholder }: { value: string; onChangeText: (value: string) => void; placeholder: string }) {
  return (
    <View style={{ alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1.5, flexDirection: "row", gap: 10, minHeight: 48, paddingHorizontal: 14 }}>
      <Search color={colors.outline} size={20} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.outline}
        value={value}
        onChangeText={onChangeText}
        style={{ color: colors.text, flex: 1, fontFamily: "Inter_400Regular", fontSize: 15 }}
      />
    </View>
  );
}

export function AdminTabs<TValue extends string>({ tabs, value, onChange }: { tabs: readonly { label: string; value: TValue }[]; value: TValue; onChange: (value: TValue) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {tabs.map((tab) => {
          const active = tab.value === value;
          return (
            <Pressable
              key={tab.value}
              onPress={() => onChange(tab.value)}
              style={{
                backgroundColor: active ? colors.primary : colors.surface,
                borderColor: active ? colors.primary : colors.border,
                borderRadius: radius.full,
                borderWidth: 1,
                paddingHorizontal: 14,
                paddingVertical: 9
              }}
            >
              <AppText variant="caption" style={{ color: active ? colors.surface : colors.text, fontFamily: "Inter_600SemiBold" }}>
                {tab.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

export function AdminReportRow({ report }: { report: AdminReportSummary }) {
  return (
    <Pressable onPress={() => router.push(`/admin/reports/${report.id}` as Href)}>
      <AdminCard>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ backgroundColor: colors.surfaceContainer, borderRadius: radius.md, height: 82, overflow: "hidden", width: 82 }}>
            {report.primaryImageUrl ? <ImagePreview uri={report.primaryImageUrl} alt={report.title} containerStyle={{ height: "100%", width: "100%" }} /> : null}
          </View>
          <View style={{ flex: 1, gap: 7 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              <AdminStatusBadge type={report.type} />
              <AdminStatusBadge status={report.status} />
            </View>
            <AppText variant="label" numberOfLines={1}>
              {report.title}
            </AppText>
            <AppText muted numberOfLines={1}>
              {report.referenceNumber} | {report.reporterName || "Unknown reporter"}
            </AppText>
            <AppText muted numberOfLines={1}>
              {report.category} at {report.location}
            </AppText>
          </View>
        </View>
      </AdminCard>
    </Pressable>
  );
}

export function AdminClaimRow({ claim }: { claim: AdminClaimSummary }) {
  return (
    <Pressable onPress={() => router.push(`/admin/claims/${claim.id}` as Href)}>
      <AdminCard>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ backgroundColor: colors.surfaceContainer, borderRadius: radius.md, height: 72, overflow: "hidden", width: 72 }}>
            {claim.itemImageUrl ? <ImagePreview uri={claim.itemImageUrl} alt={claim.itemTitle} containerStyle={{ height: "100%", width: "100%" }} /> : null}
          </View>
          <View style={{ flex: 1, gap: 7 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              <AdminStatusBadge status={claim.status} />
              <AdminStatusBadge status={claim.itemStatus} />
            </View>
            <AppText variant="label" numberOfLines={1}>
              {claim.claimantName}
            </AppText>
            <AppText muted numberOfLines={1}>
              {claim.referenceNumber} | {claim.itemTitle}
            </AppText>
          </View>
        </View>
      </AdminCard>
    </Pressable>
  );
}

export function AdminActionModal({
  visible,
  title,
  label,
  placeholder,
  confirmTitle,
  danger,
  value,
  onChangeText,
  onCancel,
  onConfirm,
  loading
}: {
  visible: boolean;
  title: string;
  label: string;
  placeholder: string;
  confirmTitle: string;
  danger?: boolean;
  value: string;
  onChangeText: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={{ backgroundColor: "rgba(0,0,0,0.35)", flex: 1, justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, gap: 14, padding: 18 }}>
          <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between" }}>
            <AppText variant="section">{title}</AppText>
            <Pressable onPress={onCancel}>
              <X color={colors.primary} size={22} />
            </Pressable>
          </View>
          <View>
            <AppText variant="label" muted style={{ marginBottom: 8 }}>
              {label}
            </AppText>
            <TextInput
              multiline
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor={colors.outline}
              style={{
                borderColor: colors.border,
                borderRadius: radius.md,
                borderWidth: 1.5,
                color: colors.text,
                fontFamily: "Inter_400Regular",
                minHeight: 110,
                padding: 12,
                textAlignVertical: "top"
              }}
              value={value}
            />
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <AppButton title="Cancel" variant="ghost" onPress={onCancel} style={{ flex: 1 }} />
            <AppButton title={confirmTitle} variant={danger ? "danger" : "primary"} loading={loading} disabled={!value.trim()} onPress={onConfirm} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
