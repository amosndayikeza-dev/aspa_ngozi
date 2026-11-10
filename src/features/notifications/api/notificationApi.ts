import { callBackend } from '../../../shared/lib/tauri';
import type { Notification } from "../types";

export const notificationApi = {
  getNotifications: async (): Promise<Notification[]> => {
    return callBackend<Notification[]>('get_notifications');
  },
  
  markAsRead: async (id: string): Promise<void> => {
    return callBackend<void>('mark_notification_read', { id });
  },

  markAllAsRead: async (): Promise<void> => {
    return callBackend<void>('mark_all_notifications_read');
  },

  deleteNotification: async (id: string): Promise<void> => {
    return callBackend<void>('delete_notification', { id });
  }
};