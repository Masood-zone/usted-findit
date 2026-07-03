import { router, useLocalSearchParams, type Href } from "expo-router";
import { Search, SlidersHorizontal } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { StateView } from "@/components/general/state-view";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { ItemCard } from "@/components/user/item-card";
import { UserShell } from "@/components/user/user-shell";
import { UserTopBar } from "@/components/user/user-top-bar";
import { useUserItems } from "@/services/queries/hooks";
import type { ItemType } from "@/types/items";

function getItemActionLabel(item: { status: string; type: ItemType }) {
  if (item.status === "CLAIMED") return "View Details";
  return item.type === "FOUND" ? "This may be mine" : "View Details";
}

export default function SearchDiscoveryScreen() {
  const params = useLocalSearchParams<{ q?: string; category?: string; type?: ItemType }>();
  const [query, setQuery] = useState(params.q ?? "");
  const [type, setType] = useState<ItemType>(params.type === "FOUND" ? "FOUND" : "LOST");
  const filters = useMemo(() => ({ q: query, type, category: params.category, page: 1, pageSize: 20 }), [params.category, query, type]);
  const items = useUserItems(filters);

  return (
    <UserShell>
      <UserTopBar title="USTED FindIt" />
      <View style={{ gap: 14, marginBottom: 20 }}>
        <AppInput
          label="Search campus items"
          left={<Search color={colors.outline} size={20} />}
          right={<SlidersHorizontal color={colors.primary} size={20} />}
          value={query}
          onChangeText={setQuery}
          placeholder="Search for items (e.g. ID Card, Keys)"
        />
        <View style={{ backgroundColor: colors.surfaceContainerLow, borderRadius: radius.lg, flexDirection: "row", gap: 6, padding: 6 }}>
          {(["LOST", "FOUND"] as ItemType[]).map((value) => {
            const active = type === value;
            return (
              <Pressable
                key={value}
                onPress={() => setType(value)}
                style={{ backgroundColor: active ? colors.primary : "transparent", borderRadius: radius.md, flex: 1, paddingVertical: 10 }}
              >
                <AppText variant="label" center style={{ color: active ? colors.surface : colors.muted }}>
                  {value === "LOST" ? "Lost Items" : "Found Items"}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>
      {items.isPending ? (
        <LoadingScreen />
      ) : items.isError ? (
        <StateView title="Search failed" message="We could not load matching items." actionLabel="Try again" onAction={() => items.refetch()} />
      ) : !items.data?.items.length ? (
        <StateView
          title="No matching items found"
          message="Try adjusting your filters or search terms to broaden your results."
          actionLabel="Report a lost item"
          onAction={() => router.push("/user/report" as Href)}
        />
      ) : (
        <View style={{ gap: 14 }}>
          {items.data.items.map((item) => (
            <ItemCard key={item.id} item={item} actionLabel={getItemActionLabel(item)} onPress={() => router.push(`/user/item/${item.id}` as Href)} />
          ))}
        </View>
      )}
    </UserShell>
  );
}
