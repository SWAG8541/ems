const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');
const { hasPermission } = require('../middleware/permission.middleware');

// Get all notifications for the current user
router.get('/', protect, NotificationController.getUserNotifications);

// Get unread notification count
router.get('/unread-count', protect, NotificationController.getUnreadCount);

// Mark all notifications as read
router.patch('/read-all', protect, NotificationController.markAllAsRead);

// Get notification by ID
router.get('/:id', protect, NotificationController.getNotificationById);

// Create a new notification
router.post('/', protect, hasPermission('notification', 'create'), NotificationController.createNotification);

// Mark notification as read
router.patch('/:id/read', protect, NotificationController.markAsRead);

// Delete notification
router.delete('/:id', protect, NotificationController.deleteNotification);

module.exports = router;
