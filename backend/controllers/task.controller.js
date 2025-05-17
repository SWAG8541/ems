const TaskService = require('../services/task.service');
const { emitTaskAssignment, emitNotification } = require('../utils/socketUtils');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    // Add the current user as the assignedBy if not provided
    if (!req.body.assignedBy && req.user && req.user.employeeId) {
      req.body.assignedBy = req.user.employeeId;
    }

    const task = await TaskService.createTask(req.body);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io && task.assignedTo) {
      emitTaskAssignment(io, task);

      // Create notification for the assignee
      if (task.assignedTo.user) {
        const notificationData = {
          recipient: task.assignedTo.user._id,
          type: 'task_assigned',
          title: 'New Task Assigned',
          message: `You have been assigned a new task: ${task.title}`,
          priority: task.priority === 'urgent' ? 'high' : 'normal',
          relatedModel: 'Task',
          relatedId: task._id,
          link: `/tasks/${task._id}`
        };

        // Emit notification
        emitNotification(io, notificationData);
      }
    }

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error creating task', error: err.message });
  }
};

// Get all tasks with optional filtering
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await TaskService.getAllTasks(req.query);
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks', error: err.message });
  }
};

// Get task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await TaskService.getTaskById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching task', error: err.message });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;

    // Get the task before update to check for assignee changes
    const oldTask = await TaskService.getTaskById(req.params.id);
    const oldAssigneeId = oldTask?.assignedTo?._id || oldTask?.assignedTo;
    const newAssigneeId = req.body.assignedTo;

    // Update the task
    const task = await TaskService.updateTask(req.params.id, req.body, userId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      // If assignee has changed, emit task assignment event
      if (newAssigneeId && newAssigneeId !== oldAssigneeId) {
        emitTaskAssignment(io, task);

        // Create notification for the new assignee
        if (task.assignedTo && task.assignedTo.user) {
          const notificationData = {
            recipient: task.assignedTo.user._id,
            type: 'task_assigned',
            title: 'Task Assigned',
            message: `You have been assigned to the task: ${task.title}`,
            priority: task.priority === 'urgent' ? 'high' : 'normal',
            relatedModel: 'Task',
            relatedId: task._id,
            link: `/tasks/${task._id}`
          };

          // Emit notification
          emitNotification(io, notificationData);
        }
      }

      // If task status has changed to 'done', notify watchers
      if (task.status === 'done' && oldTask.status !== 'done' && task.watchers && task.watchers.length > 0) {
        // Notify each watcher
        task.watchers.forEach(watcher => {
          const notificationData = {
            recipient: watcher,
            type: 'task_completed',
            title: 'Task Completed',
            message: `Task "${task.title}" has been marked as complete.`,
            priority: 'normal',
            relatedModel: 'Task',
            relatedId: task._id,
            link: `/tasks/${task._id}`
          };

          // Emit notification
          emitNotification(io, notificationData);
        });
      }
    }

    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error updating task', error: err.message });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const result = await TaskService.deleteTask(req.params.id);

    if (!result) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting task', error: err.message });
  }
};

// Add comment to task
exports.addComment = async (req, res) => {
  try {
    // Add the current user ID to the comment data
    if (req.user) {
      req.body.user = req.user.id;
    }

    const task = await TaskService.addComment(req.params.id, req.body);
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error adding comment', error: err.message });
  }
};

// Add subtask to task
exports.addSubtask = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const task = await TaskService.addSubtask(req.params.id, req.body, userId);
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error adding subtask', error: err.message });
  }
};

// Update subtask
exports.updateSubtask = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const task = await TaskService.updateSubtask(
      req.params.id,
      req.params.subtaskId,
      req.body,
      userId
    );
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error updating subtask', error: err.message });
  }
};

// Add watcher to task
exports.addWatcher = async (req, res) => {
  try {
    // Use the current user ID if not provided
    const userId = req.body.userId || (req.user ? req.user.id : null);

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const task = await TaskService.addWatcher(req.params.id, userId);
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error adding watcher', error: err.message });
  }
};

// Remove watcher from task
exports.removeWatcher = async (req, res) => {
  try {
    // Use the current user ID if not provided
    const userId = req.params.userId || (req.user ? req.user.id : null);

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const task = await TaskService.removeWatcher(req.params.id, userId);
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error removing watcher', error: err.message });
  }
};

