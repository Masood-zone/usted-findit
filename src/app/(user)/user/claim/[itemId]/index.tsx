import { router, useLocalSearchParams, type Href } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { ImageUploadField } from "@/components/reports/image-upload-field";
import { ReportHeader } from "@/components/reports/report-ui";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { UserShell } from "@/components/user/user-shell";
import { LoadingScreen } from "@/components/shared/loading-screen";
import { StateView } from "@/components/general/state-view";
import { useCreateClaim, useUserItem } from "@/services/queries/hooks";
import type { ReportDraftImage } from "@/types/reports";

export default function OwnershipClaimFormScreen() {
  const params = useLocalSearchParams<{ itemId: string }>();
  const itemId = params.itemId ?? "";
  const itemQuery = useUserItem(itemId);
  const item = itemQuery.data?.item;
  const [proofDescription, setProofDescription] = useState("");
  const [hiddenDetails, setHiddenDetails] = useState("");
  const [images, setImages] = useState<ReportDraftImage[]>([]);
  const createClaim = useCreateClaim();
  const canSubmit = itemId && proofDescription && hiddenDetails;
  const isFinderSubmission = item?.type === "LOST";

  async function submit() {
    const result = await createClaim.mutateAsync({
      evidenceImage: images[0] ?? null,
      hiddenDetails,
      itemId,
      proofDescription
    });

    router.replace(`/user/claims/${result.claim.id}` as Href);
  }

  if (itemQuery.isPending) return <LoadingScreen />;
  if (itemQuery.isError || !item) {
    return <StateView title="Item unavailable" message="This item is not available for a claim or found-item submission." actionLabel="Back" onAction={() => router.back()} />;
  }

  return (
    <UserShell>
      <ReportHeader
        title={isFinderSubmission ? "Found Item Submission" : "Ownership Claim"}
        subtitle={isFinderSubmission ? "Tell staff where you found this reported lost item and how it can be recovered." : "Provide proof that is not visible publicly. Staff will review your claim."}
      />
      <View style={{ gap: 14 }}>
        <AppInput
          label={isFinderSubmission ? "Where and how did you find it?" : "Proof of ownership"}
          multiline
          placeholder={isFinderSubmission ? "Describe the exact place, time, and condition of the item when you found it..." : "Describe where and when you last saw it, or unique characteristics..."}
          value={proofDescription}
          onChangeText={setProofDescription}
        />
        <AppInput
          label={isFinderSubmission ? "Current custody or contact notes" : "Hidden identifying details"}
          placeholder={isFinderSubmission ? "e.g. I kept it at the department desk, security office, or with me..." : "Serial numbers, private contents, scratches, unique keyrings..."}
          value={hiddenDetails}
          onChangeText={setHiddenDetails}
        />
        <ImageUploadField
          helper={isFinderSubmission ? "Optional photo showing the item or handover location." : "Receipts, photos of you with the item, or supporting proof."}
          images={images}
          label="Supporting image (optional)"
          maxImages={1}
          purpose="claimEvidence"
          onChange={setImages}
        />
        <AppButton title={isFinderSubmission ? "Submit found item for review" : "Submit claim for review"} disabled={!canSubmit} loading={createClaim.isPending} onPress={submit} />
      </View>
    </UserShell>
  );
}
