const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  leaveType: {
    type: String,
    enum: ['annual', 'sick', 'maternity', 'paternity', 'bereavement', 'unpaid', 'casual', 'compensatory', 'work_from_home', 'other'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalDays: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  handoverNotes: {
    type: String
  },
  workCoveredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  approvalDate: {
    type: Date
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    name: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  notifyList: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notified: {
      type: Boolean,
      default: false
    }
  }],
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled']
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    comments: String
  }],
  returnToWorkDate: {
    type: Date
  },
  actualReturnDate: {
    type: Date
  },
  isHalfDay: {
    type: Boolean,
    default: false
  },
  halfDayPortion: {
    type: String,
    enum: ['first_half', 'second_half'],
    default: 'first_half'
  }
}, { timestamps: true });

// Create index for faster searches
LeaveSchema.index({ employee: 1 });
LeaveSchema.index({ status: 1 });
LeaveSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Leave', LeaveSchema);
