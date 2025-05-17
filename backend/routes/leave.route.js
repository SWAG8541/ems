const express = require('express');
const router = express.Router();
const LeaveController = require('../controllers/leave.controller');
const { protect } = require('../middleware/auth.middleware');
const { hasPermission } = require('../middleware/permission.middleware');

// Create a new leave request
router.post('/', protect, hasPermission('leave', 'create'), LeaveController.createLeave);

// Get all leave requests
router.get('/', protect, hasPermission('leave', 'read'), LeaveController.getAllLeaves);

// Get leave request by ID
router.get('/:id', protect, hasPermission('leave', 'read'), LeaveController.getLeaveById);

// Update leave request
router.put('/:id', protect, hasPermission('leave', 'update'), LeaveController.updateLeave);

// Delete leave request
router.delete('/:id', protect, hasPermission('leave', 'delete'), LeaveController.deleteLeave);

// Approve leave request
router.post('/:id/approve', protect, hasPermission('leave', 'approve'), LeaveController.approveLeave);

// Reject leave request
router.post('/:id/reject', protect, hasPermission('leave', 'reject'), LeaveController.rejectLeave);

// Cancel leave request
router.post('/:id/cancel', protect, LeaveController.cancelLeave);

// Add comment to leave request
router.post('/:id/comments', protect, hasPermission('leave', 'read'), LeaveController.addComment);

// Get leave requests by employee
router.get('/employee/:employeeId', protect, hasPermission('leave', 'read'), LeaveController.getLeavesByEmployee);

// Get leave statistics by employee
router.get('/employee/:employeeId/statistics', protect, hasPermission('leave', 'read'), LeaveController.getLeaveStatisticsByEmployee);

// Get pending leave requests for approval
router.get('/pending-approval/:managerId', protect, hasPermission('leave', 'approve'), LeaveController.getPendingLeavesForApproval);

module.exports = router;
