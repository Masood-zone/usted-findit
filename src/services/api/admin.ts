import type {
  AdminActionMessageInput,
  AdminClaimDetail,
  AdminClaimSummary,
  AdminDashboardResponse,
  AdminReportDetail,
  AdminReportFilters,
  AdminReportSummary,
  AdminStatisticsResponse,
  AdminUserDetail,
  AdminUserSummary
} from "@/types/admin";
import type { ApiSuccessBody } from "@/types/api";
import type { ClaimStatus } from "@/types/reports";
import { apiClient } from "./axios";

function toParams(filters: Record<string, unknown>) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });

  return params.toString();
}

export async function getAdminDashboard() {
  const response = await apiClient.get<ApiSuccessBody<AdminDashboardResponse>>("/api/admin/dashboard");
  return response.data.data;
}

export async function getAdminReports(filters: AdminReportFilters = {}) {
  const query = toParams(filters);
  const response = await apiClient.get<ApiSuccessBody<{ reports: AdminReportSummary[] }>>(`/api/admin/reports${query ? `?${query}` : ""}`);
  return response.data.data;
}

export async function getAdminReport(reportId: string) {
  const response = await apiClient.get<ApiSuccessBody<{ report: AdminReportDetail }>>(`/api/admin/reports/${reportId}`);
  return response.data.data;
}

export async function approveAdminReport(reportId: string, input: AdminActionMessageInput = {}) {
  const response = await apiClient.patch<ApiSuccessBody<{ report: AdminReportDetail }>>(`/api/admin/reports/${reportId}/approve`, input);
  return response.data.data;
}

export async function rejectAdminReport(reportId: string, input: AdminActionMessageInput) {
  const response = await apiClient.patch<ApiSuccessBody<{ report: AdminReportDetail }>>(`/api/admin/reports/${reportId}/reject`, input);
  return response.data.data;
}

export async function requestAdminReportChanges(reportId: string, input: AdminActionMessageInput) {
  const response = await apiClient.patch<ApiSuccessBody<{ report: AdminReportDetail }>>(`/api/admin/reports/${reportId}/request-changes`, input);
  return response.data.data;
}

export async function removeAdminReport(reportId: string, input: AdminActionMessageInput) {
  const response = await apiClient.patch<ApiSuccessBody<{ report: AdminReportDetail }>>(`/api/admin/reports/${reportId}/remove`, input);
  return response.data.data;
}

export async function resolveAdminReport(reportId: string, input: AdminActionMessageInput = {}) {
  const response = await apiClient.patch<ApiSuccessBody<{ report: AdminReportDetail }>>(`/api/admin/reports/${reportId}/resolve`, input);
  return response.data.data;
}

export async function getAdminClaims(status?: ClaimStatus | "ALL") {
  const query = toParams({ status });
  const response = await apiClient.get<ApiSuccessBody<{ claims: AdminClaimSummary[] }>>(`/api/admin/claims${query ? `?${query}` : ""}`);
  return response.data.data;
}

export async function getAdminClaim(claimId: string) {
  const response = await apiClient.get<ApiSuccessBody<{ claim: AdminClaimDetail }>>(`/api/admin/claims/${claimId}`);
  return response.data.data;
}

export async function approveAdminClaim(claimId: string, input: AdminActionMessageInput = {}) {
  const response = await apiClient.patch<ApiSuccessBody<{ claim: AdminClaimDetail }>>(`/api/admin/claims/${claimId}/approve`, input);
  return response.data.data;
}

export async function rejectAdminClaim(claimId: string, input: AdminActionMessageInput) {
  const response = await apiClient.patch<ApiSuccessBody<{ claim: AdminClaimDetail }>>(`/api/admin/claims/${claimId}/reject`, input);
  return response.data.data;
}

export async function getAdminUsers() {
  const response = await apiClient.get<ApiSuccessBody<{ users: AdminUserSummary[] }>>("/api/admin/users");
  return response.data.data;
}

export async function getAdminUser(userId: string) {
  const response = await apiClient.get<ApiSuccessBody<{ user: AdminUserDetail }>>(`/api/admin/users/${userId}`);
  return response.data.data;
}

export async function getAdminStatistics() {
  const response = await apiClient.get<ApiSuccessBody<AdminStatisticsResponse>>("/api/admin/statistics");
  return response.data.data;
}
