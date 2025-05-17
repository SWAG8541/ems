const Employee = require('../models/employee.model');
const Attendance = require('../models/attendance.model');
const TimeEntry = require('../models/timeEntry.model');

// Clock in for an employee
exports.clockIn = async (employeeId, clockInData) => {
  // Validate required fields
  if (!clockInData.dailyGoal) {
    throw new Error('Daily goal is required for clock in');
  }

  // Get today's date (start of day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if attendance record already exists for today
  let attendance = await Attendance.findOne({
    employee: employeeId,
    date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
    }
  });

  if (attendance && attendance.clockInTime) {
    throw new Error('You have already clocked in today');
  }

  // Get current time
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();

  // Check if employee is late (after 10:15 AM)
  const isLate = (currentHour > 10 || (currentHour === 10 && currentMinutes >= 15));

  // If employee is late, require a reason
  if (isLate && !clockInData.lateReason) {
    throw new Error('You are late. Please provide a reason for late clock in.');
  }

  // Create or update attendance record
  if (!attendance) {
    attendance = new Attendance({
      employee: employeeId,
      date: today,
      clockInTime: now,
      status: isLate ? 'late' : 'present',
      isLate: isLate,
      lateReason: isLate ? clockInData.lateReason : undefined,
      goals: clockInData.dailyGoal,
      location: {
        clockIn: clockInData.location || {}
      },
      device: {
        clockIn: clockInData.device || ''
      },
      ipAddress: {
        clockIn: clockInData.ipAddress || ''
      }
    });
  } else {
    attendance.status = isLate ? 'late' : 'present';
    attendance.clockInTime = now;
    attendance.isLate = isLate;
    attendance.lateReason = isLate ? clockInData.lateReason : undefined;
    attendance.goals = clockInData.dailyGoal;
    attendance.location = attendance.location || {};
    attendance.location.clockIn = clockInData.location || {};
    attendance.device = attendance.device || {};
    attendance.device.clockIn = clockInData.device || '';
    attendance.ipAddress = attendance.ipAddress || {};
    attendance.ipAddress.clockIn = clockInData.ipAddress || '';
  }

  // Save attendance record
  await attendance.save();

  // Return formatted response
  return {
    message: 'Clock in successful',
    time: attendance.clockInTime,
    isLate: attendance.isLate,
    status: attendance.status,
    dailyGoal: attendance.goals
  };
};

// Clock out for an employee
exports.clockOut = async (employeeId, clockOutData) => {
  // Validate required fields
  if (!clockOutData.statusReport) {
    throw new Error('Status report is required for clock out');
  }

  // Get today's date (start of day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find today's attendance record
  const attendance = await Attendance.findOne({
    employee: employeeId,
    date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
    }
  });

  if (!attendance) {
    throw new Error('No attendance record found for today. Please clock in first.');
  }

  if (!attendance.clockInTime) {
    throw new Error('Cannot clock out without clocking in first');
  }

  if (attendance.clockOutTime) {
    throw new Error('You have already clocked out today');
  }

  // Get current time
  const now = new Date();

  // Get employee to check standard hours
  const employee = await Employee.findById(employeeId);
  const standardHours = employee?.employmentDetails?.workHoursPerWeek / 5 || 8; // Default to 8 hours

  // Calculate current work hours
  const clockInTime = new Date(attendance.clockInTime);
  const workHoursInMilliseconds = now - clockInTime;
  const workHours = workHoursInMilliseconds / (1000 * 60 * 60);

  // Check if employee is leaving early (before completing standard hours)
  const isEarly = workHours < standardHours;

  // If employee is leaving early, require a reason
  if (isEarly && !clockOutData.earlyReason) {
    throw new Error('You are leaving early. Please provide a reason for early clock out.');
  }

  // Update with clock-out data
  attendance.clockOutTime = now;
  attendance.isEarlyDeparture = isEarly;
  attendance.earlyDepartureReason = isEarly ? clockOutData.earlyReason : undefined;
  attendance.accomplishments = clockOutData.statusReport;

  // Update location, device, and IP address
  attendance.location = attendance.location || {};
  attendance.location.clockOut = clockOutData.location || {};
  attendance.device = attendance.device || {};
  attendance.device.clockOut = clockOutData.device || '';
  attendance.ipAddress = attendance.ipAddress || {};
  attendance.ipAddress.clockOut = clockOutData.ipAddress || '';

  // Calculate total work duration (in minutes)
  let totalWorkDuration = Math.floor(workHoursInMilliseconds / (1000 * 60)); // Convert to minutes

  // Subtract break time if there are breaks
  if (attendance.breaks && attendance.breaks.length > 0) {
    const totalBreakMinutes = attendance.breaks.reduce((total, breakItem) => {
      if (breakItem.startTime && breakItem.endTime) {
        return total + (breakItem.duration || 0);
      }
      return total;
    }, 0);
    totalWorkDuration -= totalBreakMinutes;
  }

  attendance.totalWorkDuration = totalWorkDuration;

  // Save attendance record
  await attendance.save();

  // Return formatted response
  return {
    message: 'Clock out successful',
    time: attendance.clockOutTime,
    totalWorkDuration: attendance.totalWorkDuration,
    isEarly: attendance.isEarlyDeparture,
    status: attendance.status,
    statusReport: attendance.accomplishments
  };
};

