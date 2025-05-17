import apiClient from './apiClient';

const API_ENDPOINT = 'notifications';

// Get all notifications for the current user
const getUserNotifications = async (userId) => {
  try {
    // Use real API endpoint
    const response = await apiClient.get(API_ENDPOINT);
    return response.data.notifications || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Get unread notifications count
const getUnreadCount = async () => {
  try {
    // Use real API endpoint
    const response = await apiClient.get(`${API_ENDPOINT}/unread-count`);
    return response.data.count || 0;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0; // Return 0 on error to avoid breaking the UI
  }
};

// Mark notification as read
const markAsRead = async (notificationId) => {
  try {
    // Use real API endpoint
    const response = await apiClient.patch(`${API_ENDPOINT}/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
const markAllAsRead = async () => {
  try {
    // Use real API endpoint
    const response = await apiClient.patch(`${API_ENDPOINT}/read-all`);
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete a notification
const deleteNotification = async (notificationId) => {
  try {
    // Use real API endpoint
    await apiClient.delete(`${API_ENDPOINT}/${notificationId}`);
    return { success: true, notificationId };
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Create a notification
const createNotification = async (notificationData) => {
  try {
    // Use real API endpoint
    const response = await apiClient.post(API_ENDPOINT, notificationData);
    return response.data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Helper function to create a leave approval notification
const createLeaveApprovalNotification = async ({ recipient, leaveData, isApproved, reason }) => {
  const type = isApproved ? 'leave_approved' : 'leave_rejected';
  const title = isApproved ? 'Leave Approved' : 'Leave Rejected';
  const dateRange = `${new Date(leaveData.startDate).toLocaleDateString()} - ${new Date(leaveData.endDate).toLocaleDateString()}`;

  let message = isApproved
    ? `Your ${leaveData.leaveType} leave request for ${dateRange} has been approved.`
    : `Your ${leaveData.leaveType} leave request for ${dateRange} has been rejected.`;

  if (!isApproved && reason) {
    message += ` Reason: ${reason}`;
  }

  return await createNotification({
    recipient,
    type,
    title,
    message,
    priority: isApproved ? 'normal' : 'high',
    relatedModel: 'Leave',
    relatedId: leaveData._id
  });
};

// Helper function to create an attendance anomaly notification
const createAttendanceAnomalyNotification = async ({ recipient, attendanceData, anomalyType }) => {
  const date = attendanceData.date ? new Date(attendanceData.date).toLocaleDateString() : new Date().toLocaleDateString();
  const title = anomalyType === 'late' ? 'Late Arrival' : 'Early Departure';
  const message = anomalyType === 'late'
    ? `You arrived late on ${date}. Please provide a reason if you haven't already.`
    : `You left early on ${date}. Please provide a reason if you haven't already.`;

  return await createNotification({
    recipient,
    type: 'attendance_anomaly',
    title,
    message,
    priority: 'normal',
    relatedModel: 'Attendance',
    relatedId: attendanceData._id
  });
};

// Helper function to create a leave reminder notification
const createLeaveReminderNotification = async ({ recipient, pendingCount }) => {
  return await createNotification({
    recipient,
    type: 'leave_reminder',
    title: 'Pending Leave Requests',
    message: `You have ${pendingCount} pending leave request${pendingCount !== 1 ? 's' : ''} awaiting your approval.`,
    priority: pendingCount > 5 ? 'high' : 'normal',
    relatedModel: 'Leave',
    relatedId: null
  });
};

const notificationService = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  createLeaveApprovalNotification,
  createAttendanceAnomalyNotification,
  createLeaveReminderNotification
};

export default notificationService;
