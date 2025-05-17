const Leave = require('../models/leave.model');
const Employee = require('../models/employee.model');

// Create a new leave request
exports.createLeave = async (leaveData) => {
  // Validate required fields
  if (!leaveData.reason) {
    throw new Error('Reason is required for leave request');
  }

  // Calculate total days if not provided
  if (!leaveData.totalDays) {
    const startDate = new Date(leaveData.startDate);
    const endDate = new Date(leaveData.endDate);

    // Calculate business days between start and end dates
    let totalDays = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        totalDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Adjust for half day if applicable
    if (leaveData.isHalfDay) {
      totalDays = totalDays > 0 ? 0.5 : 0;
    }

    leaveData.totalDays = totalDays;
  }

  // Calculate return to work date (next business day after end date)
  if (!leaveData.returnToWorkDate) {
    const endDate = new Date(leaveData.endDate);
    const returnDate = new Date(endDate);
    returnDate.setDate(returnDate.getDate() + 1);

    // Find the next business day
    while (returnDate.getDay() === 0 || returnDate.getDay() === 6) {
      returnDate.setDate(returnDate.getDate() + 1);
    }

    leaveData.returnToWorkDate = returnDate;
  }

  // Initialize status history
  if (!leaveData.statusHistory) {
    leaveData.statusHistory = [{
      status: 'pending',
      updatedAt: new Date(),
      comments: 'Leave request created'
    }];
  }

  const leave = new Leave(leaveData);
  return await leave.save();
};

// Get all leave requests with optional filtering
exports.getAllLeaves = async (filters = {}) => {
  const query = {};

  // Apply filters if provided
  if (filters.employee) query.employee = filters.employee;
  if (filters.status) query.status = filters.status;
  if (filters.leaveType) query.leaveType = filters.leaveType;
  if (filters.startDate && filters.endDate) {
    query.$or = [
      {
        startDate: { $gte: new Date(filters.startDate), $lte: new Date(filters.endDate) }
      },
      {
        endDate: { $gte: new Date(filters.startDate), $lte: new Date(filters.endDate) }
      },
      {
        $and: [
          { startDate: { $lte: new Date(filters.startDate) } },
          { endDate: { $gte: new Date(filters.endDate) } }
        ]
      }
    ];
  }

  return await Leave.find(query)
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
    .sort({ startDate: -1 });
};

// Get leave request by ID
exports.getLeaveById = async (leaveId) => {
  return await Leave.findById(leaveId)
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
    .populate('comments.user', 'name email');
};

