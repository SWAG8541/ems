const express = require('express');
const router = express.Router();
const PermissionController = require('../controllers/permission.controller');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/permission.middleware');

// Seed master permissions (admin only)
router.post('/seed', protect, isAdmin, PermissionController.seedPermissions);

// Get all permissions (admin only)
router.get('/', protect, isAdmin, PermissionController.getAllPermissions);

module.exports = router;
