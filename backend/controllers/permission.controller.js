const PermissionService = require('../services/permission.service');
const masterPermissions = require('../utils/permissions');

// Seed permissions from utils into DB
exports.seedPermissions = async (req, res) => {
  try {
    const result = await PermissionService.seedPermissions(masterPermissions);
    res.status(201).json({ message: 'Permissions seeded successfully', result });
  } catch (err) {
    res.status(500).json({ message: 'Error seeding permissions', error: err.message });
  }
};

// Get all permissions from DB
exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await PermissionService.getAllPermissions();
    res.status(200).json(permissions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching permissions', error: err.message });
  }
};
