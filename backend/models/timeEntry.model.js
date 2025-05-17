const mongoose = require('mongoose');

const TimeEntrySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'draft'
  },
  billable: {
    type: Boolean,
    default: true
  },
  billingRate: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  tags: [String],
  location: {
    type: String
  },
  source: {
    type: String,
    enum: ['manual', 'timer', 'import', 'mobile'],
    default: 'manual'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  approvalDate: {
    type: Date
  },
  invoiced: {
    status: {
      type: Boolean,
      default: false
    },
    invoiceNumber: String,
    invoiceDate: Date
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

// Create index for faster searches
TimeEntrySchema.index({ employee: 1 });
TimeEntrySchema.index({ project: 1 });
TimeEntrySchema.index({ task: 1 });
TimeEntrySchema.index({ date: 1 });
TimeEntrySchema.index({ status: 1 });
TimeEntrySchema.index({ billable: 1 });

module.exports = mongoose.model('TimeEntry', TimeEntrySchema);
