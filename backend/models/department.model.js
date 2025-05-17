const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  parentDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  budget: {
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    fiscalYear: Number
  },
  location: {
    building: String,
    floor: String,
    room: String,
    address: String,
    city: String,
    country: String
  }
}, { timestamps: true });

// Create index for faster searches
DepartmentSchema.index({ name: 1 });
DepartmentSchema.index({ status: 1 });
DepartmentSchema.index({ parentDepartment: 1 });

module.exports = mongoose.model('Department', DepartmentSchema);
