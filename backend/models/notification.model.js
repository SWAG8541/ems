const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      // Task notifications
      'task_assigned', 'task_updated', 'task_completed', 'task_status_changed',

      // Project notifications
      'project_created', 'project_updated', 'project_completed',

      // Leave notifications
      'leave_request', 'leave_approved', 'leave_rejected', 'leave_reminder',

      // Attendance notifications
      'attendance_anomaly', 'attendance_late', 'attendance_early_departure', 'break_too_long',

      // Timesheet notifications
      'timesheet_reminder', 'timesheet_approved', 'timesheet_rejected',

      // Other notifications
      'performance_review', 'announcement', 'message', 'system', 'general', 'other'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  link: {
    type: String
  },
  relatedModel: {
    type: String,
    enum: ['Task', 'Project', 'Leave', 'TimeEntry', 'Attendance', 'PerformanceReview', 'Employee', 'User', 'Department', 'Announcement', 'Message']
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  expiresAt: {
    type: Date
  },
  actions: [{
    label: String,
    action: String,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }]
}, { timestamps: true });

// Create index for faster searches
NotificationSchema.index({ recipient: 1 });
NotificationSchema.index({ read: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ priority: 1 });
NotificationSchema.index({ createdAt: 1 });
NotificationSchema.index({ relatedModel: 1, relatedId: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-expiration

// Auto-expire notifications after 30 days if expiresAt is not set
NotificationSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    this.expiresAt = thirtyDaysFromNow;
  }
  next();
});

module.exports = mongoose.model('Notification', NotificationSchema);
