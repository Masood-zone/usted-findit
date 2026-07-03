import { router, useLocalSearchParams, type Href } from "expo-router";
import { View } from "react-native";
import { StateView } from "@/components/general/state-view";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { ReportHeader } from "@/components/reports/report-ui";
import { AppText } from "@/components/ui/app-text";
import { ItemCard } from "@/components/user/item-card";
import { UserShell } from "@/components/user/user-shell";
import { usePossibleMatches } from "@/services/queries/hooks";

export default function PossibleMatchesScreen() {
  const params = useLocalSearchParams<{ reportId: string }>();
  const reportId = params.reportId ?? "";
  const matches = usePossibleMatches(reportId);

  if (matches.isPending) return <LoadingScreen />;
  if (matches.isError) {
    return <StateView title="Matches unavailable" message="We could not load possible matches." actionLabel="Back" onAction={() => router.back()} />;
  }

  return (
    <UserShell>
      <ReportHeader title="Possible Matches" subtitle="These suggestions compare item type, category, location, and description overlap." />
      {matches.data?.matches.length ? (
        <View style={{ gap: 14 }}>
          {matches.data.matches.map((match) => (
            <View key={match.item.id} style={{ gap: 8 }}>
              <ItemCard item={match.item} actionLabel={match.item.type === "FOUND" ? "Claim this item" : "View details"} onPress={() => router.push(`/user/item/${match.item.id}` as Href)} />
              <AppText variant="caption" muted>
                Match score {match.score}% • {match.reasons.join(", ")}
              </AppText>
            </View>
          ))}
        </View>
      ) : (
        <StateView title="No strong matches yet" message="Reports are checked against available items. We'll show better matches here as records improve." actionLabel="Back to report" onAction={() => router.push(`/user/reports/${reportId}` as Href)} />
      )}
    </UserShell>
  );
}
