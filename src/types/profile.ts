export type ProfileUpdateStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ProfileUpdateRequest = {
  id: string;
  requestedName: string;
  requestedEmail: string;
  requestedPhone: string | null;
  status: ProfileUpdateStatus;
  adminNotes: string | null;
  createdAt: string;
};

export type CreateProfileUpdateRequestInput = {
  name: string;
  email: string;
  phone?: string | null;
};
