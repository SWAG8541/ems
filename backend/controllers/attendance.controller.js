const AttendanceService = require('../services/attendance.service');
const { emitAttendanceUpdate, emitNotification } = require('../utils/socketUtils');

// Create a new attendance record
exports.createAttendance = async (req, res) => {
  try {
    const attendance = await AttendanceService.createAttendance(req.body);
    res.status(201).json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Error creating attendance record', error: err.message });
  }
};

// Get all attendance records with optional filtering
exports.getAllAttendance = async (req, res) => {
  try {
    const attendance = await AttendanceService.getAllAttendance(req.query);
    res.status(200).json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching attendance records', error: err.message });
  }
};

// Get attendance record by ID
exports.getAttendanceById = async (req, res) => {
  try {
    const attendance = await AttendanceService.getAttendanceById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.status(200).json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching attendance record', error: err.message });
  }
};

// Update attendance record
exports.updateAttendance = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const attendance = await AttendanceService.updateAttendance(req.params.id, req.body, userId);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.status(200).json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Error updating attendance record', error: err.message });
  }
};

// Delete attendance record
exports.deleteAttendance = async (req, res) => {
  try {
    const result = await AttendanceService.deleteAttendance(req.params.id);

    if (!result) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.status(200).json({ message: 'Attendance record deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting attendance record', error: err.message });
  }
};

// Check in
exports.checkIn = async (req, res) => {
  try {
    // Use the current employee ID if not provided
    const employeeId = req.body.employeeId || (req.user ? req.user.employeeId : null);

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    const attendance = await AttendanceService.checkIn(employeeId, req.body);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      emitAttendanceUpdate(io, attendance);

      // Check if check-in is late
      const employee = await AttendanceService.getEmployeeById(employeeId);
      if (employee && employee.attendanceSettings) {
        const workStartTime = employee.attendanceSettings.workStartTime || '09:00';
        const [hours, minutes] = workStartTime.split(':').map(Number);
        const startTime = new Date();
        startTime.setHours(hours, minutes, 0, 0);

        const checkInTime = new Date(attendance.checkInTime);
        const lateThreshold = employee.attendanceSettings.lateThreshold || 15; // minutes

        if (checkInTime > new Date(startTime.getTime() + lateThreshold * 60000)) {
          // Create late check-in notification
          const notificationData = {
            recipient: employee.user,
            type: 'attendance_late',
            title: 'Late Check-in',
            message: `You checked in late today at ${checkInTime.toLocaleTimeString()}`,
            priority: 'normal',
            relatedModel: 'Attendance',
            relatedId: attendance._id
          };

          // Emit notification
          emitNotification(io, notificationData);
        }
      }
    }

    res.status(200).json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Error checking in', error: err.message });
  }
};

// Check out
exports.checkOut = async (req, res) => {
  try {
    // Use the current employee ID if not provided
    const employeeId = req.body.employeeId || (req.user ? req.user.employeeId : null);

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    const attendance = await AttendanceService.checkOut(employeeId, req.body);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      emitAttendanceUpdate(io, attendance);

      // Check if check-out is early
      const employee = await AttendanceService.getEmployeeById(employeeId);
      if (employee && employee.attendanceSettings) {
        const workEndTime = employee.attendanceSettings.workEndTime || '17:00';
        const [hours, minutes] = workEndTime.split(':').map(Number);
        const endTime = new Date();
        endTime.setHours(hours, minutes, 0, 0);

        const checkOutTime = new Date(attendance.checkOutTime);
        const earlyThreshold = employee.attendanceSettings.earlyDepartureThreshold || 15; // minutes

        if (checkOutTime < new Date(endTime.getTime() - earlyThreshold * 60000)) {
          // Create early departure notification
          const notificationData = {
            recipient: employee.user,
            type: 'attendance_early_departure',
            title: 'Early Departure',
            message: `You checked out early today at ${checkOutTime.toLocaleTimeString()}`,
            priority: 'normal',
            relatedModel: 'Attendance',
            relatedId: attendance._id
          };

          // Emit notification
          emitNotification(io, notificationData);
        }
      }
    }

    res.status(200).json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Error checking out', error: err.message });
  }
};

// Add break
exports.addBreak = async (req, res) => {
  try {
    const attendance = await AttendanceService.addBreak(req.params.id, req.body);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      emitAttendanceUpdate(io, attendance);
    }

    res.status(200).json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Error adding break', error: err.message });
  }
};

// End break
exports.endBreak = async (req, res) => {
  try {
    const attendance = await AttendanceService.endBreak(req.params.id, req.params.breakId);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      emitAttendanceUpdate(io, attendance);

      // Check if break was too long
      const breakIndex = attendance.breaks.findIndex(b => b._id.toString() === req.params.breakId);
      if (breakIndex !== -1) {
        const breakItem = attendance.breaks[breakIndex];
        if (breakItem.duration > 60) { // More than 60 minutes
          // Get employee
          const employee = await AttendanceService.getEmployeeById(attendance.employee);
          if (employee && employee.user) {
            // Create long break notification
            const notificationData = {
              recipient: employee.user,
              type: 'break_too_long',
              title: 'Long Break Detected',
              message: `Your ${breakItem.type} break was ${breakItem.duration} minutes long.`,
              priority: 'normal',
              relatedModel: 'Attendance',
              relatedId: attendance._id
            };

            // Emit notification
            emitNotification(io, notificationData);
          }
        }
      }
    }

    res.status(200).json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Error ending break', error: err.message });
  }
};

// Get attendance by employee
exports.getAttendanceByEmployee = async (req, res) => {
  try {
    const attendance = await AttendanceService.getAttendanceByEmployee(
      req.params.employeeId,
      req.query
    );
    res.status(200).json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching attendance by employee', error: err.message });
  }
};

// Get attendance statistics by employee
exports.getAttendanceStatisticsByEmployee = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const statistics = await AttendanceService.getAttendanceStatisticsByEmployee(
      req.params.employeeId,
      startDate,
      endDate
    );
    res.status(200).json(statistics);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching attendance statistics', error: err.message });
  }
};

// Bulk create attendance records (for admin)
exports.bulkCreateAttendance = async (req, res) => {
  try {
    if (!req.body || !Array.isArray(req.body)) {
      return res.status(400).json({ message: 'Invalid data format. Expected an array of attendance records.' });
    }

    const result = await AttendanceService.bulkCreateAttendance(req.body);
    res.status(200).json({
      message: 'Attendance records created successfully',
      count: result.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating attendance records', error: err.message });
  }
};
