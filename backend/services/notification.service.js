const Notification = require('../models/notification.model');

// Create a new notification
exports.createNotification = async (notificationData) => {
  // Validate required fields
  if (!notificationData.recipient) {
    throw new Error('Recipient is required');
  }
  
  if (!notificationData.title) {
    throw new Error('Notification title is required');
  }
  
  if (!notificationData.message) {
    throw new Error('Notification message is required');
  }
  
  // Set default values if not provided
  if (!notificationData.type) {
    notificationData.type = 'general';
  }
  
  if (!notificationData.priority) {
    notificationData.priority = 'normal';
  }
  
  // Create and save the notification
  const notification = new Notification(notificationData);
  return await notification.save();
};

// Get notifications for a user
exports.getUserNotifications = async (userId, filters = {}) => {
  const query = { recipient: userId };
  
  // Apply filters if provided
  if (filters.read !== undefined) {
    query.read = filters.read === 'true';
  }
  
  if (filters.type) {
    query.type = filters.type;
  }
  
  if (filters.priority) {
    query.priority = filters.priority;
  }
  
  // Pagination
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;
  
  // Get notifications
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const total = await Notification.countDocuments(query);
  
  return {
    notifications,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

// Get notification by ID
exports.getNotificationById = async (notificationId) => {
  return await Notification.findById(notificationId);
};

// Mark notification as read
exports.markAsRead = async (notificationId) => {
  return await Notification.findByIdAndUpdate(
    notificationId,
    { read: true, readAt: new Date() },
    { new: true }
  );
};

// Mark all notifications as read for a user
exports.markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { recipient: userId, read: false },
    { read: true, readAt: new Date() }
  );
  
  return {
    success: true,
    count: result.modifiedCount
  };
};

// Delete notification
exports.deleteNotification = async (notificationId) => {
  return await Notification.findByIdAndDelete(notificationId);
};

// Get unread notification count for a user
exports.getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ recipient: userId, read: false });
};
