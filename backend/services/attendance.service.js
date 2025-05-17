const Attendance = require('../models/attendance.model');
const Employee = require('../models/employee.model');

// Create a new attendance record
exports.createAttendance = async (attendanceData) => {
  // Check if attendance record already exists for this employee and date
  const existingAttendance = await Attendance.findOne({
    employee: attendanceData.employee,
    date: new Date(attendanceData.date).setHours(0, 0, 0, 0)
  });

  if (existingAttendance) {
    throw new Error('Attendance record already exists for this employee and date');
  }

  // Set date to start of day
  attendanceData.date = new Date(attendanceData.date).setHours(0, 0, 0, 0);

  // If check-in time is provided, set it
  if (attendanceData.checkIn && attendanceData.checkIn.time) {
    attendanceData.checkIn.time = new Date(attendanceData.checkIn.time);
  }

  // If check-out time is provided, set it and calculate work hours
  if (attendanceData.checkOut && attendanceData.checkOut.time) {
    attendanceData.checkOut.time = new Date(attendanceData.checkOut.time);

    // Calculate work hours if check-in is also provided
    if (attendanceData.checkIn && attendanceData.checkIn.time) {
      const checkInTime = new Date(attendanceData.checkIn.time);
      const checkOutTime = new Date(attendanceData.checkOut.time);

      // Calculate work hours (in hours)
      attendanceData.workHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);

      // Calculate overtime if applicable
      const employee = await Employee.findById(attendanceData.employee);
      if (employee) {
        const standardHours = employee.employmentDetails?.workHoursPerWeek / 5 || 8; // Default to 8 hours
        if (attendanceData.workHours > standardHours) {
          attendanceData.overtime = attendanceData.workHours - standardHours;
        }
      }
    }
  }

  const attendance = new Attendance(attendanceData);
  return await attendance.save();
};

