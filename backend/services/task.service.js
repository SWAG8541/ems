const Task = require('../models/task.model');
const Project = require('../models/project.model');
const TimeEntry = require('../models/timeEntry.model');

// Create a new task
exports.createTask = async (taskData) => {
  // Generate task number if not provided
  if (!taskData.taskNumber) {
    taskData.taskNumber = await this.generateTaskNumber(taskData.project);
  }

  const task = new Task(taskData);

  // Add to history
  if (taskData.assignedBy) {
    task.history.push({
      user: taskData.assignedBy,
      action: 'created',
      field: 'task',
      newValue: task.title
    });
  }

  return await task.save();
};

// Get all tasks with optional filtering
exports.getAllTasks = async (filters = {}) => {
  const query = {};

  // Apply filters if provided
  if (filters.project) query.project = filters.project;
  if (filters.assignedTo) query.assignedTo = filters.assignedTo;
  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.type) query.type = filters.type;
  if (filters.dueDate) {
    query.dueDate = { $lte: new Date(filters.dueDate) };
  }

  return await Task.find(query)
    .populate('project', 'name code')
    .populate('assignedTo', 'employeeId')
    .populate({
      path: 'assignedTo',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('assignedBy', 'employeeId')
    .populate({
      path: 'assignedBy',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .sort({ dueDate: 1 });
};

// Get task by ID
exports.getTaskById = async (taskId) => {
  return await Task.findById(taskId)
    .populate('project', 'name code')
    .populate('assignedTo', 'employeeId')
    .populate({
      path: 'assignedTo',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('assignedBy', 'employeeId')
    .populate({
      path: 'assignedBy',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('dependencies.task', 'title taskNumber')
    .populate('subtasks.assignedTo', 'employeeId')
    .populate({
      path: 'subtasks.assignedTo',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('comments.user', 'name email')
    .populate('watchers', 'name email')
    .populate('history.user', 'name email');
};

// Update task
exports.updateTask = async (taskId, taskData, userId) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error('Task not found');
  }

  // Track changes for history
  const history = [];

  // Check for status change
  if (taskData.status && taskData.status !== task.status) {
    history.push({
      user: userId,
      action: 'updated',
      field: 'status',
      oldValue: task.status,
      newValue: taskData.status
    });

    // If status changed to 'done', set completedDate
    if (taskData.status === 'done' && !taskData.completedDate) {
      taskData.completedDate = new Date();
    }
  }

  // Check for assignee change
  if (taskData.assignedTo && taskData.assignedTo.toString() !== task.assignedTo?.toString()) {
    history.push({
      user: userId,
      action: 'updated',
      field: 'assignedTo',
      oldValue: task.assignedTo,
      newValue: taskData.assignedTo
    });
  }

  // Check for priority change
  if (taskData.priority && taskData.priority !== task.priority) {
    history.push({
      user: userId,
      action: 'updated',
      field: 'priority',
      oldValue: task.priority,
      newValue: taskData.priority
    });
  }

  // Add history entries
  if (history.length > 0) {
    taskData.history = [...task.history, ...history];
  }

  return await Task.findByIdAndUpdate(
    taskId,
    taskData,
    { new: true, runValidators: true }
  )
    .populate('project', 'name code')
    .populate('assignedTo', 'employeeId')
    .populate({
      path: 'assignedTo',
      populate: {
        path: 'user',
        select: 'name email'
      }
    });
};

// Delete task
exports.deleteTask = async (taskId) => {
  // Check if there are time entries associated with this task
  const timeEntryCount = await TimeEntry.countDocuments({ task: taskId });

  if (timeEntryCount > 0) {
    throw new Error('Cannot delete task with time entries. Please delete or reassign time entries first.');
  }

  return await Task.findByIdAndDelete(taskId);
};

// Add comment to task
exports.addComment = async (taskId, commentData) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error('Task not found');
  }

  task.comments.push(commentData);

  // Add to history
  task.history.push({
    user: commentData.user,
    action: 'added',
    field: 'comment',
    newValue: commentData.text.substring(0, 50) + (commentData.text.length > 50 ? '...' : '')
  });

  return await task.save();
};

// Add subtask to task
exports.addSubtask = async (taskId, subtaskData, userId) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error('Task not found');
  }

  task.subtasks.push(subtaskData);

  // Add to history
  task.history.push({
    user: userId,
    action: 'added',
    field: 'subtask',
    newValue: subtaskData.title
  });

  return await task.save();
};

// Update subtask
exports.updateSubtask = async (taskId, subtaskId, subtaskData, userId) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error('Task not found');
  }

  const subtaskIndex = task.subtasks.findIndex(
    subtask => subtask._id.toString() === subtaskId
  );

  if (subtaskIndex === -1) {
    throw new Error('Subtask not found');
  }

  // Track changes for history
  if (subtaskData.status && subtaskData.status !== task.subtasks[subtaskIndex].status) {
    task.history.push({
      user: userId,
      action: 'updated',
      field: `subtask ${task.subtasks[subtaskIndex].title} status`,
      oldValue: task.subtasks[subtaskIndex].status,
      newValue: subtaskData.status
    });

    // If status changed to 'done', set completedDate
    if (subtaskData.status === 'done' && !subtaskData.completedDate) {
      subtaskData.completedDate = new Date();
    }
  }

  // Update subtask
  task.subtasks[subtaskIndex] = {
    ...task.subtasks[subtaskIndex].toObject(),
    ...subtaskData
  };

  // Update task progress based on subtasks
  const completedSubtasks = task.subtasks.filter(subtask => subtask.status === 'done').length;
  const totalSubtasks = task.subtasks.length;

  if (totalSubtasks > 0) {
    task.progress = Math.round((completedSubtasks / totalSubtasks) * 100);
  }

  return await task.save();
};

// Add watcher to task
exports.addWatcher = async (taskId, userId) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error('Task not found');
  }

  // Check if user is already a watcher
  if (task.watchers.includes(userId)) {
    return task;
  }

  task.watchers.push(userId);
  return await task.save();
};