// Get current clock status for an employee
exports.getClockStatus = async (employeeId) => {
  // Get today's date (start of day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find today's attendance record
  const attendance = await Attendance.findOne({
    employee: employeeId,
    date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
    }
  });

  if (!attendance || !attendance.clockInTime) {
    return {
      status: 'not_clocked_in',
      message: 'Not clocked in today'
    };
  }

  if (attendance.clockOutTime) {
    return {
      status: 'clocked_out',
      message: 'Clocked out',
      clockInTime: attendance.clockInTime,
      clockOutTime: attendance.clockOutTime,
      totalWorkDuration: attendance.totalWorkDuration || 0,
      dailyGoal: attendance.goals,
      statusReport: attendance.accomplishments,
      isLate: attendance.isLate || false,
      lateReason: attendance.lateReason,
      isEarly: attendance.isEarlyDeparture || false,
      earlyReason: attendance.earlyDepartureReason,
      onBreak: attendance.onBreak || false,
      breaks: attendance.breaks || []
    };
  }

  // Calculate current duration
  const clockInTime = new Date(attendance.clockInTime);
  const currentTime = new Date();
  const currentDurationMs = currentTime - clockInTime;
  const currentDuration = currentDurationMs / (1000 * 60 * 60); // in hours

  // Calculate current duration in minutes, accounting for breaks
  let currentDurationMinutes = Math.floor(currentDurationMs / (1000 * 60));

  // Subtract break time if there are breaks
  if (attendance.breaks && attendance.breaks.length > 0) {
    const totalBreakMinutes = attendance.breaks.reduce((total, breakItem) => {
      if (breakItem.startTime && breakItem.endTime) {
        return total + (breakItem.duration || 0);
      } else if (breakItem.startTime && !breakItem.endTime) {
        // For active breaks, calculate current duration
        const breakStart = new Date(breakItem.startTime);
        const breakDuration = Math.floor((currentTime - breakStart) / (1000 * 60));
        return total + breakDuration;
      }
      return total;
    }, 0);
    currentDurationMinutes -= totalBreakMinutes;
  }

  // Get employee to check standard hours
  const employee = await Employee.findById(employeeId);
  const standardHours = employee?.employmentDetails?.workHoursPerWeek / 5 || 8; // Default to 8 hours
  const standardMinutes = standardHours * 60;

  // Check if employee would be leaving early if they clock out now
  const wouldBeEarly = currentDurationMinutes < standardMinutes;

  // Get active break if any
  const activeBreak = attendance.breaks?.find(b => b.startTime && !b.endTime);

  return {
    status: 'clocked_in',
    message: 'Currently clocked in',
    clockInTime: attendance.clockInTime,
    currentDuration: currentDuration,
    currentDurationMinutes: currentDurationMinutes,
    dailyGoal: attendance.goals,
    isLate: attendance.isLate || false,
    lateReason: attendance.lateReason,
    wouldBeEarly: wouldBeEarly,
    minutesRemaining: wouldBeEarly ? (standardMinutes - currentDurationMinutes) : 0,
    hoursRemaining: wouldBeEarly ? ((standardMinutes - currentDurationMinutes) / 60).toFixed(2) : 0,
    onBreak: attendance.onBreak || false,
    activeBreak: activeBreak,
    breaks: attendance.breaks || []
  };
};

