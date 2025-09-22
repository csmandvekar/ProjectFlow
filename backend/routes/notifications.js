const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const NotificationService = require('../services/notificationService');

// Get user's notifications
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await NotificationService.getNotifications(req.user._id, req.query);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mark notifications as read
router.patch('/read', auth, async (req, res) => {
  try {
    const { notificationIds } = req.body;
    const result = await NotificationService.markAsRead(req.user._id, notificationIds);
    res.json(result);
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mark all notifications as read
router.patch('/read-all', auth, async (req, res) => {
  try {
    const result = await NotificationService.markAllAsRead(req.user._id);
    res.json(result);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await NotificationService.deleteNotification(req.user._id, req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: error.message });
  }
});

// Clear all notifications
router.delete('/', auth, async (req, res) => {
  try {
    const result = await NotificationService.clearAllNotifications(req.user._id);
    res.json(result);
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;