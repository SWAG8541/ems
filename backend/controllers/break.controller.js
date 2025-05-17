const BreakService = require('../services/break.service');
const EmployeeService = require('../services/employee.service');
const Attendance = require('../models/attendance.model');
const { emitAttendanceUpdate } = require('../utils/socketUtils');

// Start a break
exports.startBreak = async (req, res) => {
  try {
    // Get employee ID from user or request body
    let employeeId;

    if (req.user && req.user.employeeId) {
      employeeId = req.user.employeeId;
    } else if (req.body.employeeId) {
      employeeId = req.body.employeeId;
    } else {
      // Try to find employee by user ID
      const employee = await EmployeeService.getEmployeeByUserId(req.user.id);
      if (employee) {
        employeeId = employee._id;
      } else {
        return res.status(400).json({ message: 'Employee ID is required' });
      }
    }

    // Validate break type
    if (!req.body.type) {
      return res.status(400).json({ message: 'Break type is required' });
    }

    // If type is 'other', description is required
    if (req.body.type === 'other' && !req.body.description) {
      return res.status(400).json({ message: 'Description is required for break type "other"' });
    }

    // Prepare break data
    const breakData = {
      type: req.body.type,
      description: req.body.description
    };

    const result = await BreakService.startBreak(employeeId, breakData);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      // Get the full attendance record to emit
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const attendance = await Attendance.findOne({
        employee: employeeId,
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }).populate('employee', 'name email');

      if (attendance) {
        emitAttendanceUpdate(io, attendance);
      }
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// End a break
exports.endBreak = async (req, res) => {
  try {
    // Get employee ID from user or request body
    let employeeId;

    if (req.user && req.user.employeeId) {
      employeeId = req.user.employeeId;
    } else if (req.body.employeeId) {
      employeeId = req.body.employeeId;
    } else {
      // Try to find employee by user ID
      const employee = await EmployeeService.getEmployeeByUserId(req.user.id);
      if (employee) {
        employeeId = employee._id;
      } else {
        return res.status(400).json({ message: 'Employee ID is required' });
      }
    }

    const result = await BreakService.endBreak(employeeId);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      // Get the full attendance record to emit
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const attendance = await Attendance.findOne({
        employee: employeeId,
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }).populate('employee', 'name email');

      if (attendance) {
        emitAttendanceUpdate(io, attendance);
      }
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get break status
exports.getBreakStatus = async (req, res) => {
  try {
    // Get employee ID from user or request params
    let employeeId;

    if (req.params.employeeId) {
      employeeId = req.params.employeeId;
    } else if (req.user && req.user.employeeId) {
      employeeId = req.user.employeeId;
    } else {
      // Try to find employee by user ID
      const employee = await EmployeeService.getEmployeeByUserId(req.user.id);
      if (employee) {
        employeeId = employee._id;
      } else {
        return res.status(400).json({ message: 'Employee ID is required' });
      }
    }

    const result = await BreakService.getBreakStatus(employeeId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error getting break status', error: err.message });
  }
};

// Get all breaks for an employee on a specific date
exports.getBreaks = async (req, res) => {
  try {
    // Get employee ID from user or request params
    let employeeId;

    if (req.params.employeeId) {
      employeeId = req.params.employeeId;
    } else if (req.user && req.user.employeeId) {
      employeeId = req.user.employeeId;
    } else {
      // Try to find employee by user ID
      const employee = await EmployeeService.getEmployeeByUserId(req.user.id);
      if (employee) {
        employeeId = employee._id;
      } else {
        return res.status(400).json({ message: 'Employee ID is required' });
      }
    }

    // Get date from query params or use today
    let date = req.query.date ? new Date(req.query.date) : new Date();

    const result = await BreakService.getBreaks(employeeId, date);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error getting breaks', error: err.message });
  }
};