// Remove watcher from task
exports.removeWatcher = async (taskId, userId) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error('Task not found');
  }

  task.watchers = task.watchers.filter(
    watcher => watcher.toString() !== userId.toString()
  );

  return await task.save();
};

// Get tasks by assignee
exports.getTasksByAssignee = async (employeeId, filters = {}) => {
  const query = { assignedTo: employeeId };

  // Apply filters if provided
  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;

  return await Task.find(query)
    .populate('project', 'name code')
    .sort({ dueDate: 1 });
};

// Search tasks
exports.searchTasks = async (searchTerm) => {
  return await Task.find({
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { taskNumber: { $regex: searchTerm, $options: 'i' } }
    ]
  })
    .populate('project', 'name code')
    .populate('assignedTo', 'employeeId')
    .populate({
      path: 'assignedTo',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .sort({ dueDate: 1 });
};

// Generate task number
exports.generateTaskNumber = async (projectId) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error('Project not found');
  }

  // Get count of tasks in this project
  const taskCount = await Task.countDocuments({ project: projectId });

  // Generate task number
  return `${project.code}-${(taskCount + 1).toString().padStart(3, '0')}`;
};

// Get tasks by project
exports.getTasksByProject = async (projectId, filters = {}) => {
  const query = { project: projectId };

  // Apply filters if provided
  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.assignedTo) query.assignedTo = filters.assignedTo;

  return await Task.find(query)
    .populate('assignedTo', 'employeeId')
    .populate({
      path: 'assignedTo',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('assignedBy', 'employeeId')
    .populate({
      path: 'assignedBy',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .sort({ dueDate: 1 });
};

// Update task status
exports.updateTaskStatus = async (taskId, status, userId) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error('Task not found');
  }

  // Add to history
  const historyEntry = {
    user: userId,
    action: 'updated',
    field: 'status',
    oldValue: task.status,
    newValue: status,
    date: new Date()
  };

  // If status changed to 'done', set completedDate
  let completedDate = task.completedDate;
  if (status === 'done' && !completedDate) {
    completedDate = new Date();
  }

  return await Task.findByIdAndUpdate(
    taskId,
    {
      status,
      completedDate,
      $push: { history: historyEntry }
    },
    { new: true, runValidators: true }
  )
    .populate('project', 'name code')
    .populate('assignedTo', 'employeeId')
    .populate({
      path: 'assignedTo',
      populate: {
        path: 'user',
        select: 'name email'
      }
    });
};

// Add subtask
exports.addSubtask = async (taskId, subtaskData) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error('Task not found');
  }

  // Create subtask object
  const subtask = {
    title: subtaskData.title,
    description: subtaskData.description,
    status: subtaskData.status || 'todo',
    assignedTo: subtaskData.assignedTo,
    dueDate: subtaskData.dueDate,
    createdBy: subtaskData.createdBy,
    createdAt: new Date()
  };

  // Add to history
  const historyEntry = {
    user: subtaskData.createdBy,
    action: 'added',
    field: 'subtask',
    newValue: subtaskData.title,
    date: new Date()
  };

  return await Task.findByIdAndUpdate(
    taskId,
    {
      $push: {
        subtasks: subtask,
        history: historyEntry
      }
    },
    { new: true, runValidators: true }
  )
    .populate('project', 'name code')
    .populate('assignedTo', 'employeeId')
    .populate({
      path: 'assignedTo',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('subtasks.assignedTo', 'employeeId')
    .populate({
      path: 'subtasks.assignedTo',
      populate: {
        path: 'user',
        select: 'name email'
      }
    });
};

// Update subtask
exports.updateSubtask = async (taskId, subtaskId, subtaskData) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error('Task not found');
  }

  // Find subtask index
  const subtaskIndex = task.subtasks.findIndex(st => st._id.toString() === subtaskId);

  if (subtaskIndex === -1) {
    throw new Error('Subtask not found');
  }

  // Update fields if provided
  if (subtaskData.title) task.subtasks[subtaskIndex].title = subtaskData.title;
  if (subtaskData.description !== undefined) task.subtasks[subtaskIndex].description = subtaskData.description;
  if (subtaskData.status) task.subtasks[subtaskIndex].status = subtaskData.status;
  if (subtaskData.assignedTo !== undefined) task.subtasks[subtaskIndex].assignedTo = subtaskData.assignedTo || null;
  if (subtaskData.dueDate !== undefined) task.subtasks[subtaskIndex].dueDate = subtaskData.dueDate;

  task.subtasks[subtaskIndex].updatedBy = subtaskData.updatedBy;
  task.subtasks[subtaskIndex].updatedAt = new Date();

  // Add to history
  const historyEntry = {
    user: subtaskData.updatedBy,
    action: 'updated',
    field: 'subtask',
    newValue: task.subtasks[subtaskIndex].title,
    date: new Date()
  };

  task.history.push(historyEntry);

  await task.save();

  return await Task.findById(taskId)
    .populate('project', 'name code')
    .populate('assignedTo', 'employeeId')
    .populate({
      path: 'assignedTo',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('subtasks.assignedTo', 'employeeId')
    .populate({
      path: 'subtasks.assignedTo',
      populate: {
        path: 'user',
        select: 'name email'
      }
    });
};

// Delete subtask
exports.deleteSubtask = async (taskId, subtaskId) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error('Task not found');
  }

  // Find subtask
  const subtask = task.subtasks.id(subtaskId);

  if (!subtask) {
    throw new Error('Subtask not found');
  }

  // Add to history
  const historyEntry = {
    action: 'deleted',
    field: 'subtask',
    oldValue: subtask.title,
    date: new Date()
  };

  // Remove subtask
  subtask.remove();

  // Add history entry
  task.history.push(historyEntry);

  await task.save();

  return await Task.findById(taskId)
    .populate('project', 'name code')
    .populate('assignedTo', 'employeeId')
    .populate({
      path: 'assignedTo',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('subtasks.assignedTo', 'employeeId')
    .populate({
      path: 'subtasks.assignedTo',
      populate: {
        path: 'user',
        select: 'name email'
      }
    });
};

// Add dependency
exports.addDependency = async (taskId, dependencyData) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error('Task not found');
  }

  // Check if dependency task exists
  const dependencyTask = await Task.findById(dependencyData.task);

  if (!dependencyTask) {
    throw new Error('Dependency task not found');
  }

  // Check if dependency already exists
  const existingDependency = task.dependencies?.find(dep =>
    dep.task.toString() === dependencyData.task && dep.type === dependencyData.type
  );

  if (existingDependency) {
    throw new Error('Dependency already exists');
  }

  // Create dependency object
  const dependency = {
    task: dependencyData.task,
    type: dependencyData.type,
    createdBy: dependencyData.createdBy,
    createdAt: new Date()
  };

  // Add to history
  const historyEntry = {
    user: dependencyData.createdBy,
    action: 'added',
    field: 'dependency',
    newValue: `${dependencyData.type} ${dependencyTask.taskNumber}`,
    date: new Date()
  };

  // Initialize dependencies array if it doesn't exist
  if (!task.dependencies) {
    task.dependencies = [];
  }

  // Add dependency
  task.dependencies.push(dependency);

  // Add history entry
  task.history.push(historyEntry);

  await task.save();

  return await Task.findById(taskId)
    .populate('project', 'name code')
    .populate('assignedTo', 'employeeId')
    .populate({
      path: 'assignedTo',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate({
      path: 'dependencies.task',
      select: 'title taskNumber status'
    });
};

// Remove dependency
exports.removeDependency = async (taskId, dependencyId) => {
  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error('Task not found');
  }

  // Find dependency
  const dependency = task.dependencies.id(dependencyId);

  if (!dependency) {
    throw new Error('Dependency not found');
  }

  // Get dependency task details for history
  const dependencyTask = await Task.findById(dependency.task);

  // Add to history
  const historyEntry = {
    action: 'removed',
    field: 'dependency',
    oldValue: `${dependency.type} ${dependencyTask ? dependencyTask.taskNumber : dependency.task}`,
    date: new Date()
  };

  // Remove dependency
  dependency.remove();

  // Add history entry
  task.history.push(historyEntry);

  await task.save();

  return await Task.findById(taskId)
    .populate('project', 'name code')
    .populate('assignedTo', 'employeeId')
    .populate({
      path: 'assignedTo',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate({
      path: 'dependencies.task',
      select: 'title taskNumber status'
    });
};

// Get task dependencies
exports.getTaskDependencies = async (taskId) => {
  const task = await Task.findById(taskId)
    .populate({
      path: 'dependencies.task',
      select: 'title taskNumber status'
    });

  if (!task) {
    throw new Error('Task not found');
  }

  return task.dependencies || [];
};