// Update leave request
exports.updateLeave = async (leaveId, leaveData) => {
  // Recalculate total days if dates changed
  if ((leaveData.startDate || leaveData.endDate) && !leaveData.totalDays) {
    const leave = await Leave.findById(leaveId);

    if (!leave) {
      throw new Error('Leave request not found');
    }

    const startDate = new Date(leaveData.startDate || leave.startDate);
    const endDate = new Date(leaveData.endDate || leave.endDate);

    // Calculate business days between start and end dates
    let totalDays = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        totalDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    leaveData.totalDays = totalDays;
  }

  return await Leave.findByIdAndUpdate(
    leaveId,
    leaveData,
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
    .populate('approvedBy', 'employeeId')
    .populate({
      path: 'approvedBy',
      populate: {
        path: 'user',
        select: 'name email'
      }
    });
};

// Delete leave request
exports.deleteLeave = async (leaveId) => {
  return await Leave.findByIdAndDelete(leaveId);
};

// Approve leave request
exports.approveLeave = async (leaveId, approverId, comments = 'Leave request approved') => {
  const leave = await Leave.findById(leaveId);

  if (!leave) {
    throw new Error('Leave request not found');
  }

  if (leave.status !== 'pending') {
    throw new Error(`Cannot approve leave request with status: ${leave.status}`);
  }

  leave.status = 'approved';
  leave.approvedBy = approverId;
  leave.approvalDate = new Date();

  // Add to status history
  if (!leave.statusHistory) {
    leave.statusHistory = [];
  }

  leave.statusHistory.push({
    status: 'approved',
    updatedBy: approverId,
    updatedAt: new Date(),
    comments: comments
  });

  // Update employee leave balance
  const employee = await Employee.findById(leave.employee);
  if (employee && employee.leaveBalance) {
    // Initialize leave balance if not exists
    if (!employee.leaveBalance) {
      employee.leaveBalance = {};
    }

    // Update leave balance based on leave type
    switch (leave.leaveType) {
      case 'annual':
        if (!employee.leaveBalance.annual) employee.leaveBalance.annual = 0;
        employee.leaveBalance.annual -= leave.totalDays;
        break;
      case 'sick':
        if (!employee.leaveBalance.sick) employee.leaveBalance.sick = 0;
        employee.leaveBalance.sick -= leave.totalDays;
        break;
      case 'casual':
        if (!employee.leaveBalance.casual) employee.leaveBalance.casual = 0;
        employee.leaveBalance.casual -= leave.totalDays;
        break;
      // Other leave types can be handled similarly
    }

    await employee.save();
  }

  // Update employee status if leave starts today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const leaveStartDate = new Date(leave.startDate);
  leaveStartDate.setHours(0, 0, 0, 0);

  const leaveEndDate = new Date(leave.endDate);
  leaveEndDate.setHours(0, 0, 0, 0);

  if (leaveStartDate <= today && today <= leaveEndDate) {
    if (employee) {
      employee.status = 'on_leave';
      await employee.save();
    } else {
      await Employee.findByIdAndUpdate(
        leave.employee,
        { status: 'on_leave' }
      );
    }
  }

  return await leave.save();
};

// Reject leave request
exports.rejectLeave = async (leaveId, approverId, reason) => {
  const leave = await Leave.findById(leaveId);

  if (!leave) {
    throw new Error('Leave request not found');
  }

  if (leave.status !== 'pending') {
    throw new Error(`Cannot reject leave request with status: ${leave.status}`);
  }

  leave.status = 'rejected';
  leave.approvedBy = approverId;
  leave.approvalDate = new Date();

  // Add to status history
  if (!leave.statusHistory) {
    leave.statusHistory = [];
  }

  leave.statusHistory.push({
    status: 'rejected',
    updatedBy: approverId,
    updatedAt: new Date(),
    comments: reason ? `Rejected: ${reason}` : 'Leave request rejected'
  });

  // Add comment with rejection reason
  if (reason) {
    leave.comments.push({
      user: approverId,
      text: `Rejected: ${reason}`,
      date: new Date()
    });
  }

  return await leave.save();
};

// Cancel leave request
exports.cancelLeave = async (leaveId, userId, reason) => {
  const leave = await Leave.findById(leaveId);

  if (!leave) {
    throw new Error('Leave request not found');
  }

  if (leave.status === 'cancelled') {
    throw new Error('Leave request is already cancelled');
  }

  // Store previous status for leave balance adjustment
  const previousStatus = leave.status;

  leave.status = 'cancelled';

  // Add to status history
  if (!leave.statusHistory) {
    leave.statusHistory = [];
  }

  leave.statusHistory.push({
    status: 'cancelled',
    updatedBy: userId,
    updatedAt: new Date(),
    comments: reason ? `Cancelled: ${reason}` : 'Leave request cancelled'
  });

  // Add comment with cancellation reason
  if (reason) {
    leave.comments.push({
      user: userId,
      text: `Cancelled: ${reason}`,
      date: new Date()
    });
  }

  // If leave was approved, restore leave balance
  if (previousStatus === 'approved') {
    const employee = await Employee.findById(leave.employee);
    if (employee && employee.leaveBalance) {
      // Restore leave balance based on leave type
      switch (leave.leaveType) {
        case 'annual':
          if (employee.leaveBalance.annual !== undefined) {
            employee.leaveBalance.annual += leave.totalDays;
          }
          break;
        case 'sick':
          if (employee.leaveBalance.sick !== undefined) {
            employee.leaveBalance.sick += leave.totalDays;
          }
          break;
        case 'casual':
          if (employee.leaveBalance.casual !== undefined) {
            employee.leaveBalance.casual += leave.totalDays;
          }
          break;
        // Other leave types can be handled similarly
      }

      await employee.save();
    }
  }

  // Update employee status if currently on leave
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const leaveStartDate = new Date(leave.startDate);
  leaveStartDate.setHours(0, 0, 0, 0);

  const leaveEndDate = new Date(leave.endDate);
  leaveEndDate.setHours(0, 0, 0, 0);

  if (leaveStartDate <= today && today <= leaveEndDate) {
    const employee = await Employee.findById(leave.employee);

    if (employee && employee.status === 'on_leave') {
      employee.status = 'active';
      await employee.save();
    }
  }

  return await leave.save();
};

// Add comment to leave request
exports.addComment = async (leaveId, commentData) => {
  const leave = await Leave.findById(leaveId);

  if (!leave) {
    throw new Error('Leave request not found');
  }

  leave.comments.push(commentData);
  return await leave.save();
};

// Get leave requests by employee
exports.getLeavesByEmployee = async (employeeId, filters = {}) => {
  const query = { employee: employeeId };

  // Apply filters if provided
  if (filters.status) query.status = filters.status;
  if (filters.leaveType) query.leaveType = filters.leaveType;
  if (filters.year) {
    const year = parseInt(filters.year);
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    query.$or = [
      {
        startDate: { $gte: startDate, $lte: endDate }
      },
      {
        endDate: { $gte: startDate, $lte: endDate }
      },
      {
        $and: [
          { startDate: { $lte: startDate } },
          { endDate: { $gte: endDate } }
        ]
      }
    ];
  }

  return await Leave.find(query)
    .populate('approvedBy', 'employeeId')
    .populate({
      path: 'approvedBy',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .sort({ startDate: -1 });
};

// Get leave statistics by employee
exports.getLeaveStatisticsByEmployee = async (employeeId, year = new Date().getFullYear()) => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  // Get all approved leaves for the employee in the specified year
  const leaves = await Leave.find({
    employee: employeeId,
    status: 'approved',
    $or: [
      {
        startDate: { $gte: startDate, $lte: endDate }
      },
      {
        endDate: { $gte: startDate, $lte: endDate }
      },
      {
        $and: [
          { startDate: { $lte: startDate } },
          { endDate: { $gte: endDate } }
        ]
      }
    ]
  });

  // Calculate statistics by leave type
  const statistics = {};

  leaves.forEach(leave => {
    if (!statistics[leave.leaveType]) {
      statistics[leave.leaveType] = 0;
    }

    statistics[leave.leaveType] += leave.totalDays;
  });

  return {
    year,
    totalDays: leaves.reduce((total, leave) => total + leave.totalDays, 0),
    byType: statistics
  };
};

// Get pending leave requests for approval
exports.getPendingLeavesForApproval = async (managerId) => {
  // Get employees managed by this manager
  const employees = await Employee.find({ manager: managerId });
  const employeeIds = employees.map(emp => emp._id);

  // Get pending leave requests for these employees
  return await Leave.find({
    employee: { $in: employeeIds },
    status: 'pending'
  })
    .populate('employee', 'employeeId')
    .populate({
      path: 'employee',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .sort({ startDate: 1 });
};