// Get attendance summary for an employee
exports.getAttendanceSummary = async (employeeId, startDate, endDate) => {
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
      $lte: endDate.setHours(23, 59, 59, 999)
    }
  }).sort({ date: 1 });

  // Calculate statistics
  const summary = {
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    earlyDepartures: 0,
    totalWorkHours: 0,
    totalBreakMinutes: 0,
    averageWorkHours: 0,
    records: attendanceRecords
  };

  // Count working days in the date range (excluding weekends)
  const tempDate = new Date(startDate);
  while (tempDate <= endDate) {
    const dayOfWeek = tempDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      summary.totalDays++;
    }
    tempDate.setDate(tempDate.getDate() + 1);
  }

  // Process attendance records
  attendanceRecords.forEach(record => {
    if (record.status === 'present' || record.status === 'late' || record.status === 'half_day') {
      summary.presentDays++;

      if (record.status === 'late' || record.isLate) {
        summary.lateDays++;
      }

      if (record.isEarlyDeparture) {
        summary.earlyDepartures++;
      }

      // Calculate work hours from totalWorkDuration (minutes)
      const workHours = (record.totalWorkDuration || 0) / 60;
      summary.totalWorkHours += workHours;

      // Calculate total break minutes
      if (record.breaks && record.breaks.length > 0) {
        const breakMinutes = record.breaks.reduce((total, breakItem) => {
          return total + (breakItem.duration || 0);
        }, 0);
        summary.totalBreakMinutes += breakMinutes;
      }
    } else if (record.status === 'absent') {
      summary.absentDays++;
    }
  });

  // Calculate average work hours
  if (summary.presentDays > 0) {
    summary.averageWorkHours = summary.totalWorkHours / summary.presentDays;
  }

  // Get detailed records with goals and reports
  const detailedRecords = attendanceRecords.map(record => {
    return {
      date: record.date,
      status: record.status,
      clockInTime: record.clockInTime,
      clockOutTime: record.clockOutTime,
      totalWorkDuration: record.totalWorkDuration || 0,
      workHours: (record.totalWorkDuration || 0) / 60, // Convert minutes to hours
      isLate: record.isLate || false,
      lateReason: record.lateReason,
      isEarlyDeparture: record.isEarlyDeparture || false,
      earlyDepartureReason: record.earlyDepartureReason,
      goals: record.goals,
      accomplishments: record.accomplishments,
      breaks: record.breaks || [],
      totalBreakMinutes: record.breaks ? record.breaks.reduce((total, breakItem) => {
        return total + (breakItem.duration || 0);
      }, 0) : 0
    };
  });

  return {
    startDate,
    endDate,
    ...summary,
    detailedRecords
  };
};

// Add time entry for a task
exports.addTimeEntry = async (timeEntryData) => {
  // Calculate duration if start and end time are provided
  if (timeEntryData.startTime && timeEntryData.endTime) {
    const startTime = new Date(timeEntryData.startTime);
    const endTime = new Date(timeEntryData.endTime);

    // Duration in minutes
    timeEntryData.duration = Math.round((endTime - startTime) / (1000 * 60));
  }

  const timeEntry = new TimeEntry(timeEntryData);
  return await timeEntry.save();
};

