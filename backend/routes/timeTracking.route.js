const express = require('express');
const router = express.Router();
const TimeTrackingController = require('../controllers/timeTracking.controller');
const { protect } = require('../middleware/auth.middleware');
const { hasPermission } = require('../middleware/permission.middleware');

// Clock in/out routes
router.post('/clock-in', protect, TimeTrackingController.clockIn);
router.post('/clock-out', protect, TimeTrackingController.clockOut);
router.get('/clock-status', protect, TimeTrackingController.getClockStatus);
router.get('/clock-status/:employeeId', protect, hasPermission('attendance', 'read'), TimeTrackingController.getClockStatus);

// Debug route to check user and employee ID
router.get('/debug-user', protect, (req, res) => {
  res.status(200).json({
    user: req.user,
    message: 'This is your user information from the auth middleware'
  });
});

// Attendance summary
router.get('/attendance-summary', protect, TimeTrackingController.getAttendanceSummary);
router.get('/attendance-summary/:employeeId', protect, hasPermission('attendance', 'read'), TimeTrackingController.getAttendanceSummary);

// Time entries
router.post('/time-entries', protect, hasPermission('time_entry', 'create'), TimeTrackingController.addTimeEntry);
router.get('/time-entries', protect, TimeTrackingController.getTimeEntries);
router.get('/time-entries/:employeeId', protect, hasPermission('time_entry', 'read'), TimeTrackingController.getTimeEntries);

// Time entry statistics
router.get('/time-statistics', protect, TimeTrackingController.getTimeEntryStatistics);
router.get('/time-statistics/:employeeId', protect, hasPermission('time_entry', 'read'), TimeTrackingController.getTimeEntryStatistics);

module.exports = router;
