const mongoose = require('mongoose');

const BreakSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  attendance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendance',
    required: true
  },
  type: {
    type: String,
    enum: ['lunch', 'tea', 'other'],
    required: true
  },
  description: {
    type: String,
    required: function() {
      return this.type === 'other';
    }
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number, // Duration in minutes
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Calculate duration when break is completed
BreakSchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    const durationMs = this.endTime - this.startTime;
    this.duration = Math.round(durationMs / (1000 * 60)); // Convert to minutes
    this.status = 'completed';
  }
  next();
});

module.exports = mongoose.model('Break', BreakSchema);
