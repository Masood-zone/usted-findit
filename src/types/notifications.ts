export type UserNotification = {
  actionUrl: string | null;
  createdAt: string;
  id: string;
  message: string;
  metadata: unknown;
  readAt: string | null;
  title: string;
  type: string;
};

export type UserNotificationsResponse = {
  notifications: UserNotification[];
  unreadCount: number;
};
