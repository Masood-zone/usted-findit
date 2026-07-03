import type { ItemStatus, ItemType, PublicItem } from "./items";

export type UploadPurpose = "reportImage" | "claimEvidence" | "profileImage";

export type UploadedCloudinaryFile = {
  bytes?: number;
  format?: string;
  height?: number;
  originalName?: string;
  previewUrl: string;
  publicId: string;
  secureUrl: string;
  url: string;
  width?: number;
};

export type ReportDraftImage = UploadedCloudinaryFile & {
  localUri?: string;
};

export type ReportDraft = {
  type?: ItemType;
  title: string;
  category: string;
  brand: string;
  colour: string;
  description: string;
  eventDate: string;
  eventTime: string;
  location: string;
  landmark: string;
  storageOption: string;
  verificationQuestion: string;
  hiddenVerificationDetails: string;
  images: ReportDraftImage[];
  confirmed: boolean;
  submittedReportId?: string;
};

export type CreateReportInput = {
  type: ItemType;
  title: string;
  category: string;
  brand?: string;
  colour?: string;
  description: string;
  eventDate: string;
  eventTime: string;
  location: string;
  landmark?: string;
  storageOption?: string;
  verificationQuestion?: string;
  hiddenVerificationDetails?: string;
  images: UploadedCloudinaryFile[];
};

export type UserReportSummary = {
  adminNotes: string | null;
  id: string;
  title: string;
  type: ItemType;
  status: ItemStatus;
  category: string;
  location: string;
  referenceNumber: string;
  reportedDate: string;
  eventDate: string | null;
  primaryImageUrl: string | null;
  claimCount: number;
};

export type UserReportDetail = UserReportSummary & {
  adminNotes: string | null;
  brand: string | null;
  colour: string | null;
  description: string;
  eventTime: string | null;
  landmark: string | null;
  storageOption: string | null;
  hiddenVerificationDetails: string | null;
  privateOwnerNotes: string | null;
  images: PublicItem["images"];
};

export type PossibleMatch = {
  item: PublicItem;
  score: number;
  reasons: string[];
};

export type ClaimStatus = "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "CANCELLED";

export type CreateClaimInput = {
  itemId: string;
  proofDescription: string;
  hiddenDetails: string;
  evidenceImage?: UploadedCloudinaryFile | null;
};

export type UserClaimSummary = {
  id: string;
  itemId: string;
  status: ClaimStatus;
  referenceNumber: string;
  createdAt: string;
  itemTitle: string;
  itemImageUrl: string | null;
};

export type UserClaimDetail = UserClaimSummary & {
  proofDescription: string;
  pickupLocation: string | null;
  pickupCode: string | null;
};
