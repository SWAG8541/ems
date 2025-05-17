const TimeEntry = require('../models/timeEntry.model');
const Task = require('../models/task.model');

// Create a new time entry
exports.createTimeEntry = async (timeEntryData) => {
  // Calculate duration if start and end time are provided
  if (timeEntryData.startTime && timeEntryData.endTime) {
    const startTime = new Date(timeEntryData.startTime);
    const endTime = new Date(timeEntryData.endTime);
    
    // Duration in minutes
    timeEntryData.duration = Math.round((endTime - startTime) / (1000 * 60));
  }
  
  const timeEntry = new TimeEntry(timeEntryData);
  
  // Update task actual hours if task is provided
  if (timeEntryData.task) {
    await this.updateTaskActualHours(timeEntryData.task);
  }
  
  return await timeEntry.save();
};

// Get all time entries with optional filtering
exports.getAllTimeEntries = async (filters = {}) => {
  const query = {};
  
  // Apply filters if provided
  if (filters.employee) query.employee = filters.employee;
  if (filters.project) query.project = filters.project;
  if (filters.task) query.task = filters.task;
  if (filters.status) query.status = filters.status;
  if (filters.billable !== undefined) query.billable = filters.billable;
  if (filters.startDate && filters.endDate) {
    query.date = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate)
    };
  }
  
  return await TimeEntry.find(query)
    .populate('employee', 'employeeId')
    .populate({
      path: 'employee',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('project', 'name code')
    .populate('task', 'title taskNumber')
    .sort({ date: -1, startTime: -1 });
};

// Get time entry by ID
exports.getTimeEntryById = async (timeEntryId) => {
  return await TimeEntry.findById(timeEntryId)
    .populate('employee', 'employeeId')
    .populate({
      path: 'employee',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('project', 'name code')
    .populate('task', 'title taskNumber')
    .populate('approvedBy', 'employeeId')
    .populate({
      path: 'approvedBy',
      populate: {
        path: 'user',
        select: 'name email'
      }
    });
};

// Update time entry
exports.updateTimeEntry = async (timeEntryId, timeEntryData) => {
  const timeEntry = await TimeEntry.findById(timeEntryId);
  
  if (!timeEntry) {
    throw new Error('Time entry not found');
  }
  
  // Calculate duration if start and end time are provided
  if (timeEntryData.startTime && timeEntryData.endTime) {
    const startTime = new Date(timeEntryData.startTime);
    const endTime = new Date(timeEntryData.endTime);
    
    // Duration in minutes
    timeEntryData.duration = Math.round((endTime - startTime) / (1000 * 60));
  }
  
  // Mark as modified
  if (!timeEntryData.modified) {
    timeEntryData.modified = {
      isModified: true,
      modifiedAt: new Date()
    };
  }
  
  const updatedTimeEntry = await TimeEntry.findByIdAndUpdate(
    timeEntryId,
    timeEntryData,
    { new: true, runValidators: true }
  )
    .populate('employee', 'employeeId')
    .populate({
      path: 'employee',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('project', 'name code')
    .populate('task', 'title taskNumber');
  
  // Update task actual hours if task is provided
  if (timeEntry.task) {
    await this.updateTaskActualHours(timeEntry.task);
  }
  
  if (timeEntryData.task && timeEntryData.task.toString() !== timeEntry.task?.toString()) {
    await this.updateTaskActualHours(timeEntryData.task);
  }
  
  return updatedTimeEntry;
};

// Delete time entry
exports.deleteTimeEntry = async (timeEntryId) => {
  const timeEntry = await TimeEntry.findById(timeEntryId);
  
  if (!timeEntry) {
    throw new Error('Time entry not found');
  }
  
  const result = await TimeEntry.findByIdAndDelete(timeEntryId);
  
  // Update task actual hours if task is provided
  if (timeEntry.task) {
    await this.updateTaskActualHours(timeEntry.task);
  }
  
  return result;
};

// Approve time entry
exports.approveTimeEntry = async (timeEntryId, approverId) => {
  const timeEntry = await TimeEntry.findById(timeEntryId);
  
  if (!timeEntry) {
    throw new Error('Time entry not found');
  }
  
  timeEntry.status = 'approved';
  timeEntry.approvedBy = approverId;
  timeEntry.approvalDate = new Date();
  
  return await timeEntry.save();
};

// Reject time entry
exports.rejectTimeEntry = async (timeEntryId, approverId, reason) => {
  const timeEntry = await TimeEntry.findById(timeEntryId);
  
  if (!timeEntry) {
    throw new Error('Time entry not found');
  }
  
  timeEntry.status = 'rejected';
  timeEntry.approvedBy = approverId;
  timeEntry.approvalDate = new Date();
  timeEntry.modified = {
    isModified: true,
    modifiedBy: approverId,
    modifiedAt: new Date(),
    reason: reason
  };
  
  return await timeEntry.save();
};

// Get time entries by employee
exports.getTimeEntriesByEmployee = async (employeeId, filters = {}) => {
  const query = { employee: employeeId };
  
  // Apply filters if provided
  if (filters.startDate && filters.endDate) {
    query.date = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate)
    };
  }
  
  return await TimeEntry.find(query)
    .populate('project', 'name code')
    .populate('task', 'title taskNumber')
    .sort({ date: -1, startTime: -1 });
};

// Get time entries by date range
exports.getTimeEntriesByDateRange = async (startDate, endDate, filters = {}) => {
  const query = {
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };
  
  // Apply filters if provided
  if (filters.employee) query.employee = filters.employee;
  if (filters.project) query.project = filters.project;
  if (filters.billable !== undefined) query.billable = filters.billable;
  
  return await TimeEntry.find(query)
    .populate('employee', 'employeeId')
    .populate({
      path: 'employee',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('project', 'name code')
    .populate('task', 'title taskNumber')
    .sort({ date: 1, startTime: 1 });
};

// Get time entry statistics
exports.getTimeEntryStatistics = async (filters = {}) => {
  const match = {};
  
  // Apply filters if provided
  if (filters.employee) match.employee = filters.employee;
  if (filters.project) match.project = filters.project;
  if (filters.startDate && filters.endDate) {
    match.date = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate)
    };
  }
  
  const stats = await TimeEntry.aggregate([
    { $match: match },
    { $group: {
        _id: null,
        totalHours: { $sum: '$duration' },
        billableHours: { $sum: { $cond: [{ $eq: ['$billable', true] }, '$duration', 0] } },
        entryCount: { $sum: 1 }
      }
    }
  ]);
  
  // Get daily breakdown
  const dailyBreakdown = await TimeEntry.aggregate([
    { $match: match },
    { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        totalHours: { $sum: '$duration' },
        billableHours: { $sum: { $cond: [{ $eq: ['$billable', true] }, '$duration', 0] } },
        entryCount: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  // Get project breakdown
  const projectBreakdown = await TimeEntry.aggregate([
    { $match: match },
    { $group: {
        _id: '$project',
        totalHours: { $sum: '$duration' },
        billableHours: { $sum: { $cond: [{ $eq: ['$billable', true] }, '$duration', 0] } },
        entryCount: { $sum: 1 }
      }
    },
    { $lookup: {
        from: 'projects',
        localField: '_id',
        foreignField: '_id',
        as: 'projectInfo'
      }
    },
    { $unwind: { path: '$projectInfo', preserveNullAndEmptyArrays: true } },
    { $project: {
        projectName: '$projectInfo.name',
        projectCode: '$projectInfo.code',
        totalHours: 1,
        billableHours: 1,
        entryCount: 1
      }
    },
    { $sort: { totalHours: -1 } }
  ]);
  
  return {
    summary: stats.length > 0 ? {
      totalHours: stats[0].totalHours / 60, // Convert minutes to hours
      billableHours: stats[0].billableHours / 60, // Convert minutes to hours
      entryCount: stats[0].entryCount,
      billablePercentage: stats[0].totalHours > 0 ? (stats[0].billableHours / stats[0].totalHours) * 100 : 0
    } : {
      totalHours: 0,
      billableHours: 0,
      entryCount: 0,
      billablePercentage: 0
    },
    dailyBreakdown: dailyBreakdown.map(day => ({
      date: day._id,
      totalHours: day.totalHours / 60, // Convert minutes to hours
      billableHours: day.billableHours / 60, // Convert minutes to hours
      entryCount: day.entryCount
    })),
    projectBreakdown: projectBreakdown.map(project => ({
      projectId: project._id,
      projectName: project.projectName,
      projectCode: project.projectCode,
      totalHours: project.totalHours / 60, // Convert minutes to hours
      billableHours: project.billableHours / 60, // Convert minutes to hours
      entryCount: project.entryCount
    }))
  };
};

// Update task actual hours
exports.updateTaskActualHours = async (taskId) => {
  // Calculate total hours from time entries
  const timeEntries = await TimeEntry.find({ task: taskId });
  
  const totalMinutes = timeEntries.reduce((total, entry) => total + entry.duration, 0);
  const totalHours = totalMinutes / 60; // Convert minutes to hours
  
  // Update task
  await Task.findByIdAndUpdate(taskId, { actualHours: totalHours });
};
