const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

// Get dashboard statistics
router.get('/stats', protect, DashboardController.getDashboardStats);

module.exports = router;
