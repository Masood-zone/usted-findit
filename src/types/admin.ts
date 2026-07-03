import type { AccountStatus, AppRole } from "./auth";
import type { ItemStatus, ItemType, PublicItemImage } from "./items";
import type { ClaimStatus } from "./reports";

export type AdminReportFilters = {
  q?: string;
  status?: ItemStatus | "ALL";
  type?: ItemType | "ALL";
};

export type AdminReportSummary = {
  id: string;
  title: string;
  type: ItemType;
  status: ItemStatus;
  category: string;
  location: string;
  referenceNumber: string;
  reportedDate: string;
  reporterName: string | null;
  reporterEmail: string | null;
  primaryImageUrl: string | null;
  claimCount: number;
};

export type AdminReportDetail = AdminReportSummary & {
  brand: string | null;
  colour: string | null;
  description: string;
  eventDate: string | null;
  eventTime: string | null;
  landmark: string | null;
  storageOption: string | null;
  hiddenVerificationDetails: string | null;
  privateOwnerNotes: string | null;
  adminNotes: string | null;
  removedReason: string | null;
  images: PublicItemImage[];
};

export type AdminClaimSummary = {
  id: string;
  itemId: string;
  status: ClaimStatus;
  referenceNumber: string;
  createdAt: string;
  claimantName: string;
  claimantEmail: string;
  itemTitle: string;
  itemType: ItemType;
  itemStatus: ItemStatus;
  itemImageUrl: string | null;
};

export type AdminClaimDetail = AdminClaimSummary & {
  proofDescription: string;
  hiddenDetails: string;
  evidenceImageUrl: string | null;
  adminNotes: string | null;
  pickupLocation: string | null;
  pickupCode: string | null;
};

export type AdminUserSummary = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  institutionId: string | null;
  role: AppRole;
  accountStatus: AccountStatus;
  createdAt: string;
  reportsSubmitted: number;
  claimsSubmitted: number;
};

export type AdminUserDetail = AdminUserSummary & {
  recentReports: AdminReportSummary[];
  recentClaims: AdminClaimSummary[];
};

export type AdminDashboardResponse = {
  greetingName: string;
  stats: {
    totalReports: number;
    pendingReports: number;
    publishedReports: number;
    openClaims: number;
    resolvedItems: number;
    removedReports: number;
  };
  pendingReports: AdminReportSummary[];
  recentClaims: AdminClaimSummary[];
  recentActivity: {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    createdAt: string;
  }[];
};

export type AdminStatisticsResponse = {
  totals: AdminDashboardResponse["stats"] & {
    lostReports: number;
    foundReports: number;
    claimedItems: number;
    recoveryRate: number;
  };
  categories: { label: string; value: number }[];
  locations: { label: string; value: number }[];
  monthly: { label: string; lost: number; found: number; resolved: number }[];
};

export type AdminActionMessageInput = {
  reason?: string;
  message?: string;
  adminNotes?: string;
  pickupLocation?: string;
};
