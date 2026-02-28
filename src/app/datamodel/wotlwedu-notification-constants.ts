export const NOTIFICATION_STATUS = {
  unread: 100,
  read: 101,
  archived: 102,
} as const;

export const NOTIFICATION_TYPE = {
  friendRequest: 103,
  electionStart: 104,
  electionEnd: 105,
  electionExpired: 106,
  shareImage: 107,
  shareItem: 108,
  shareList: 109,
} as const;

export interface WotlweduNotificationEvent {
  kind: "created" | "updated" | "deleted";
  notificationId: string;
  unreadCount?: number;
  notification?: any;
}
