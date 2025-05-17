const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  position: {
    type: String,
    required: true
  },
  joinDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'on_leave', 'terminated', 'suspended'],
    default: 'active'
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  contactInfo: {
    address: String,
    phone: String,
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    }
  },
  personalInfo: {
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say']
    },
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed', 'other']
    }
  },
  employmentDetails: {
    employmentType: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'intern', 'probation'],
      default: 'full_time'
    },
    workHoursPerWeek: {
      type: Number,
      default: 40
    },
    salary: {
      amount: {
        type: Number,
        default: 0
      },
      currency: {
        type: String,
        default: 'USD'
      }
    },
    bankDetails: {
      accountNumber: String,
      bankName: String,
      branchCode: String
    }
  },
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  skills: [{
    name: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    }
  }],
  education: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    startDate: Date,
    endDate: Date,
    grade: String
  }],
  workExperience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  leaveBalance: {
    annual: {
      type: Number,
      default: 0
    },
    sick: {
      type: Number,
      default: 0
    },
    casual: {
      type: Number,
      default: 0
    },
    compensatory: {
      type: Number,
      default: 0
    },
    unpaid: {
      type: Number,
      default: 0
    }
  },
  attendanceSettings: {
    workStartTime: {
      type: String,
      default: '09:00'
    },
    workEndTime: {
      type: String,
      default: '17:00'
    },
    workDays: {
      type: [Number],
      default: [1, 2, 3, 4, 5] // Monday to Friday (0 = Sunday, 6 = Saturday)
    },
    lateThreshold: {
      type: Number,
      default: 15 // minutes
    },
    earlyDepartureThreshold: {
      type: Number,
      default: 15 // minutes
    }
  }
}, { timestamps: true });

// Create index for faster searches
EmployeeSchema.index({ employeeId: 1 });
EmployeeSchema.index({ 'user': 1 });
EmployeeSchema.index({ 'department': 1 });
EmployeeSchema.index({ 'status': 1 });

module.exports = mongoose.model('Employee', EmployeeSchema);
