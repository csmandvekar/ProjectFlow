const User = require('../models/User');

class NotificationService {
  static async createNotification(data) {
    try {
      const {
        type,
        title,
        message,
        recipient,
        sender,
        project,
        link
      } = data;

      const user = await User.findById(recipient);
      if (!user) {
        throw new Error('Recipient not found');
      }

      // Add notification to user's notifications array
      const notification = {
        type,
        title,
        message,
        sender,
        read: false,
        createdAt: new Date()
      };

      // Add project or team if provided
      if (project) notification.project = project;
      if (data.team) notification.team = data.team;
      if (data.actionType) notification.actionType = data.actionType;
      if (data.actionData) notification.actionData = data.actionData;

      user.notifications.unshift(notification);

      // Increment unread count
      user.unreadNotificationsCount += 1;

      // Save user
      await user.save();

      // Emit socket event if socket.io is available
      if (global.io) {
        global.io.to(`user:${recipient}`).emit('notification:new', {
          type,
          title,
          message,
          project,
          sender,
          link,
          createdAt: new Date()
        });
      }

      return user.notifications[0];
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async getNotifications(userId, query = {}) {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = query;
      const skip = (page - 1) * limit;

      const user = await User.findById(userId)
        .select('notifications unreadNotificationsCount')
        .populate('notifications.sender', 'name avatar')
        .populate('notifications.project', 'title')
        .populate('notifications.team', 'name');

      if (!user) {
        throw new Error('User not found');
      }

      let notifications = user.notifications;
      if (unreadOnly) {
        notifications = notifications.filter(n => !n.read);
      }

      return {
        notifications: notifications.slice(skip, skip + limit),
        total: notifications.length,
        unreadCount: user.unreadNotificationsCount
      };
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }

  static async markAsRead(userId, notificationIds) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      let unreadCount = user.unreadNotificationsCount;

      user.notifications = user.notifications.map(notification => {
        if (notificationIds.includes(notification._id.toString()) && !notification.read) {
          notification.read = true;
          unreadCount = Math.max(0, unreadCount - 1);
        }
        return notification;
      });

      user.unreadNotificationsCount = unreadCount;
      await user.save();

      return {
        success: true,
        unreadCount
      };
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  }

  static async markAllAsRead(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.notifications = user.notifications.map(notification => {
        notification.read = true;
        return notification;
      });

      user.unreadNotificationsCount = 0;
      await user.save();

      return {
        success: true,
        unreadCount: 0
      };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  static async deleteNotification(userId, notificationId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const notificationIndex = user.notifications.findIndex(
        n => n._id.toString() === notificationId
      );

      if (notificationIndex === -1) {
        throw new Error('Notification not found');
      }

      // If notification was unread, decrement the counter
      if (!user.notifications[notificationIndex].read) {
        user.unreadNotificationsCount = Math.max(0, user.unreadNotificationsCount - 1);
      }

      // Remove the notification
      user.notifications.splice(notificationIndex, 1);
      await user.save();

      return {
        success: true,
        unreadCount: user.unreadNotificationsCount
      };
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  static async clearAllNotifications(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.notifications = [];
      user.unreadNotificationsCount = 0;
      await user.save();

      return {
        success: true
      };
    } catch (error) {
      console.error('Error clearing notifications:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;