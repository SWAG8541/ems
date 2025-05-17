const express = require('express');
const router = express.Router();
const RoleController = require('../controllers/role.controller');
const { protect } = require('../middleware/auth.middleware');
const { hasPermission, isAdmin } = require('../middleware/permission.middleware');

// Create a new role (admin only)
router.post('/', protect, isAdmin, RoleController.createRole);

// Update an existing role (admin only)
router.put('/:id', protect, isAdmin, RoleController.updateRole);

// Get all roles
router.get('/', protect, hasPermission('role', 'read'), RoleController.getAllRoles);

// Get a specific role by ID
router.get('/:id', protect, hasPermission('role', 'read'), RoleController.getRoleById);

// Delete a role (admin only)
router.delete('/:id', protect, isAdmin, RoleController.deleteRole);

module.exports = router;
