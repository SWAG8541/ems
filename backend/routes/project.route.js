const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/project.controller');
const { protect } = require('../middleware/auth.middleware');
const { hasPermission } = require('../middleware/permission.middleware');

// Create a new project
router.post('/', protect, hasPermission('project', 'create'), ProjectController.createProject);

// Get all projects
router.get('/', protect, hasPermission('project', 'read'), ProjectController.getAllProjects);

// Get project by ID
router.get('/:id', protect, hasPermission('project', 'read'), ProjectController.getProjectById);

// Update project
router.put('/:id', protect, hasPermission('project', 'update'), ProjectController.updateProject);

// Delete project
router.delete('/:id', protect, hasPermission('project', 'delete'), ProjectController.deleteProject);

// Add team member to project
router.post('/:id/team', protect, hasPermission('project', 'manage_team'), ProjectController.addTeamMember);

// Remove team member from project
router.delete('/:id/team/:employeeId', protect, hasPermission('project', 'manage_team'), ProjectController.removeTeamMember);

// Get project tasks
router.get('/:id/tasks', protect, hasPermission('project', 'read'), ProjectController.getProjectTasks);

// Get project time entries
router.get('/:id/time-entries', protect, hasPermission('project', 'read'), ProjectController.getProjectTimeEntries);

// Get project statistics
router.get('/:id/statistics', protect, hasPermission('project', 'view_reports'), ProjectController.getProjectStatistics);

// Search projects
router.get('/search', protect, hasPermission('project', 'read'), ProjectController.searchProjects);

module.exports = router;
