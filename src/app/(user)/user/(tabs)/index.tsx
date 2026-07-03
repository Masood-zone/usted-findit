import { router, type Href } from "expo-router";
import { Search } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { CategoryTile } from "@/components/user/category-tile";
import { ItemCard } from "@/components/user/item-card";
import { UserSection, UserShell } from "@/components/user/user-shell";
import { UserTopBar } from "@/components/user/user-top-bar";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { StateView } from "@/components/general/state-view";
import { useUserDashboard } from "@/services/queries/hooks";
import { getTimeOfDayGreeting } from "@/utils/greeting";

export default function UserHomeScreen() {
  const dashboard = useUserDashboard();
  const data = dashboard.data;

  if (dashboard.isPending) return <LoadingScreen />;
  if (dashboard.isError || !data) {
    return (
      <StateView
        title="Dashboard unavailable"
        message="We could not load your dashboard right now."
        actionLabel="Try again"
        onAction={() => dashboard.refetch()}
      />
    );
  }

  return (
    <UserShell>
      <UserTopBar subtitle={getTimeOfDayGreeting()} title={data.greetingName} />
      <View
        style={{
          backgroundColor: colors.primaryContainer,
          borderRadius: radius.lg,
          gap: 16,
          marginBottom: 24,
          overflow: "hidden",
          padding: 24,
        }}
      >
        <AppText variant="title" style={{ color: colors.surface }}>
          Lost something on campus?
        </AppText>
        <View style={{ gap: 10 }}>
          <AppButton
            title="Report lost item"
            variant="secondary"
            onPress={() => router.push("/user/report" as Href)}
          />
          <AppButton
            title="I found an item"
            variant="secondary"
            onPress={() => router.push("/user/report" as Href)}
          />
        </View>
      </View>
      <UserSection>
        <AppInput
          label="Search"
          left={<Search color={colors.outline} size={20} />}
          placeholder="Search for items (e.g. ID card, keys)"
          onSubmitEditing={(event) =>
            router.push(
              `/user/search?q=${encodeURIComponent(event.nativeEvent.text)}` as Href,
            )
          }
        />
      </UserSection>
      <UserSection>
        <AppText variant="section">Quick Categories</AppText>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {data.categories.map((category) => (
            <CategoryTile
              key={category.value}
              label={category.label}
              icon={category.icon}
              onPress={() =>
                router.push(
                  `/user/search?category=${encodeURIComponent(category.value)}` as Href,
                )
              }
            />
          ))}
        </View>
      </UserSection>
      <UserSection>
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <AppText variant="section">Recent Lost Items</AppText>
          <AppButton
            title="View all"
            variant="ghost"
            onPress={() => router.push("/user/search?type=LOST" as Href)}
          />
        </View>
        {data.recentLostItems.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
          >
            {data.recentLostItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                horizontal
                onPress={() => router.push(`/user/item/${item.id}` as Href)}
              />
            ))}
          </ScrollView>
        ) : (
          <View
            style={{
              backgroundColor: colors.surfaceSubtle,
              borderColor: colors.border,
              borderRadius: radius.lg,
              borderWidth: 1,
              padding: 16,
            }}
          >
            <AppText muted>No recent lost items yet.</AppText>
          </View>
        )}
      </UserSection>
      <UserSection>
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <AppText variant="section">Recent Found Items</AppText>
          <AppButton
            title="View all"
            variant="ghost"
            onPress={() => router.push("/user/search?type=FOUND" as Href)}
          />
        </View>
        {data.recentFoundItems.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
          >
            {data.recentFoundItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                horizontal
                onPress={() => router.push(`/user/item/${item.id}` as Href)}
              />
            ))}
          </ScrollView>
        ) : (
          <View
            style={{
              backgroundColor: colors.surfaceSubtle,
              borderColor: colors.border,
              borderRadius: radius.lg,
              borderWidth: 1,
              padding: 16,
            }}
          >
            <AppText muted>No recent found items yet.</AppText>
          </View>
        )}
      </UserSection>
      {/* <View style={{ backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderTopColor: colors.primary, borderTopWidth: 4, borderWidth: 1, gap: 14, padding: 16 }}>
        <AppText variant="section">Recovery Statistics</AppText>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ backgroundColor: colors.surfaceSubtle, borderRadius: radius.md, flex: 1, padding: 14 }}>
            <AppText variant="section" center style={{ color: colors.primary }}>
              {data.stats.recoveryRate}%
            </AppText>
            <AppText variant="caption" muted center>
              Recovery Rate
            </AppText>
          </View>
          <View style={{ backgroundColor: colors.surfaceSubtle, borderRadius: radius.md, flex: 1, padding: 14 }}>
            <AppText variant="section" center style={{ color: colors.primary }}>
              {data.stats.itemsReturned}
            </AppText>
            <AppText variant="caption" muted center>
              Items Returned
            </AppText>
          </View>
        </View>
      </View> */}
    </UserShell>
  );
}
