const TimeTrackingService = require('../services/timeTracking.service');
const EmployeeService = require('../services/employee.service');
const Attendance = require('../models/attendance.model');

// Clock in
exports.clockIn = async (req, res) => {
  try {
    console.log('Clock in request received:', req.body);

    // Get employee ID from user or request body
    let employeeId;

    if (req.user && req.user.employeeId) {
      employeeId = req.user.employeeId;
      console.log('Using employee ID from req.user:', employeeId);
    } else if (req.body.employeeId) {
      employeeId = req.body.employeeId;
      console.log('Using employee ID from req.body:', employeeId);
    } else {
      // Try to find employee by user ID
      console.log('Trying to find employee by user ID:', req.user?.id);
      const employee = await EmployeeService.getEmployeeByUserId(req.user.id);
      if (employee) {
        employeeId = employee._id;
        console.log('Found employee ID:', employeeId);
      } else {
        console.error('Employee ID not found');
        return res.status(400).json({ message: 'Employee ID is required' });
      }
    }

    // Validate required fields
    if (!req.body.dailyGoal) {
      console.error('Daily goal is missing');
      return res.status(400).json({ message: 'Daily goal is required for clock in' });
    }

    // Prepare clock in data
    const clockInData = {
      location: req.body.location || {},
      ipAddress: req.body.ipAddress || req.ip,
      device: req.body.device || req.headers['user-agent'],
      dailyGoal: req.body.dailyGoal,
      lateReason: req.body.lateReason
    };

    console.log('Calling TimeTrackingService.clockIn with:', { employeeId, clockInData });
    const result = await TimeTrackingService.clockIn(employeeId, clockInData);
    console.log('Clock in successful:', result);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      const { emitAttendanceUpdate } = require('../utils/socketUtils');

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
    console.error('Clock in error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Clock out
exports.clockOut = async (req, res) => {
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

    // Validate required fields
    if (!req.body.statusReport) {
      return res.status(400).json({ message: 'Status report is required for clock out' });
    }

    // Prepare clock out data
    const clockOutData = {
      location: req.body.location || {},
      ipAddress: req.body.ipAddress || req.ip,
      device: req.body.device || req.headers['user-agent'],
      statusReport: req.body.statusReport,
      earlyReason: req.body.earlyReason
    };

    const result = await TimeTrackingService.clockOut(employeeId, clockOutData);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      const { emitAttendanceUpdate } = require('../utils/socketUtils');

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

// Get clock status
exports.getClockStatus = async (req, res) => {
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

    const result = await TimeTrackingService.getClockStatus(employeeId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error getting clock status', error: err.message });
  }
};

// Get attendance summary
exports.getAttendanceSummary = async (req, res) => {
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

    const { startDate, endDate } = req.query;
    const result = await TimeTrackingService.getAttendanceSummary(employeeId, startDate, endDate);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error getting attendance summary', error: err.message });
  }
};

// Add time entry
exports.addTimeEntry = async (req, res) => {
  try {
    // Get employee ID from user or request body
    let employeeId;

    if (req.body.employee) {
      employeeId = req.body.employee;
    } else if (req.user && req.user.employeeId) {
      employeeId = req.user.employeeId;
      req.body.employee = employeeId;
    } else {
      // Try to find employee by user ID
      const employee = await EmployeeService.getEmployeeByUserId(req.user.id);
      if (employee) {
        employeeId = employee._id;
        req.body.employee = employeeId;
      } else {
        return res.status(400).json({ message: 'Employee ID is required' });
      }
    }

    // Set date to today if not provided
    if (!req.body.date) {
      req.body.date = new Date();
    }

    const result = await TimeTrackingService.addTimeEntry(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: 'Error adding time entry', error: err.message });
  }
};

// Get time entries
exports.getTimeEntries = async (req, res) => {
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

    const result = await TimeTrackingService.getTimeEntries(employeeId, req.query);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error getting time entries', error: err.message });
  }
};

// Get time entry statistics
exports.getTimeEntryStatistics = async (req, res) => {
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

    const { startDate, endDate } = req.query;
    const result = await TimeTrackingService.getTimeEntryStatistics(employeeId, startDate, endDate);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error getting time entry statistics', error: err.message });
  }
};
