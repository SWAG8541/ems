const mongoose = require('mongoose');

const PermissionSchema = new mongoose.Schema({
  feat: { type: String, required: true },         // e.g. 'task', 'project'
  label: { type: String, required: true },        // e.g. 'Task', 'Project'
  acts: [{ type: String, required: true }],       // e.g. ['read', 'create', 'update']
}, { timestamps: true });

module.exports = mongoose.model('Permission', PermissionSchema);
