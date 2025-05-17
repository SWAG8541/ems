/**
 * Socket utility functions for emitting events
 */

/**
 * Emit an attendance update event
 * @param {Object} io - Socket.io instance
 * @param {Object} attendance - Updated attendance data
 */
const emitAttendanceUpdate = (io, attendance) => {
  if (!io || !attendance) return;

  // Emit to specific user
  if (attendance.employee) {
    // Support both string ID and object with _id
    const employeeId = typeof attendance.employee === 'object' ?
      attendance.employee._id : attendance.employee;
    io.to(`user-${employeeId}`).emit('attendance_update', attendance);

    // If employee has user property, emit to that user as well
    if (attendance.employee.user && attendance.employee.user._id) {
      io.to(`user-${attendance.employee.user._id}`).emit('attendance_update', attendance);
    }
  }

  // Emit to admin and HR roles
  io.to('admin').to('hr').emit('attendance_update', attendance);

  // Emit to department if available
  if (attendance.department) {
    const departmentId = typeof attendance.department === 'object' ?
      attendance.department._id : attendance.department;
    io.to(`department-${departmentId}`).emit('attendance_update', attendance);
  }

  // Emit to manager if available
  if (attendance.employee && attendance.employee.manager) {
    const managerId = typeof attendance.employee.manager === 'object' ?
      attendance.employee.manager._id : attendance.employee.manager;
    io.to(`user-${managerId}`).emit('attendance_update', attendance);
  }
};

/**
 * Emit a leave request update event
 * @param {Object} io - Socket.io instance
 * @param {Object} leaveRequest - Updated leave request data
 */
const emitLeaveRequestUpdate = (io, leaveRequest) => {
  if (!io || !leaveRequest) return;

  // Emit to specific user
  if (leaveRequest.employee) {
    // Support both string ID and object with _id
    const employeeId = typeof leaveRequest.employee === 'object' ?
      leaveRequest.employee._id : leaveRequest.employee;
    io.to(`user-${employeeId}`).emit('leave_request_update', leaveRequest);

    // If employee has user property, emit to that user as well
    if (leaveRequest.employee.user && leaveRequest.employee.user._id) {
      io.to(`user-${leaveRequest.employee.user._id}`).emit('leave_request_update', leaveRequest);
    }
  }

  // Emit to admin and HR roles
  io.to('admin').to('hr').emit('leave_request_update', leaveRequest);

  // Emit to manager if available
  if (leaveRequest.employee && leaveRequest.employee.manager) {
    const managerId = typeof leaveRequest.employee.manager === 'object' ?
      leaveRequest.employee.manager._id : leaveRequest.employee.manager;
    io.to(`user-${managerId}`).emit('leave_request_update', leaveRequest);
  } else if (leaveRequest.manager) {
    // Legacy support
    const managerId = typeof leaveRequest.manager === 'object' ?
      leaveRequest.manager._id : leaveRequest.manager;
    io.to(`user-${managerId}`).emit('leave_request_update', leaveRequest);
  }

  // Emit to department if available
  if (leaveRequest.department) {
    const departmentId = typeof leaveRequest.department === 'object' ?
      leaveRequest.department._id : leaveRequest.department;
    io.to(`department-${departmentId}`).emit('leave_request_update', leaveRequest);
  }
};

/**
 * Emit a task assignment event
 * @param {Object} io - Socket.io instance
 * @param {Object} task - Task data
 */
const emitTaskAssignment = (io, task) => {
  if (!io || !task) return;

  // Emit to assigned user
  if (task.assignedTo) {
    // Support both string ID and object with _id
    const assigneeId = typeof task.assignedTo === 'object' ?
      task.assignedTo._id : task.assignedTo;
    io.to(`user-${assigneeId}`).emit('task_assignment', task);

    // If assignedTo has user property, emit to that user as well
    if (task.assignedTo.user && task.assignedTo.user._id) {
      io.to(`user-${task.assignedTo.user._id}`).emit('task_assignment', task);
    }
  }

  // Emit to task creator/assigner
  if (task.assignedBy) {
    const assignerId = typeof task.assignedBy === 'object' ?
      task.assignedBy._id : task.assignedBy;
    io.to(`user-${assignerId}`).emit('task_assignment', task);

    // If assignedBy has user property, emit to that user as well
    if (task.assignedBy.user && task.assignedBy.user._id) {
      io.to(`user-${task.assignedBy.user._id}`).emit('task_assignment', task);
    }
  }

  // Emit to project members if available
  if (task.project) {
    const projectId = typeof task.project === 'object' ?
      task.project._id : task.project;
    io.to(`project-${projectId}`).emit('task_assignment', task);

    // Emit to project manager if available
    if (task.project.manager) {
      const managerId = typeof task.project.manager === 'object' ?
        task.project.manager._id : task.project.manager;
      io.to(`user-${managerId}`).emit('task_assignment', task);
    }
  }

  // Emit to watchers if available
  if (task.watchers && Array.isArray(task.watchers)) {
    task.watchers.forEach(watcher => {
      const watcherId = typeof watcher === 'object' ? watcher._id : watcher;
      io.to(`user-${watcherId}`).emit('task_assignment', task);
    });
  }

  // Emit to admin and manager roles
  io.to('admin').to('manager').emit('task_assignment', task);
};

/**
 * Emit a notification event
 * @param {Object} io - Socket.io instance
 * @param {Object} notification - Notification data
 */
const emitNotification = (io, notification) => {
  if (!io || !notification) return;

  // Emit to specific user (recipient)
  if (notification.recipient) {
    const recipientId = typeof notification.recipient === 'object' ?
      notification.recipient._id : notification.recipient;
    io.to(`user-${recipientId}`).emit('notification', notification);
  } else if (notification.user) {
    // Legacy support
    const userId = typeof notification.user === 'object' ?
      notification.user._id : notification.user;
    io.to(`user-${userId}`).emit('notification', notification);
  }

  // Emit to specific roles if notification is for roles
  if (notification.roles && Array.isArray(notification.roles)) {
    notification.roles.forEach(role => {
      io.to(role).emit('notification', notification);
    });
  }

  // Emit to department if available
  if (notification.department) {
    const departmentId = typeof notification.department === 'object' ?
      notification.department._id : notification.department;
    io.to(`department-${departmentId}`).emit('notification', notification);
  }

  // Emit to all if notification is global
  if (notification.isGlobal) {
    io.emit('notification', notification);
  }

  // Always emit to admin for monitoring
  io.to('admin').emit('notification', {
    ...notification,
    _adminView: true
  });
};

/**
 * Emit a task status update event
 * @param {Object} io - Socket.io instance
 * @param {Object} task - Task data
 */
const emitTaskStatusUpdate = (io, task) => {
  if (!io || !task) return;

  // Use the same logic as task assignment for now
  emitTaskAssignment(io, task);
};

module.exports = {
  emitAttendanceUpdate,
  emitLeaveRequestUpdate,
  emitTaskAssignment,
  emitTaskStatusUpdate,
  emitNotification
};
