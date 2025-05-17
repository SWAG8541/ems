const LeaveService = require('../services/leave.service');
const { emitLeaveRequestUpdate, emitNotification } = require('../utils/socketUtils');

// Create a new leave request
exports.createLeave = async (req, res) => {
  try {
    // Add the current employee ID if not provided
    if (!req.body.employee && req.user && req.user.employeeId) {
      req.body.employee = req.user.employeeId;
    }

    const leave = await LeaveService.createLeave(req.body);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      emitLeaveRequestUpdate(io, leave);

      // Create notification for managers/HR
      if (leave.employee && leave.employee.manager) {
        const notificationData = {
          recipient: leave.employee.manager,
          type: 'leave_request',
          title: 'New Leave Request',
          message: `A new leave request has been submitted by ${leave.employee.user ? leave.employee.user.name : 'an employee'}.`,
          priority: 'normal',
          relatedModel: 'Leave',
          relatedId: leave._id
        };

        // Emit notification
        emitNotification(io, notificationData);
      }
    }

    res.status(201).json(leave);
  } catch (err) {
    res.status(500).json({ message: 'Error creating leave request', error: err.message });
  }
};

// Get all leave requests with optional filtering
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await LeaveService.getAllLeaves(req.query);
    res.status(200).json(leaves);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leave requests', error: err.message });
  }
};

// Get leave request by ID
exports.getLeaveById = async (req, res) => {
  try {
    const leave = await LeaveService.getLeaveById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    res.status(200).json(leave);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leave request', error: err.message });
  }
};

// Update leave request
exports.updateLeave = async (req, res) => {
  try {
    const leave = await LeaveService.updateLeave(req.params.id, req.body);

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    res.status(200).json(leave);
  } catch (err) {
    res.status(500).json({ message: 'Error updating leave request', error: err.message });
  }
};

// Delete leave request
exports.deleteLeave = async (req, res) => {
  try {
    const result = await LeaveService.deleteLeave(req.params.id);

    if (!result) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    res.status(200).json({ message: 'Leave request deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting leave request', error: err.message });
  }
};

// Approve leave request
exports.approveLeave = async (req, res) => {
  try {
    // Use the current employee ID if not provided
    const approverId = req.body.approverId || (req.user ? req.user.employeeId : null);

    if (!approverId) {
      return res.status(400).json({ message: 'Approver ID is required' });
    }

    const leave = await LeaveService.approveLeave(req.params.id, approverId);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      emitLeaveRequestUpdate(io, leave);

      // Create notification for the employee
      if (leave.employee && leave.employee.user) {
        const notificationData = {
          recipient: leave.employee.user._id,
          type: 'leave_approved',
          title: 'Leave Request Approved',
          message: `Your leave request from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} has been approved.`,
          priority: 'normal',
          relatedModel: 'Leave',
          relatedId: leave._id
        };

        // Emit notification
        emitNotification(io, notificationData);
      }
    }

    res.status(200).json(leave);
  } catch (err) {
    res.status(500).json({ message: 'Error approving leave request', error: err.message });
  }
};

// Reject leave request
exports.rejectLeave = async (req, res) => {
  try {
    // Use the current employee ID if not provided
    const approverId = req.body.approverId || (req.user ? req.user.employeeId : null);

    if (!approverId) {
      return res.status(400).json({ message: 'Approver ID is required' });
    }

    const leave = await LeaveService.rejectLeave(
      req.params.id,
      approverId,
      req.body.reason
    );

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      emitLeaveRequestUpdate(io, leave);

      // Create notification for the employee
      if (leave.employee && leave.employee.user) {
        const notificationData = {
          recipient: leave.employee.user._id,
          type: 'leave_rejected',
          title: 'Leave Request Rejected',
          message: `Your leave request from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} has been rejected.${req.body.reason ? ` Reason: ${req.body.reason}` : ''}`,
          priority: 'high',
          relatedModel: 'Leave',
          relatedId: leave._id
        };

        // Emit notification
        emitNotification(io, notificationData);
      }
    }

    res.status(200).json(leave);
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting leave request', error: err.message });
  }
};

// Cancel leave request
exports.cancelLeave = async (req, res) => {
  try {
    // Use the current user ID if not provided
    const userId = req.body.userId || (req.user ? req.user.id : null);

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const leave = await LeaveService.cancelLeave(
      req.params.id,
      userId,
      req.body.reason
    );
    res.status(200).json(leave);
  } catch (err) {
    res.status(500).json({ message: 'Error cancelling leave request', error: err.message });
  }
};

// Add comment to leave request
exports.addComment = async (req, res) => {
  try {
    // Add the current user ID to the comment data
    if (req.user) {
      req.body.user = req.user.id;
    }

    const leave = await LeaveService.addComment(req.params.id, req.body);
    res.status(200).json(leave);
  } catch (err) {
    res.status(500).json({ message: 'Error adding comment', error: err.message });
  }
};

// Get leave requests by employee
exports.getLeavesByEmployee = async (req, res) => {
  try {
    const leaves = await LeaveService.getLeavesByEmployee(
      req.params.employeeId,
      req.query
    );
    res.status(200).json(leaves);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leave requests by employee', error: err.message });
  }
};

// Get leave statistics by employee
exports.getLeaveStatisticsByEmployee = async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    const statistics = await LeaveService.getLeaveStatisticsByEmployee(
      req.params.employeeId,
      year
    );
    res.status(200).json(statistics);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leave statistics', error: err.message });
  }
};

// Get pending leave requests for approval
exports.getPendingLeavesForApproval = async (req, res) => {
  try {
    // Use the current employee ID if not provided
    const managerId = req.params.managerId || (req.user ? req.user.employeeId : null);

    if (!managerId) {
      return res.status(400).json({ message: 'Manager ID is required' });
    }

    const leaves = await LeaveService.getPendingLeavesForApproval(managerId);
    res.status(200).json(leaves);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pending leave requests', error: err.message });
  }
};
