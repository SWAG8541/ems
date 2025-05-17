const TimeEntryService = require('../services/timeEntry.service');

// Create a new time entry
exports.createTimeEntry = async (req, res) => {
  try {
    // Add the current employee ID if not provided
    if (!req.body.employee && req.user && req.user.employeeId) {
      req.body.employee = req.user.employeeId;
    }
    
    const timeEntry = await TimeEntryService.createTimeEntry(req.body);
    res.status(201).json(timeEntry);
  } catch (err) {
    res.status(500).json({ message: 'Error creating time entry', error: err.message });
  }
};

// Get all time entries with optional filtering
exports.getAllTimeEntries = async (req, res) => {
  try {
    const timeEntries = await TimeEntryService.getAllTimeEntries(req.query);
    res.status(200).json(timeEntries);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching time entries', error: err.message });
  }
};

// Get time entry by ID
exports.getTimeEntryById = async (req, res) => {
  try {
    const timeEntry = await TimeEntryService.getTimeEntryById(req.params.id);
    
    if (!timeEntry) {
      return res.status(404).json({ message: 'Time entry not found' });
    }
    
    res.status(200).json(timeEntry);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching time entry', error: err.message });
  }
};

// Update time entry
exports.updateTimeEntry = async (req, res) => {
  try {
    // Add the current user ID as modifier if not provided
    if (!req.body.modified && req.user) {
      req.body.modified = {
        isModified: true,
        modifiedBy: req.user.id,
        modifiedAt: new Date()
      };
    }
    
    const timeEntry = await TimeEntryService.updateTimeEntry(req.params.id, req.body);
    
    if (!timeEntry) {
      return res.status(404).json({ message: 'Time entry not found' });
    }
    
    res.status(200).json(timeEntry);
  } catch (err) {
    res.status(500).json({ message: 'Error updating time entry', error: err.message });
  }
};

// Delete time entry
exports.deleteTimeEntry = async (req, res) => {
  try {
    const result = await TimeEntryService.deleteTimeEntry(req.params.id);
    
    if (!result) {
      return res.status(404).json({ message: 'Time entry not found' });
    }
    
    res.status(200).json({ message: 'Time entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting time entry', error: err.message });
  }
};

// Approve time entry
exports.approveTimeEntry = async (req, res) => {
  try {
    // Use the current employee ID if not provided
    const approverId = req.body.approverId || (req.user ? req.user.employeeId : null);
    
    if (!approverId) {
      return res.status(400).json({ message: 'Approver ID is required' });
    }
    
    const timeEntry = await TimeEntryService.approveTimeEntry(req.params.id, approverId);
    res.status(200).json(timeEntry);
  } catch (err) {
    res.status(500).json({ message: 'Error approving time entry', error: err.message });
  }
};

// Reject time entry
exports.rejectTimeEntry = async (req, res) => {
  try {
    // Use the current employee ID if not provided
    const approverId = req.body.approverId || (req.user ? req.user.employeeId : null);
    
    if (!approverId) {
      return res.status(400).json({ message: 'Approver ID is required' });
    }
    
    if (!req.body.reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }
    
    const timeEntry = await TimeEntryService.rejectTimeEntry(
      req.params.id,
      approverId,
      req.body.reason
    );
    res.status(200).json(timeEntry);
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting time entry', error: err.message });
  }
};

// Get time entries by employee
exports.getTimeEntriesByEmployee = async (req, res) => {
  try {
    const timeEntries = await TimeEntryService.getTimeEntriesByEmployee(
      req.params.employeeId,
      req.query
    );
    res.status(200).json(timeEntries);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching time entries by employee', error: err.message });
  }
};

// Get time entries by date range
exports.getTimeEntriesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    const timeEntries = await TimeEntryService.getTimeEntriesByDateRange(
      startDate,
      endDate,
      req.query
    );
    res.status(200).json(timeEntries);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching time entries by date range', error: err.message });
  }
};

// Get time entry statistics
exports.getTimeEntryStatistics = async (req, res) => {
  try {
    const statistics = await TimeEntryService.getTimeEntryStatistics(req.query);
    res.status(200).json(statistics);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching time entry statistics', error: err.message });
  }
};
