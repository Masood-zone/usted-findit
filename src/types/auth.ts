export type AppRole = "USER" | "ADMIN" | "SUPER_ADMIN";

export type AccountStatus = "ACTIVE" | "SUSPENDED" | "PENDING";

export type AuthSessionUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  phone?: string | null;
  institutionId?: string | null;
  role: AppRole;
  onboardingCompleted: boolean;
  accountStatus: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
};
