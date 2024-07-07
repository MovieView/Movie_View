interface INotificationSubString {
  value: string;
  bold?: boolean;
}

interface INotification {
  value: string | INotificationSubString[];
  icon?: string;
  url?: string;
  createdAt: string;
}