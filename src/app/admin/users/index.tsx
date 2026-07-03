import { router, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { AdminCard, AdminSearch, AdminShell, AdminStatusBadge } from "@/components/admin/admin-ui";
import { StateView } from "@/components/general/state-view";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { useAdminUsers } from "@/services/queries/hooks";

export default function AdminUsersScreen() {
  const [q, setQ] = useState("");
  const users = useAdminUsers();
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return users.data?.users ?? [];
    return (users.data?.users ?? []).filter((user) => `${user.name} ${user.email} ${user.institutionId ?? ""}`.toLowerCase().includes(query));
  }, [q, users.data?.users]);

  if (users.isPending) return <LoadingScreen />;
  if (users.isError || !users.data) return <StateView title="Users unavailable" message="Admin users could not be loaded." />;

  return (
    <AdminShell title="Users">
      <AdminSearch value={q} onChangeText={setQ} placeholder="Search users by name, email or ID..." />
      <AppText muted>{filtered.length} user(s)</AppText>
      {filtered.map((entry) => (
        <Pressable key={entry.id} onPress={() => router.push(`/admin/users/${entry.id}` as Href)}>
          <AdminCard>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ alignItems: "center", backgroundColor: colors.surfaceContainer, borderRadius: radius.full, height: 50, justifyContent: "center", width: 50 }}>
                <AppText variant="label" style={{ color: colors.primary }}>
                  {entry.name.slice(0, 1).toUpperCase()}
                </AppText>
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                  <AdminStatusBadge status={entry.accountStatus === "ACTIVE" ? "APPROVED" : "REJECTED"} />
                  <View style={{ backgroundColor: colors.surfaceSubtle, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 5 }}>
                    <AppText variant="caption">{entry.role.replace("_", " ")}</AppText>
                  </View>
                </View>
                <AppText variant="label">{entry.name}</AppText>
                <AppText muted>{entry.email}</AppText>
                <AppText muted>{entry.reportsSubmitted} reports | {entry.claimsSubmitted} claims</AppText>
              </View>
            </View>
          </AdminCard>
        </Pressable>
      ))}
    </AdminShell>
  );
}
