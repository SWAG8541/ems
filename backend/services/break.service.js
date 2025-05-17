const Break = require('../models/break.model');
const Attendance = require('../models/attendance.model');
const mongoose = require('mongoose');

// Start a break
exports.startBreak = async (employeeId, breakData) => {
  // Validate break type
  if (!breakData.type || !['lunch', 'tea', 'personal', 'meeting', 'other'].includes(breakData.type)) {
    throw new Error('Invalid break type. Must be lunch, tea, personal, meeting, or other');
  }

  // If type is 'other', description is required
  if (breakData.type === 'other' && !breakData.description) {
    throw new Error('Description is required for break type "other"');
  }

  // Find today's attendance record for the employee
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await Attendance.findOne({
    employee: employeeId,
    date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
    },
    clockInTime: { $ne: null },
    clockOutTime: { $eq: null } // Not checked out yet
  });

  if (!attendance) {
    throw new Error('No active attendance record found. Please clock in first.');
  }

  // Check if employee is already on a break
  if (attendance.onBreak) {
    throw new Error('You are already on a break. Please end your current break first.');
  }

  // Create a new break object
  const now = new Date();
  const newBreak = {
    type: breakData.type,
    description: breakData.description || '',
    startTime: now,
    duration: 0
  };

  // Add the break to the attendance record
  attendance.breaks.push(newBreak);
  attendance.onBreak = true;

  // Save the attendance record
  await attendance.save();

  // Get the newly added break (last one in the array)
  const savedBreak = attendance.breaks[attendance.breaks.length - 1];

  return {
    message: 'Break started successfully',
    break: savedBreak,
    startTime: now,
    type: breakData.type,
    description: breakData.description,
    onBreak: true
  };
};

// End a break
exports.endBreak = async (employeeId) => {
  // Find today's attendance record for the employee
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await Attendance.findOne({
    employee: employeeId,
    date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
    },
    onBreak: true
  });

  if (!attendance) {
    throw new Error('No active break found.');
  }

  // Find the active break (the one without an end time)
  const activeBreakIndex = attendance.breaks.findIndex(b => b.startTime && !b.endTime);

  if (activeBreakIndex === -1) {
    throw new Error('No active break found.');
  }

  // Update the break
  const now = new Date();
  const activeBreak = attendance.breaks[activeBreakIndex];
  activeBreak.endTime = now;

  // Calculate duration
  const durationMs = now - new Date(activeBreak.startTime);
  activeBreak.duration = Math.round(durationMs / (1000 * 60)); // Convert to minutes

  // Update the attendance record
  attendance.breaks[activeBreakIndex] = activeBreak;
  attendance.onBreak = false;

  await attendance.save();

  return {
    message: 'Break ended successfully',
    break: activeBreak,
    endTime: now,
    duration: activeBreak.duration,
    onBreak: false
  };
};

// Get break status
exports.getBreakStatus = async (employeeId) => {
  // Find today's attendance record for the employee
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await Attendance.findOne({
    employee: employeeId,
    date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
    }
  });

  if (!attendance) {
    return {
      onBreak: false,
      message: 'No attendance record found for today'
    };
  }

  if (!attendance.onBreak) {
    return {
      onBreak: false,
      message: 'Not currently on break'
    };
  }

  // Find the active break (the one without an end time)
  const activeBreak = attendance.breaks.find(b => b.startTime && !b.endTime);

  if (!activeBreak) {
    // This shouldn't happen, but just in case
    attendance.onBreak = false;
    await attendance.save();

    return {
      onBreak: false,
      message: 'Not currently on break'
    };
  }

  // Calculate current break duration
  const now = new Date();
  const durationMs = now - new Date(activeBreak.startTime);
  const currentDuration = Math.round(durationMs / (1000 * 60)); // Convert to minutes

  return {
    onBreak: true,
    breakId: activeBreak._id,
    breakType: activeBreak.type,
    description: activeBreak.description,
    startTime: activeBreak.startTime,
    currentDuration: currentDuration,
    message: `Currently on ${activeBreak.type} break`
  };
};

// Get all breaks for an employee on a specific date
exports.getBreaks = async (employeeId, date) => {
  // If date is not provided, use today
  if (!date) {
    date = new Date();
  }

  // Convert date to start of day
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);

  // End of day
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);

  // Find the attendance record for the specified date
  const attendance = await Attendance.findOne({
    employee: employeeId,
    date: {
      $gte: startDate,
      $lt: endDate
    }
  });

  if (!attendance) {
    return {
      breaks: [],
      totalBreakDuration: 0,
      message: 'No attendance record found for the specified date'
    };
  }

  // Calculate total break duration
  let totalBreakDuration = 0;
  if (attendance.breaks && attendance.breaks.length > 0) {
    totalBreakDuration = attendance.breaks.reduce((total, breakItem) => {
      return total + (breakItem.duration || 0);
    }, 0);
  }

  return {
    breaks: attendance.breaks || [],
    totalBreakDuration: totalBreakDuration,
    message: 'Breaks retrieved successfully'
  };
};
