const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  client: {
    name: String,
    contactPerson: String,
    email: String,
    phone: String
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  team: [{
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    role: String,
    joinDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date
  }],
  budget: {
    planned: {
      amount: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    },
    actual: {
      amount: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    }
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  tags: [String],
  attachments: [{
    name: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  milestones: [{
    title: String,
    description: String,
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'delayed'],
      default: 'pending'
    },
    completedDate: Date
  }],
  risks: [{
    description: String,
    impact: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    probability: {
      type: String,
      enum: ['low', 'medium', 'high', 'very_high'],
      default: 'medium'
    },
    mitigation: String,
    status: {
      type: String,
      enum: ['identified', 'monitoring', 'mitigated', 'occurred'],
      default: 'identified'
    }
  }]
}, { timestamps: true });

// Create index for faster searches
ProjectSchema.index({ name: 1 });
ProjectSchema.index({ code: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ manager: 1 });
ProjectSchema.index({ 'team.employee': 1 });
ProjectSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Project', ProjectSchema);
