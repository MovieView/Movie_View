interface INotificationSubString {
  value: string;
  bold?: boolean;
}

interface INotification {
  id: string;
  value: string | INotificationSubString[];
  icon?: string;
  url?: string;
  read: boolean;
  createdAt: string;
}

interface IRawNotification {
  id: string;
  template_data: string;
  created_at: string;
  url_template: string;
  template_message: string;
  type_id: number;
  type_name: string;
  checked: boolean;
}

interface INotificationResponse {
  unreadCount: number;
  rows: IRawNotification[];
}