// Get all attendance records with optional filtering
exports.getAllAttendance = async (filters = {}) => {
  const query = {};

  // Apply filters if provided
  if (filters.employee) query.employee = filters.employee;
  if (filters.status) query.status = filters.status;
  if (filters.startDate && filters.endDate) {
    query.date = {
      $gte: new Date(filters.startDate).setHours(0, 0, 0, 0),
      $lte: new Date(filters.endDate).setHours(0, 0, 0, 0)
    };
  } else if (filters.date) {
    query.date = new Date(filters.date).setHours(0, 0, 0, 0);
  }

  return await Attendance.find(query)
    .populate('employee', 'employeeId')
    .populate({
      path: 'employee',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('approvedBy', 'employeeId')
    .populate({
      path: 'approvedBy',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .sort({ date: -1 });
};

// Get attendance record by ID
exports.getAttendanceById = async (attendanceId) => {
  return await Attendance.findById(attendanceId)
    .populate('employee', 'employeeId')
    .populate({
      path: 'employee',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('approvedBy', 'employeeId')
    .populate({
      path: 'approvedBy',
      populate: {
        path: 'user',
        select: 'name email'
      }
    });
};

// Update attendance record
exports.updateAttendance = async (attendanceId, attendanceData, userId) => {
  const attendance = await Attendance.findById(attendanceId);

  if (!attendance) {
    throw new Error('Attendance record not found');
  }

  // Mark as modified
  attendanceData.modified = {
    isModified: true,
    modifiedBy: userId,
    modifiedAt: new Date()
  };

  // If check-in time is updated, set it
  if (attendanceData.checkIn && attendanceData.checkIn.time) {
    attendanceData.checkIn.time = new Date(attendanceData.checkIn.time);
  }

  // If check-out time is updated, set it and recalculate work hours
  if (attendanceData.checkOut && attendanceData.checkOut.time) {
    attendanceData.checkOut.time = new Date(attendanceData.checkOut.time);

    // Recalculate work hours if check-in is available
    const checkInTime = attendanceData.checkIn?.time || attendance.checkIn?.time;
    if (checkInTime) {
      const checkOutTime = new Date(attendanceData.checkOut.time);

      // Calculate work hours (in hours)
      attendanceData.workHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);

      // Recalculate overtime if applicable
      const employee = await Employee.findById(attendance.employee);
      if (employee) {
        const standardHours = employee.employmentDetails?.workHoursPerWeek / 5 || 8; // Default to 8 hours
        if (attendanceData.workHours > standardHours) {
          attendanceData.overtime = attendanceData.workHours - standardHours;
        } else {
          attendanceData.overtime = 0;
        }
      }
    }
  }

  return await Attendance.findByIdAndUpdate(
    attendanceId,
    attendanceData,
    { new: true, runValidators: true }
  )
    .populate('employee', 'employeeId')
    .populate({
      path: 'employee',
      populate: {
        path: 'user',
        select: 'name email'
      }
    });
};

// Delete attendance record
exports.deleteAttendance = async (attendanceId) => {
  return await Attendance.findByIdAndDelete(attendanceId);
};

// Check in
exports.checkIn = async (employeeId, checkInData) => {
  // Get today's date (start of day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if attendance record already exists for today
  let attendance = await Attendance.findOne({
    employee: employeeId,
    date: today
  });

  if (!attendance) {
    // Create new attendance record
    attendance = new Attendance({
      employee: employeeId,
      date: today,
      status: 'present',
      checkIn: {
        time: new Date(),
        ...checkInData
      }
    });
  } else if (attendance.checkIn && attendance.checkIn.time) {
    throw new Error('Employee has already checked in today');
  } else {
    // Update existing attendance record with check-in
    attendance.checkIn = {
      time: new Date(),
      ...checkInData
    };

    // Update status if it was 'absent'
    if (attendance.status === 'absent') {
      attendance.status = 'present';
    }
  }

  return await attendance.save();
};

// Check out
exports.checkOut = async (employeeId, checkOutData) => {
  // Get today's date (start of day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find today's attendance record
  const attendance = await Attendance.findOne({
    employee: employeeId,
    date: today
  });

  if (!attendance) {
    throw new Error('No attendance record found for today');
  }

  if (!attendance.checkIn || !attendance.checkIn.time) {
    throw new Error('Cannot check out without checking in first');
  }

  if (attendance.checkOut && attendance.checkOut.time) {
    throw new Error('Employee has already checked out today');
  }

  // Update with check-out data
  attendance.checkOut = {
    time: new Date(),
    ...checkOutData
  };

  // Calculate work hours
  const checkInTime = new Date(attendance.checkIn.time);
  const checkOutTime = new Date(attendance.checkOut.time);

  // Calculate work hours (in hours)
  attendance.workHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);

  // Calculate overtime if applicable
  const employee = await Employee.findById(employeeId);
  if (employee) {
    const standardHours = employee.employmentDetails?.workHoursPerWeek / 5 || 8; // Default to 8 hours
    if (attendance.workHours > standardHours) {
      attendance.overtime = attendance.workHours - standardHours;
    }
  }

  return await attendance.save();
};

// Add break
exports.addBreak = async (attendanceId, breakData) => {
  const attendance = await Attendance.findById(attendanceId);

  if (!attendance) {
    throw new Error('Attendance record not found');
  }

  if (!attendance.checkIn || !attendance.checkIn.time) {
    throw new Error('Cannot add break without checking in first');
  }

  // Validate break times
  const startTime = new Date(breakData.startTime);
  const endTime = breakData.endTime ? new Date(breakData.endTime) : null;

  if (endTime && startTime >= endTime) {
    throw new Error('Break end time must be after start time');
  }

  // Calculate duration if end time is provided
  let duration = null;
  if (endTime) {
    duration = (endTime - startTime) / (1000 * 60); // Duration in minutes
  }

  // Add break to attendance
  attendance.breaks.push({
    startTime,
    endTime,
    duration
  });

  // Recalculate work hours if check-out is done
  if (attendance.checkOut && attendance.checkOut.time) {
    const checkInTime = new Date(attendance.checkIn.time);
    const checkOutTime = new Date(attendance.checkOut.time);

    // Calculate total break time in hours
    const totalBreakMinutes = attendance.breaks.reduce((total, breakItem) => {
      return total + (breakItem.duration || 0);
    }, 0);

    // Calculate work hours (in hours) excluding breaks
    attendance.workHours = (checkOutTime - checkInTime) / (1000 * 60 * 60) - (totalBreakMinutes / 60);

    // Recalculate overtime if applicable
    const employee = await Employee.findById(attendance.employee);
    if (employee) {
      const standardHours = employee.employmentDetails?.workHoursPerWeek / 5 || 8; // Default to 8 hours
      if (attendance.workHours > standardHours) {
        attendance.overtime = attendance.workHours - standardHours;
      } else {
        attendance.overtime = 0;
      }
    }
  }

  return await attendance.save();
};

// End break
exports.endBreak = async (attendanceId, breakId) => {
  const attendance = await Attendance.findById(attendanceId);

  if (!attendance) {
    throw new Error('Attendance record not found');
  }

  // Find the break
  const breakIndex = attendance.breaks.findIndex(
    breakItem => breakItem._id.toString() === breakId
  );

  if (breakIndex === -1) {
    throw new Error('Break not found');
  }

  const breakItem = attendance.breaks[breakIndex];

  if (breakItem.endTime) {
    throw new Error('Break has already ended');
  }

  // Update break end time and duration
  breakItem.endTime = new Date();
  breakItem.duration = (breakItem.endTime - breakItem.startTime) / (1000 * 60); // Duration in minutes

  attendance.breaks[breakIndex] = breakItem;

  // Recalculate work hours if check-out is done
  if (attendance.checkOut && attendance.checkOut.time) {
    const checkInTime = new Date(attendance.checkIn.time);
    const checkOutTime = new Date(attendance.checkOut.time);

    // Calculate total break time in hours
    const totalBreakMinutes = attendance.breaks.reduce((total, breakItem) => {
      return total + (breakItem.duration || 0);
    }, 0);

    // Calculate work hours (in hours) excluding breaks
    attendance.workHours = (checkOutTime - checkInTime) / (1000 * 60 * 60) - (totalBreakMinutes / 60);

    // Recalculate overtime if applicable
    const employee = await Employee.findById(attendance.employee);
    if (employee) {
      const standardHours = employee.employmentDetails?.workHoursPerWeek / 5 || 8; // Default to 8 hours
      if (attendance.workHours > standardHours) {
        attendance.overtime = attendance.workHours - standardHours;
      } else {
        attendance.overtime = 0;
      }
    }
  }

  return await attendance.save();
};

// Get attendance by employee
exports.getAttendanceByEmployee = async (employeeId, filters = {}) => {
  const query = { employee: employeeId };

  // Apply filters if provided
  if (filters.status) query.status = filters.status;
  if (filters.startDate && filters.endDate) {
    query.date = {
      $gte: new Date(filters.startDate).setHours(0, 0, 0, 0),
      $lte: new Date(filters.endDate).setHours(0, 0, 0, 0)
    };
  } else if (filters.date) {
    query.date = new Date(filters.date).setHours(0, 0, 0, 0);
  }

  return await Attendance.find(query).sort({ date: -1 });
};

// Get attendance statistics by employee
exports.getAttendanceStatisticsByEmployee = async (employeeId, startDate, endDate) => {
  // Set default date range to current month if not provided
  if (!startDate || !endDate) {
    const now = new Date();
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else {
    startDate = new Date(startDate);
    endDate = new Date(endDate);
  }

  // Get all attendance records for the employee in the date range
  const attendanceRecords = await Attendance.find({
    employee: employeeId,
    date: {
      $gte: startDate.setHours(0, 0, 0, 0),
      $lte: endDate.setHours(0, 0, 0, 0)
    }
  });

  // Calculate statistics
  const statistics = {
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    leave: 0,
    totalWorkHours: 0,
    totalOvertime: 0,
    averageWorkHours: 0,
    attendancePercentage: 0
  };

  attendanceRecords.forEach(record => {
    // Count by status
    switch (record.status) {
      case 'present':
        statistics.present++;
        break;
      case 'absent':
        statistics.absent++;
        break;
      case 'late':
        statistics.late++;
        break;
      case 'half_day':
        statistics.halfDay++;
        break;
      case 'leave':
        statistics.leave++;
        break;
    }

    // Add work hours and overtime
    statistics.totalWorkHours += record.workHours || 0;
    statistics.totalOvertime += record.overtime || 0;
  });

  // Calculate average work hours
  const workingDays = statistics.present + statistics.late + statistics.halfDay;
  if (workingDays > 0) {
    statistics.averageWorkHours = statistics.totalWorkHours / workingDays;
  }

  // Calculate attendance percentage
  const totalWorkingDays = attendanceRecords.length;
  if (totalWorkingDays > 0) {
    statistics.attendancePercentage = ((statistics.present + statistics.late + statistics.halfDay) / totalWorkingDays) * 100;
  }

  return {
    startDate,
    endDate,
    ...statistics
  };
};

// Get employee by ID
exports.getEmployeeById = async (employeeId) => {
  return await Employee.findById(employeeId).populate('user', 'name email');
};

// Bulk create attendance records (for admin)
exports.bulkCreateAttendance = async (attendanceData) => {
  // Validate data
  if (!Array.isArray(attendanceData)) {
    throw new Error('Attendance data must be an array');
  }

  // Process each record
  const processedData = attendanceData.map(record => {
    // Set date to start of day
    record.date = new Date(record.date).setHours(0, 0, 0, 0);

    // Set check-in and check-out times if provided
    if (record.checkIn && record.checkIn.time) {
      record.checkIn.time = new Date(record.checkIn.time);
    }

    if (record.checkOut && record.checkOut.time) {
      record.checkOut.time = new Date(record.checkOut.time);
    }

    // Calculate work hours if both check-in and check-out are provided
    if (record.checkIn?.time && record.checkOut?.time) {
      const checkInTime = new Date(record.checkIn.time);
      const checkOutTime = new Date(record.checkOut.time);

      // Calculate work hours (in hours)
      record.workHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
    }

    return record;
  });

  // Insert records with ordered: false to continue on error
  return await Attendance.insertMany(processedData, { ordered: false });
};
