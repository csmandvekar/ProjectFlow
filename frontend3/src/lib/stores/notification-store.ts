import { create } from 'zustand';
import api from '../api';

export type NotificationType = 
  | 'task_assigned'
  | 'task_updated'
  | 'comment_added'
  | 'member_joined'
  | 'role_changed'
  | 'project_update';

interface Notification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  project: {
    _id: string;
    title: string;
  };
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  read: boolean;
  createdAt: string;
  link?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: (query?: { page?: number; limit?: number; unreadOnly?: boolean }) => Promise<void>;
  markAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  addNotification: (notification: Notification) => void;
}

const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotifications: async (query = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/notifications', { params: query });
      console.log('Fetched notifications:', response.data);
      set({
        notifications: response.data.notifications || [],
        unreadCount: response.data.unreadCount || 0,
        loading: false
      });
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      set({
        error: error.response?.data?.message || error.message,
        loading: false
      });
    }
  },

  markAsRead: async (notificationIds) => {
    try {
      const response = await api.patch('/notifications/read', { notificationIds });
      console.log('Marked notifications as read:', response.data);
      set(state => ({
        notifications: state.notifications.map(notification =>
          notificationIds.includes(notification._id)
            ? { ...notification, read: true }
            : notification
        ),
        unreadCount: response.data.unreadCount
      }));
    } catch (error: any) {
      console.error('Error marking notifications as read:', error);
      set({ error: error.response?.data?.message || error.message });
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await api.patch('/notifications/read-all');
      console.log('Marked all notifications as read:', response.data);
      set(state => ({
        notifications: state.notifications.map(notification => ({
          ...notification,
          read: true
        })),
        unreadCount: 0
      }));
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      set({ error: error.response?.data?.message || error.message });
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      console.log('Deleted notification:', response.data);
      set(state => ({
        notifications: state.notifications.filter(n => n._id !== notificationId),
        unreadCount: response.data.unreadCount
      }));
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      set({ error: error.response?.data?.message || error.message });
    }
  },

  clearAllNotifications: async () => {
    try {
      await api.delete('/notifications');
      console.log('Cleared all notifications');
      set({
        notifications: [],
        unreadCount: 0
      });
    } catch (error: any) {
      console.error('Error clearing notifications:', error);
      set({ error: error.response?.data?.message || error.message });
    }
  },

  addNotification: (notification) => {
    console.log('Adding new notification:', notification);
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  }
}));

export default useNotificationStore;