// Get tasks by assignee
exports.getTasksByAssignee = async (req, res) => {
  try {
    const tasks = await TaskService.getTasksByAssignee(req.params.employeeId, req.query);
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks by assignee', error: err.message });
  }
};

// Search tasks
exports.searchTasks = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search term is required' });
    }

    const tasks = await TaskService.searchTasks(q);
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error searching tasks', error: err.message });
  }
};

// Get tasks by project
exports.getTasksByProject = async (req, res) => {
  try {
    const tasks = await TaskService.getTasksByProject(req.params.projectId, req.query);
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks by project', error: err.message });
  }
};

// Update task status
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    // Get the task before update
    const oldTask = await TaskService.getTaskById(req.params.id);
    if (!oldTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const userId = req.user ? req.user.id : null;
    const task = await TaskService.updateTaskStatus(req.params.id, status, userId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      // Notify assignee of status change
      if (task.assignedTo && task.assignedTo.user && status !== oldTask.status) {
        // Don't notify the person who made the change
        if (userId !== task.assignedTo.user._id.toString()) {
          const notificationData = {
            recipient: task.assignedTo.user._id,
            type: 'task_status_changed',
            title: 'Task Status Changed',
            message: `The status of task "${task.title}" has been changed to ${status.replace('_', ' ')}.`,
            priority: status === 'urgent' ? 'high' : 'normal',
            relatedModel: 'Task',
            relatedId: task._id,
            link: `/tasks/${task._id}`
          };

          // Emit notification
          emitNotification(io, notificationData);
        }
      }

      // If task status has changed to 'done', notify watchers
      if (status === 'done' && oldTask.status !== 'done' && task.watchers && task.watchers.length > 0) {
        // Notify each watcher
        task.watchers.forEach(watcher => {
          // Don't notify the person who made the change
          if (userId !== watcher.toString()) {
            const notificationData = {
              recipient: watcher,
              type: 'task_completed',
              title: 'Task Completed',
              message: `Task "${task.title}" has been marked as complete.`,
              priority: 'normal',
              relatedModel: 'Task',
              relatedId: task._id,
              link: `/tasks/${task._id}`
            };

            // Emit notification
            emitNotification(io, notificationData);
          }
        });
      }
    }

    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error updating task status', error: err.message });
  }
};

// Add subtask
exports.addSubtask = async (req, res) => {
  try {
    const { title, description, status, assignedTo, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Subtask title is required' });
    }

    const userId = req.user ? req.user.id : null;
    const task = await TaskService.addSubtask(req.params.id, {
      title,
      description,
      status: status || 'todo',
      assignedTo,
      dueDate,
      createdBy: userId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error adding subtask', error: err.message });
  }
};

// Update subtask
exports.updateSubtask = async (req, res) => {
  try {
    const { title, description, status, assignedTo, dueDate } = req.body;
    const userId = req.user ? req.user.id : null;

    const task = await TaskService.updateSubtask(req.params.id, req.params.subtaskId, {
      title,
      description,
      status,
      assignedTo,
      dueDate,
      updatedBy: userId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task or subtask not found' });
    }

    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error updating subtask', error: err.message });
  }
};

// Delete subtask
exports.deleteSubtask = async (req, res) => {
  try {
    const task = await TaskService.deleteSubtask(req.params.id, req.params.subtaskId);

    if (!task) {
      return res.status(404).json({ message: 'Task or subtask not found' });
    }

    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error deleting subtask', error: err.message });
  }
};

// Add dependency
exports.addDependency = async (req, res) => {
  try {
    const { task: dependencyTaskId, type } = req.body;

    if (!dependencyTaskId) {
      return res.status(400).json({ message: 'Dependency task ID is required' });
    }

    if (!type) {
      return res.status(400).json({ message: 'Dependency type is required' });
    }

    const userId = req.user ? req.user.id : null;
    const task = await TaskService.addDependency(req.params.id, {
      task: dependencyTaskId,
      type,
      createdBy: userId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error adding dependency', error: err.message });
  }
};

// Remove dependency
exports.removeDependency = async (req, res) => {
  try {
    const task = await TaskService.removeDependency(req.params.id, req.params.dependencyId);

    if (!task) {
      return res.status(404).json({ message: 'Task or dependency not found' });
    }

    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error removing dependency', error: err.message });
  }
};

// Get task dependencies
exports.getTaskDependencies = async (req, res) => {
  try {
    const dependencies = await TaskService.getTaskDependencies(req.params.id);
    res.status(200).json(dependencies);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching task dependencies', error: err.message });
  }
};
