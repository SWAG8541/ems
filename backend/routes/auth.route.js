const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Register a new user
router.post('/register', AuthController.register);

// Login user
router.post('/login', AuthController.login);

// Get current user profile (protected route)
router.get('/profile', protect, AuthController.getProfile);

module.exports = router;