const mongoose = require('mongoose');

const PerformanceReviewSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  reviewPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  reviewType: {
    type: String,
    enum: ['annual', 'semi_annual', 'quarterly', 'probation', 'project', 'other'],
    default: 'annual'
  },
  status: {
    type: String,
    enum: ['draft', 'in_progress', 'self_review_completed', 'manager_review_completed', 'completed', 'cancelled'],
    default: 'draft'
  },
  dueDate: {
    type: Date,
    required: true
  },
  completedDate: {
    type: Date
  },
  ratings: {
    overall: {
      type: Number,
      min: 1,
      max: 5
    },
    categories: [{
      name: String,
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      weight: {
        type: Number,
        default: 1
      },
      comments: String
    }]
  },
  selfAssessment: {
    completed: {
      type: Boolean,
      default: false
    },
    completedDate: Date,
    achievements: String,
    challenges: String,
    goals: String,
    comments: String
  },
  managerAssessment: {
    completed: {
      type: Boolean,
      default: false
    },
    completedDate: Date,
    strengths: String,
    areasForImprovement: String,
    recommendations: String,
    comments: String
  },
  goals: [{
    title: String,
    description: String,
    targetDate: Date,
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'cancelled'],
      default: 'not_started'
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    comments: String
  }],
  developmentPlan: {
    trainingNeeds: [String],
    careerPath: String,
    mentorship: String,
    comments: String
  },
  attachments: [{
    name: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  acknowledgement: {
    employee: {
      acknowledged: {
        type: Boolean,
        default: false
      },
      date: Date,
      comments: String
    },
    manager: {
      acknowledged: {
        type: Boolean,
        default: false
      },
      date: Date,
      comments: String
    }
  },
  history: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    action: String,
    date: {
      type: Date,
      default: Date.now
    },
    comments: String
  }]
}, { timestamps: true });

// Create index for faster searches
PerformanceReviewSchema.index({ employee: 1 });
PerformanceReviewSchema.index({ reviewer: 1 });
PerformanceReviewSchema.index({ status: 1 });
PerformanceReviewSchema.index({ 'reviewPeriod.startDate': 1, 'reviewPeriod.endDate': 1 });
PerformanceReviewSchema.index({ dueDate: 1 });

module.exports = mongoose.model('PerformanceReview', PerformanceReviewSchema);
