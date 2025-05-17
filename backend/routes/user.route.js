const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { hasPermission, isAdmin } = require('../middleware/permission.middleware');

// Create a new user (admin only)
router.post('/', protect, isAdmin, UserController.createUser);

// Get all users
router.get('/', protect, hasPermission('user', 'read'), UserController.getAllUsers);

// Get user by ID
router.get('/:id', protect, hasPermission('user', 'read'), UserController.getUserById);

// Update user (admin only)
router.put('/:id', protect, isAdmin, UserController.updateUser);

// Delete user (admin only)
router.delete('/:id', protect, isAdmin, UserController.deleteUser);

// Assign role to user (admin only)
router.post('/:id/role', protect, isAdmin, UserController.assignRole);

module.exports = router;
