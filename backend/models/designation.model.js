const mongoose = require('mongoose');

const DesignationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  level: {
    type: Number,
    default: 0
  },
  responsibilities: [String],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

// Create index for faster searches
DesignationSchema.index({ name: 1 });
DesignationSchema.index({ department: 1 });
DesignationSchema.index({ status: 1 });

module.exports = mongoose.model('Designation', DesignationSchema);
