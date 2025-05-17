const express = require('express');
const router = express.Router();
const BreakController = require('../controllers/break.controller');
const { protect } = require('../middleware/auth.middleware');
const { hasPermission } = require('../middleware/permission.middleware');

// Break management routes
router.post('/start', protect, BreakController.startBreak);
router.post('/end', protect, BreakController.endBreak);
router.get('/status', protect, BreakController.getBreakStatus);
router.get('/status/:employeeId', protect, hasPermission('attendance', 'read'), BreakController.getBreakStatus);
router.get('/list', protect, BreakController.getBreaks);
router.get('/list/:employeeId', protect, hasPermission('attendance', 'read'), BreakController.getBreaks);

module.exports = router;
