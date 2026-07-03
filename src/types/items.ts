export type ItemType = "LOST" | "FOUND";
export type ItemStatus = "PENDING" | "PUBLISHED" | "CLAIMED" | "RESOLVED" | "REJECTED" | "REMOVED" | "CHANGES_REQUESTED";
export type PublicItemStatus = "PUBLISHED" | "CLAIMED";

export type PublicItemImage = {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
};

export type PublicItem = {
  id: string;
  title: string;
  type: ItemType;
  status: PublicItemStatus;
  category: string;
  location: string;
  reportedDate: string;
  description: string;
  referenceNumber: string;
  images: PublicItemImage[];
  isSaved: boolean;
};

export type UserDashboardResponse = {
  greetingName: string;
  recentFoundItems: PublicItem[];
  recentLostItems: PublicItem[];
  stats: {
    recoveryRate: number;
    itemsReturned: number;
    activeReports: number;
  };
  categories: {
    label: string;
    value: string;
    icon: "id" | "key" | "electronics" | "other";
  }[];
};

export type UserItemSearchFilters = {
  q?: string;
  type?: ItemType;
  category?: string;
  location?: string;
  status?: PublicItemStatus;
  page?: number;
  pageSize?: number;
};

export type UserItemSearchResponse = {
  query: UserItemSearchFilters;
  total: number;
  hasMore: boolean;
  items: PublicItem[];
};

export type UserProfileResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    institutionId: string | null;
    image: string | null;
    role: string;
    accountStatus: string;
  };
  stats: {
    savedItems: number;
    reportsSubmitted: number;
    claimsStarted: number;
  };
  pendingProfileUpdate: {
    id: string;
    requestedName: string;
    requestedEmail: string;
    requestedPhone: string | null;
    status: "PENDING" | "APPROVED" | "REJECTED";
    adminNotes: string | null;
    createdAt: string;
  } | null;
};
