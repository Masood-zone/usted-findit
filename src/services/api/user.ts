import type {
  PublicItem,
  UserDashboardResponse,
  UserItemSearchFilters,
  UserItemSearchResponse,
  UserProfileResponse
} from "@/types/items";
import type { ApiSuccessBody } from "@/types/api";
import type { CreateProfileUpdateRequestInput, ProfileUpdateRequest } from "@/types/profile";
import type { UserNotificationsResponse } from "@/types/notifications";
import type { CreateClaimInput, CreateReportInput, PossibleMatch, UserClaimDetail, UserClaimSummary, UserReportDetail, UserReportSummary } from "@/types/reports";
import { apiClient } from "./axios";

function toParams(filters: UserItemSearchFilters) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    params.set(key, String(value));
  });

  return params.toString();
}

export async function getUserDashboard() {
  const response = await apiClient.get<ApiSuccessBody<UserDashboardResponse>>("/api/user/dashboard");
  return response.data.data;
}

export async function getUserItems(filters: UserItemSearchFilters) {
  const query = toParams(filters);
  const response = await apiClient.get<ApiSuccessBody<UserItemSearchResponse>>(`/api/user/items${query ? `?${query}` : ""}`);
  return response.data.data;
}

export async function getUserItem(itemId: string) {
  const response = await apiClient.get<ApiSuccessBody<{ item: PublicItem }>>(`/api/user/items/${itemId}`);
  return response.data.data;
}

export async function getUserProfile() {
  const response = await apiClient.get<ApiSuccessBody<UserProfileResponse>>("/api/user/profile");
  return response.data.data;
}

export async function getSavedItems() {
  const response = await apiClient.get<ApiSuccessBody<{ items: PublicItem[] }>>("/api/user/saved-items");
  return response.data.data;
}

export async function saveItem(itemId: string) {
  const response = await apiClient.post<ApiSuccessBody<{ itemId: string; isSaved: boolean }>>("/api/user/saved-items", { itemId });
  return response.data.data;
}

export async function unsaveItem(itemId: string) {
  const response = await apiClient.delete<ApiSuccessBody<{ itemId: string; isSaved: boolean }>>("/api/user/saved-items", {
    data: { itemId }
  });
  return response.data.data;
}

export async function createUserReport(input: CreateReportInput) {
  const response = await apiClient.post<ApiSuccessBody<{ report: UserReportDetail }>>("/api/user/reports", input);
  return response.data.data;
}

export async function getUserReports() {
  const response = await apiClient.get<ApiSuccessBody<{ reports: UserReportSummary[] }>>("/api/user/reports");
  return response.data.data;
}

export async function getUserReport(reportId: string) {
  const response = await apiClient.get<ApiSuccessBody<{ report: UserReportDetail }>>(`/api/user/reports/${reportId}`);
  return response.data.data;
}

export async function updateUserReport(reportId: string, input: CreateReportInput) {
  const response = await apiClient.patch<ApiSuccessBody<{ report: UserReportDetail }>>(`/api/user/reports/${reportId}`, input);
  return response.data.data;
}

export async function getPossibleMatches(reportId: string) {
  const response = await apiClient.get<ApiSuccessBody<{ matches: PossibleMatch[] }>>(`/api/user/reports/${reportId}/matches`);
  return response.data.data;
}

export async function createUserClaim(input: CreateClaimInput) {
  const response = await apiClient.post<ApiSuccessBody<{ claim: UserClaimDetail }>>("/api/user/claims", input);
  return response.data.data;
}

export async function getUserClaims() {
  const response = await apiClient.get<ApiSuccessBody<{ claims: UserClaimSummary[] }>>("/api/user/claims");
  return response.data.data;
}

export async function getUserClaim(claimId: string) {
  const response = await apiClient.get<ApiSuccessBody<{ claim: UserClaimDetail }>>(`/api/user/claims/${claimId}`);
  return response.data.data;
}

export async function createProfileUpdateRequest(input: CreateProfileUpdateRequestInput) {
  const response = await apiClient.post<ApiSuccessBody<{ request: ProfileUpdateRequest }>>("/api/user/profile-update-requests", input);
  return response.data.data;
}

export async function getUserNotifications() {
  const response = await apiClient.get<ApiSuccessBody<UserNotificationsResponse>>("/api/user/notifications");
  return response.data.data;
}

export async function markNotificationRead(notificationId: string) {
  const response = await apiClient.patch<ApiSuccessBody<UserNotificationsResponse>>(`/api/user/notifications/${notificationId}`);
  return response.data.data;
}

export async function markAllNotificationsRead() {
  const response = await apiClient.patch<ApiSuccessBody<UserNotificationsResponse>>("/api/user/notifications");
  return response.data.data;
}

export async function registerPushToken(input: { deviceName?: string | null; platform?: string | null; token: string }) {
  const response = await apiClient.post<ApiSuccessBody<{ token: string }>>("/api/user/push-tokens", input);
  return response.data.data;
}
