const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/task.controller');
const { protect } = require('../middleware/auth.middleware');
const { hasPermission } = require('../middleware/permission.middleware');

// Create a new task
router.post('/', protect, hasPermission('task', 'create'), TaskController.createTask);

// Get all tasks
router.get('/', protect, hasPermission('task', 'read'), TaskController.getAllTasks);

// Get task by ID
router.get('/:id', protect, hasPermission('task', 'read'), TaskController.getTaskById);

// Update task
router.put('/:id', protect, hasPermission('task', 'update'), TaskController.updateTask);

// Delete task
router.delete('/:id', protect, hasPermission('task', 'delete'), TaskController.deleteTask);

// Add comment to task
router.post('/:id/comments', protect, hasPermission('task', 'update'), TaskController.addComment);

// Add subtask to task
router.post('/:id/subtasks', protect, hasPermission('task', 'update'), TaskController.addSubtask);

// Update subtask
router.put('/:id/subtasks/:subtaskId', protect, hasPermission('task', 'update'), TaskController.updateSubtask);

// Add watcher to task
router.post('/:id/watchers', protect, hasPermission('task', 'read'), TaskController.addWatcher);

// Remove watcher from task
router.delete('/:id/watchers/:userId', protect, hasPermission('task', 'read'), TaskController.removeWatcher);

// Get tasks by assignee
router.get('/assignee/:employeeId', protect, hasPermission('task', 'read'), TaskController.getTasksByAssignee);

// Get tasks by project
router.get('/project/:projectId', protect, hasPermission('task', 'read'), TaskController.getTasksByProject);

// Search tasks
router.get('/search', protect, hasPermission('task', 'read'), TaskController.searchTasks);

// Update task status
router.patch('/:id/status', protect, hasPermission('task', 'update'), TaskController.updateTaskStatus);

// Subtasks routes
router.post('/:id/subtasks', protect, hasPermission('task', 'update'), TaskController.addSubtask);
router.put('/:id/subtasks/:subtaskId', protect, hasPermission('task', 'update'), TaskController.updateSubtask);
router.delete('/:id/subtasks/:subtaskId', protect, hasPermission('task', 'update'), TaskController.deleteSubtask);

// Dependencies routes
router.post('/:id/dependencies', protect, hasPermission('task', 'update'), TaskController.addDependency);
router.delete('/:id/dependencies/:dependencyId', protect, hasPermission('task', 'update'), TaskController.removeDependency);
router.get('/:id/dependencies', protect, hasPermission('task', 'read'), TaskController.getTaskDependencies);

module.exports = router;
