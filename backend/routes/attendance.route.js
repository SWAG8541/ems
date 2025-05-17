const express = require('express');
const router = express.Router();
const AttendanceController = require('../controllers/attendance.controller');
const { protect } = require('../middleware/auth.middleware');
const { hasPermission } = require('../middleware/permission.middleware');

// Create a new attendance record
router.post('/', protect, hasPermission('attendance', 'create'), AttendanceController.createAttendance);

// Get all attendance records
router.get('/', protect, hasPermission('attendance', 'read'), AttendanceController.getAllAttendance);

// Get attendance record by ID
router.get('/:id', protect, hasPermission('attendance', 'read'), AttendanceController.getAttendanceById);

// Update attendance record
router.put('/:id', protect, hasPermission('attendance', 'update'), AttendanceController.updateAttendance);

// Delete attendance record
router.delete('/:id', protect, hasPermission('attendance', 'delete'), AttendanceController.deleteAttendance);

// Check in
router.post('/check-in', protect, AttendanceController.checkIn);

// Check out
router.post('/check-out', protect, AttendanceController.checkOut);

// Add break
router.post('/:id/breaks', protect, AttendanceController.addBreak);

// End break
router.put('/:id/breaks/:breakId/end', protect, AttendanceController.endBreak);

// Get attendance by employee
router.get('/employee/:employeeId', protect, hasPermission('attendance', 'read'), AttendanceController.getAttendanceByEmployee);

// Get attendance statistics by employee
router.get('/employee/:employeeId/statistics', protect, hasPermission('attendance', 'read'), AttendanceController.getAttendanceStatisticsByEmployee);

// Bulk create attendance records (for admin)
router.post('/bulk', protect, hasPermission('attendance', 'create'), AttendanceController.bulkCreateAttendance);

module.exports = router;
