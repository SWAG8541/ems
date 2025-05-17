const mongoose = require('mongoose');

// Break schema (embedded)
const BreakSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['lunch', 'tea', 'personal', 'meeting', 'other'],
    required: true
  },
  description: String,
  startTime: {
    type: Date,
    required: true
  },
  endTime: Date,
  duration: {
    type: Number, // in minutes
    default: 0
  }
});

const AttendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  clockInTime: {
    type: Date,
    required: true
  },
  clockOutTime: Date,
  location: {
    clockIn: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    clockOut: {
      latitude: Number,
      longitude: Number,
      address: String
    }
  },
  device: {
    clockIn: String,
    clockOut: String
  },
  ipAddress: {
    clockIn: String,
    clockOut: String
  },
  goals: String,
  accomplishments: String,
  status: {
    type: String,
    enum: ['present', 'absent', 'half_day', 'late', 'leave', 'holiday', 'weekend'],
    default: 'present'
  },
  isLate: {
    type: Boolean,
    default: false
  },
  lateReason: String,
  isEarlyDeparture: {
    type: Boolean,
    default: false
  },
  earlyDepartureReason: String,
  totalWorkDuration: {
    type: Number, // in minutes
    default: 0
  },
  breaks: [BreakSchema],
  onBreak: {
    type: Boolean,
    default: false
  },
  notes: [String],
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  modified: {
    isModified: {
      type: Boolean,
      default: false
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    modifiedAt: Date,
    reason: String
  }
}, { timestamps: true });

// Create compound index for employee and date (should be unique)
AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ status: 1 });
AttendanceSchema.index({ date: 1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);
