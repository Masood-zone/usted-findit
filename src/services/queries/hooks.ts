import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveAdminClaim,
  approveAdminReport,
  getAdminClaim,
  getAdminClaims,
  getAdminDashboard,
  getAdminReport,
  getAdminReports,
  getAdminStatistics,
  getAdminUser,
  getAdminUsers,
  rejectAdminClaim,
  rejectAdminReport,
  removeAdminReport,
  resolveAdminReport,
  requestAdminReportChanges
} from "@/services/api/admin";
import {
  createProfileUpdateRequest,
  createUserClaim,
  createUserReport,
  getPossibleMatches,
  getSavedItems,
  getUserClaim,
  getUserClaims,
  getUserDashboard,
  getUserItem,
  getUserItems,
  getUserNotifications,
  getUserProfile,
  getUserReport,
  getUserReports,
  markAllNotificationsRead,
  markNotificationRead,
  registerPushToken,
  saveItem,
  unsaveItem,
  updateUserReport
} from "@/services/api/user";
import { useUploadFile } from "@/services/api/uploads";
import type { UserItemSearchFilters } from "@/types/items";
import type { AdminActionMessageInput, AdminReportFilters } from "@/types/admin";
import type { ClaimStatus } from "@/types/reports";
import { queryKeys } from "./keys";

export { useUploadFile };

export function useUserDashboard() {
  return useQuery({
    queryKey: queryKeys.userDashboard,
    queryFn: getUserDashboard
  });
}

export function useUserItems(filters: UserItemSearchFilters) {
  return useQuery({
    queryKey: queryKeys.userItems(filters),
    queryFn: () => getUserItems(filters)
  });
}

export function useUserItem(itemId: string) {
  return useQuery({
    queryKey: queryKeys.userItem(itemId),
    queryFn: () => getUserItem(itemId),
    enabled: Boolean(itemId)
  });
}

export function useUserProfile() {
  return useQuery({
    queryKey: queryKeys.userProfile,
    queryFn: getUserProfile
  });
}

export function useSavedItems() {
  return useQuery({
    queryKey: queryKeys.savedItems,
    queryFn: getSavedItems
  });
}

export function useToggleSavedItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, saved }: { itemId: string; saved: boolean }) => (saved ? unsaveItem(itemId) : saveItem(itemId)),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userDashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.savedItems });
      queryClient.invalidateQueries({ queryKey: queryKeys.userItem(variables.itemId) });
      queryClient.invalidateQueries({ queryKey: ["user-items"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.userProfile });
    }
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUserReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userReports });
      queryClient.invalidateQueries({ queryKey: queryKeys.userProfile });
    }
  });
}

export function useUserReports() {
  return useQuery({
    queryKey: queryKeys.userReports,
    queryFn: getUserReports
  });
}

export function useUserReport(reportId: string) {
  return useQuery({
    enabled: Boolean(reportId),
    queryFn: () => getUserReport(reportId),
    queryKey: queryKeys.userReport(reportId)
  });
}

export function useUpdateReport(reportId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof updateUserReport>[1]) => updateUserReport(reportId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userReports });
      queryClient.invalidateQueries({ queryKey: queryKeys.userReport(reportId) });
      queryClient.invalidateQueries({ queryKey: ["user-items"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.userProfile });
    }
  });
}

export function usePossibleMatches(reportId: string) {
  return useQuery({
    enabled: Boolean(reportId),
    queryFn: () => getPossibleMatches(reportId),
    queryKey: queryKeys.possibleMatches(reportId)
  });
}

export function useCreateClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUserClaim,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userClaims });
      queryClient.invalidateQueries({ queryKey: queryKeys.userItem(data.claim.itemId) });
    }
  });
}

export function useUserClaims() {
  return useQuery({
    queryKey: queryKeys.userClaims,
    queryFn: getUserClaims
  });
}

export function useUserClaim(claimId: string) {
  return useQuery({
    enabled: Boolean(claimId),
    queryFn: () => getUserClaim(claimId),
    queryKey: queryKeys.userClaim(claimId)
  });
}

export function useCreateProfileUpdateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProfileUpdateRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userProfile });
    }
  });
}

export function useUserNotifications() {
  return useQuery({
    queryKey: queryKeys.userNotifications,
    queryFn: getUserNotifications
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userNotifications });
    }
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userNotifications });
    }
  });
}

export function useRegisterPushToken() {
  return useMutation({
    mutationFn: registerPushToken
  });
}

function invalidateAdminCollections(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
  queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
  queryClient.invalidateQueries({ queryKey: ["admin-claims"] });
  queryClient.invalidateQueries({ queryKey: queryKeys.adminStatistics });
}

export function useAdminDashboard() {
  return useQuery({
    queryFn: getAdminDashboard,
    queryKey: queryKeys.adminDashboard
  });
}

export function useAdminReports(filters: AdminReportFilters = {}) {
  return useQuery({
    queryFn: () => getAdminReports(filters),
    queryKey: queryKeys.adminReports(filters)
  });
}

export function useAdminReport(reportId: string) {
  return useQuery({
    enabled: Boolean(reportId),
    queryFn: () => getAdminReport(reportId),
    queryKey: queryKeys.adminReport(reportId)
  });
}

export function useApproveAdminReport(reportId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminActionMessageInput = {}) => approveAdminReport(reportId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminReport(reportId) });
      invalidateAdminCollections(queryClient);
    }
  });
}

export function useRejectAdminReport(reportId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminActionMessageInput) => rejectAdminReport(reportId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminReport(reportId) });
      invalidateAdminCollections(queryClient);
    }
  });
}

export function useRequestAdminReportChanges(reportId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminActionMessageInput) => requestAdminReportChanges(reportId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminReport(reportId) });
      invalidateAdminCollections(queryClient);
    }
  });
}

export function useRemoveAdminReport(reportId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminActionMessageInput) => removeAdminReport(reportId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminReport(reportId) });
      invalidateAdminCollections(queryClient);
    }
  });
}

export function useResolveAdminReport(reportId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminActionMessageInput = {}) => resolveAdminReport(reportId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminReport(reportId) });
      invalidateAdminCollections(queryClient);
    }
  });
}

export function useAdminClaims(status?: ClaimStatus | "ALL") {
  return useQuery({
    queryFn: () => getAdminClaims(status),
    queryKey: queryKeys.adminClaims(status)
  });
}

export function useAdminClaim(claimId: string) {
  return useQuery({
    enabled: Boolean(claimId),
    queryFn: () => getAdminClaim(claimId),
    queryKey: queryKeys.adminClaim(claimId)
  });
}

export function useApproveAdminClaim(claimId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminActionMessageInput = {}) => approveAdminClaim(claimId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminClaim(claimId) });
      invalidateAdminCollections(queryClient);
    }
  });
}

export function useRejectAdminClaim(claimId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminActionMessageInput) => rejectAdminClaim(claimId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminClaim(claimId) });
      invalidateAdminCollections(queryClient);
    }
  });
}

export function useAdminUsers() {
  return useQuery({
    queryFn: getAdminUsers,
    queryKey: queryKeys.adminUsers
  });
}

export function useAdminUser(userId: string) {
  return useQuery({
    enabled: Boolean(userId),
    queryFn: () => getAdminUser(userId),
    queryKey: queryKeys.adminUser(userId)
  });
}

export function useAdminStatistics() {
  return useQuery({
    queryFn: getAdminStatistics,
    queryKey: queryKeys.adminStatistics
  });
}