// Get time entries for an employee
exports.getTimeEntries = async (employeeId, filters = {}) => {
  const query = { employee: employeeId };

  // Apply filters if provided
  if (filters.project) query.project = filters.project;
  if (filters.task) query.task = filters.task;
  if (filters.startDate && filters.endDate) {
    query.date = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate)
    };
  }

  // Set up pagination
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const skip = (page - 1) * limit;

  // Get total count for pagination
  const total = await TimeEntry.countDocuments(query);

  // Get time entries with pagination
  const timeEntries = await TimeEntry.find(query)
    .populate('project', 'name code')
    .populate('task', 'title taskNumber')
    .sort({ date: -1, startTime: -1 })
    .skip(skip)
    .limit(limit);

  return {
    timeEntries,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

// Get time entry statistics for an employee
exports.getTimeEntryStatistics = async (employeeId, startDate, endDate) => {
  // Set default date range to current month if not provided
  if (!startDate || !endDate) {
    const now = new Date();
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else {
    startDate = new Date(startDate);
    endDate = new Date(endDate);
  }

  // Get all time entries for the employee in the date range
  const timeEntries = await TimeEntry.find({
    employee: employeeId,
    date: {
      $gte: startDate.setHours(0, 0, 0, 0),
      $lte: endDate.setHours(23, 59, 59, 999)
    }
  }).populate('project', 'name code');

  // Calculate statistics
  const totalMinutes = timeEntries.reduce((total, entry) => total + (entry.duration || 0), 0);
  const billableMinutes = timeEntries.reduce((total, entry) => {
    return total + (entry.billable ? (entry.duration || 0) : 0);
  }, 0);

  // Group by project
  const projectStats = {};
  timeEntries.forEach(entry => {
    if (entry.project) {
      const projectId = entry.project._id.toString();
      if (!projectStats[projectId]) {
        projectStats[projectId] = {
          projectId,
          projectName: entry.project.name,
          projectCode: entry.project.code,
          totalMinutes: 0,
          billableMinutes: 0,
          entryCount: 0
        };
      }

      projectStats[projectId].totalMinutes += entry.duration || 0;
      if (entry.billable) {
        projectStats[projectId].billableMinutes += entry.duration || 0;
      }
      projectStats[projectId].entryCount++;
    }
  });

  // Group by date
  const dateStats = {};
  timeEntries.forEach(entry => {
    const dateKey = entry.date.toISOString().split('T')[0];
    if (!dateStats[dateKey]) {
      dateStats[dateKey] = {
        date: dateKey,
        totalMinutes: 0,
        billableMinutes: 0,
        entryCount: 0
      };
    }

    dateStats[dateKey].totalMinutes += entry.duration || 0;
    if (entry.billable) {
      dateStats[dateKey].billableMinutes += entry.duration || 0;
    }
    dateStats[dateKey].entryCount++;
  });

  return {
    startDate,
    endDate,
    summary: {
      totalHours: totalMinutes / 60, // Convert minutes to hours
      billableHours: billableMinutes / 60, // Convert minutes to hours
      billablePercentage: totalMinutes > 0 ? (billableMinutes / totalMinutes) * 100 : 0,
      entryCount: timeEntries.length
    },
    projectBreakdown: Object.values(projectStats).map(project => ({
      ...project,
      totalHours: project.totalMinutes / 60, // Convert minutes to hours
      billableHours: project.billableMinutes / 60 // Convert minutes to hours
    })),
    dailyBreakdown: Object.values(dateStats).map(day => ({
      ...day,
      totalHours: day.totalMinutes / 60, // Convert minutes to hours
      billableHours: day.billableMinutes / 60 // Convert minutes to hours
    }))
  };
};
