import { router, useLocalSearchParams, type Href } from "expo-router";
import {
  Bookmark,
  CalendarDays,
  Fingerprint,
  Info,
  MapPin,
  Share2,
  ShieldCheck,
} from "lucide-react-native";
import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { StateView } from "@/components/general/state-view";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { colors, radius } from "@/components/ui/design-system";
import { ImagePreview } from "@/components/ui/image-preview";
import { InfoTile } from "@/components/user/info-tile";
import { StatusBadge } from "@/components/user/status-badge";
import { UserShell } from "@/components/user/user-shell";
import { useToggleSavedItem, useUserItem } from "@/services/queries/hooks";

export default function ItemDetailsScreen() {
  const params = useLocalSearchParams<{ itemId: string }>();
  const { width } = useWindowDimensions();
  const itemId = params.itemId ?? "";
  const itemQuery = useUserItem(itemId);
  const toggleSaved = useToggleSavedItem();
  const item = itemQuery.data?.item;
  const galleryWidth = Math.max(width, 320);
  const canStartItemAction = item?.status === "PUBLISHED";

  if (itemQuery.isPending) return <LoadingScreen />;
  if (itemQuery.isError || !item) {
    return (
      <StateView
        title="Item unavailable"
        message="This item may have been resolved, archived, or removed from public view."
        actionLabel="Back to search"
        onAction={() => router.push("/user/search" as Href)}
      />
    );
  }

  return (
    <UserShell padded={false}>
      <View
        style={{
          alignItems: "center",
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 10,
        }}
      >
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            flex: 1,
            gap: 8,
          }}
        >
          <AppButton
            title="Back"
            variant="ghost"
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.push("/user/search" as Href)
            }
            style={{ alignSelf: "auto", minHeight: 40, paddingHorizontal: 8 }}
          />
          <AppText
            variant="label"
            numberOfLines={1}
            style={{ color: colors.primary, flex: 1 }}
          >
            Item Details
          </AppText>
        </View>
        <View style={{ flexDirection: "row", gap: 14 }}>
          <Share2 color={colors.primary} size={22} />
          <Pressable
            onPress={() =>
              toggleSaved.mutate({ itemId: item.id, saved: item.isSaved })
            }
          >
            <Bookmark
              color={colors.primary}
              fill={item.isSaved ? colors.primary : "transparent"}
              size={22}
            />
          </Pressable>
        </View>
      </View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={{ backgroundColor: colors.surfaceContainer }}
      >
        {(item.images.length
          ? item.images
          : [{ id: "empty", url: "", alt: null, isPrimary: true }]
        ).map((image) => (
          <View key={image.id} style={{ height: 300, width: galleryWidth }}>
            {image.url ? (
              <ImagePreview uri={image.url} alt={image.alt || item.title} containerStyle={{ height: "100%", width: "100%" }}>
                <View style={{ left: 16, position: "absolute", top: 16 }}>
                  <StatusBadge type={item.type} />
                </View>
              </ImagePreview>
            ) : (
              <View
                style={{
                  alignItems: "center",
                  flex: 1,
                  justifyContent: "center",
                }}
              >
                <AppText muted>No image available</AppText>
              </View>
            )}
            {!image.url ? (
              <View style={{ left: 16, position: "absolute", top: 16 }}>
                <StatusBadge type={item.type} />
              </View>
            ) : null}
          </View>
        ))}
      </ScrollView>
      <View style={{ gap: 20, padding: 16 }}>
        <View style={{ gap: 10 }}>
          <View
            style={{
              alignItems: "flex-start",
              flexDirection: "row",
              gap: 12,
              justifyContent: "space-between",
            }}
          >
            <AppText variant="title" style={{ color: colors.primary, flex: 1 }}>
              {item.title}
            </AppText>
            <View
              style={{
                alignItems: "center",
                backgroundColor: colors.greenSoft,
                borderRadius: radius.full,
                flexDirection: "row",
                gap: 6,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <ShieldCheck color={colors.green} size={16} />
              <AppText
                variant="caption"
                style={{ color: colors.green, fontFamily: "Inter_600SemiBold" }}
              >
                Verified
              </AppText>
            </View>
          </View>
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <StatusBadge status={item.status} />
            <View
              style={{
                backgroundColor: colors.surfaceSubtle,
                borderRadius: radius.md,
                paddingHorizontal: 10,
                paddingVertical: 5,
              }}
            >
              <AppText variant="caption">{item.category}</AppText>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <InfoTile
            icon={<MapPin color={colors.primary} size={22} />}
            label={item.type === "FOUND" ? "Found At" : "Lost At"}
            value={item.location}
          />
          <InfoTile
            icon={<CalendarDays color={colors.primary} size={22} />}
            label="Reported Date"
            value={new Date(item.reportedDate).toLocaleDateString()}
          />
          <InfoTile
            icon={<Fingerprint color={colors.primary} size={22} />}
            label="Reference No."
            value={item.referenceNumber}
          />
        </View>
        <View style={{ gap: 10 }}>
          <AppText variant="section">Public Description</AppText>
          <View
            style={{
              backgroundColor: colors.surfaceSubtle,
              borderColor: colors.border,
              borderRadius: radius.lg,
              borderWidth: 1,
              padding: 16,
            }}
          >
            <AppText muted>{item.description}</AppText>
          </View>
        </View>
        {canStartItemAction ? (
          <View
            style={{
              alignItems: "flex-start",
              backgroundColor: colors.surfaceContainerLow,
              borderColor: colors.border,
              borderRadius: radius.lg,
              borderWidth: 1,
              flexDirection: "row",
              gap: 12,
              padding: 16,
            }}
          >
            <Info color={colors.primary} size={22} />
            <View style={{ flex: 1, gap: 4 }}>
              <AppText variant="label" style={{ color: colors.primary }}>
                Safety & Verification Notice
              </AppText>
              <AppText muted>
                To claim this item, you will be required to provide specific
                details not listed publicly. Private verification details are
                never shown in search or item details.
              </AppText>
            </View>
          </View>
        ) : (
          <View
            style={{
              alignItems: "flex-start",
              backgroundColor: colors.greenSoft,
              borderColor: colors.border,
              borderRadius: radius.lg,
              borderWidth: 1,
              flexDirection: "row",
              gap: 12,
              padding: 16,
            }}
          >
            <ShieldCheck color={colors.green} size={22} />
            <View style={{ flex: 1, gap: 4 }}>
              <AppText variant="label" style={{ color: colors.green }}>
                Item already claimed
              </AppText>
              <AppText muted>
                This {item.type === "FOUND" ? "found item has already been claimed" : "lost item has already been found and claimed"}, so no new recovery action is available.
              </AppText>
            </View>
          </View>
        )}
        <View style={{ gap: 10 }}>
          {canStartItemAction ? (
            <AppButton
              title={
                item.type === "FOUND" ? "This may be mine" : "I found this item"
              }
              onPress={() =>
                item.type === "FOUND"
                  ? router.push(`/user/claim/${item.id}` as Href)
                  : router.push(`/user/claim/${item.id}` as Href)
              }
            />
          ) : null}
          <AppButton
            title="Back to search"
            variant="secondary"
            onPress={() => router.push("/user/search" as Href)}
          />
        </View>
      </View>
    </UserShell>
  );
}
