const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },  // e.g. 'admin', 'hr'
  permissions: [
    {
      feat: { type: String, required: true },
      acts: [{ type: String, required: true }]
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Role', RoleSchema);
