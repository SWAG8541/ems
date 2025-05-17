const express = require('express');
const router = express.Router();
const TimeEntryController = require('../controllers/timeEntry.controller');
const { protect } = require('../middleware/auth.middleware');
const { hasPermission } = require('../middleware/permission.middleware');

// Create a new time entry
router.post('/', protect, hasPermission('time_entry', 'create'), TimeEntryController.createTimeEntry);

// Get all time entries
router.get('/', protect, hasPermission('time_entry', 'read'), TimeEntryController.getAllTimeEntries);

// Get time entry by ID
router.get('/:id', protect, hasPermission('time_entry', 'read'), TimeEntryController.getTimeEntryById);

// Update time entry
router.put('/:id', protect, hasPermission('time_entry', 'update'), TimeEntryController.updateTimeEntry);

// Delete time entry
router.delete('/:id', protect, hasPermission('time_entry', 'delete'), TimeEntryController.deleteTimeEntry);

// Approve time entry
router.post('/:id/approve', protect, hasPermission('time_entry', 'approve'), TimeEntryController.approveTimeEntry);

// Reject time entry
router.post('/:id/reject', protect, hasPermission('time_entry', 'approve'), TimeEntryController.rejectTimeEntry);

// Get time entries by employee
router.get('/employee/:employeeId', protect, hasPermission('time_entry', 'read'), TimeEntryController.getTimeEntriesByEmployee);

// Get time entries by date range
router.get('/date-range', protect, hasPermission('time_entry', 'read'), TimeEntryController.getTimeEntriesByDateRange);

// Get time entry statistics
router.get('/statistics', protect, hasPermission('time_entry', 'report'), TimeEntryController.getTimeEntryStatistics);

module.exports = router;
