const ProjectService = require('../services/project.service');

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const project = await ProjectService.createProject(req.body);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Error creating project', error: err.message });
  }
};

// Get all projects with optional filtering
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await ProjectService.getAllProjects(req.query);
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching projects', error: err.message });
  }
};

// Get project by ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await ProjectService.getProjectById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching project', error: err.message });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const project = await ProjectService.updateProject(req.params.id, req.body);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Error updating project', error: err.message });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const result = await ProjectService.deleteProject(req.params.id);
    
    if (!result) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting project', error: err.message });
  }
};

// Add team member to project
exports.addTeamMember = async (req, res) => {
  try {
    const project = await ProjectService.addTeamMember(req.params.id, req.body);
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Error adding team member', error: err.message });
  }
};

// Remove team member from project
exports.removeTeamMember = async (req, res) => {
  try {
    const project = await ProjectService.removeTeamMember(req.params.id, req.params.employeeId);
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Error removing team member', error: err.message });
  }
};

// Get project tasks
exports.getProjectTasks = async (req, res) => {
  try {
    const tasks = await ProjectService.getProjectTasks(req.params.id, req.query);
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching project tasks', error: err.message });
  }
};

// Get project time entries
exports.getProjectTimeEntries = async (req, res) => {
  try {
    const timeEntries = await ProjectService.getProjectTimeEntries(req.params.id, req.query);
    res.status(200).json(timeEntries);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching project time entries', error: err.message });
  }
};

// Get project statistics
exports.getProjectStatistics = async (req, res) => {
  try {
    const statistics = await ProjectService.getProjectStatistics(req.params.id);
    res.status(200).json(statistics);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching project statistics', error: err.message });
  }
};

// Search projects
exports.searchProjects = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search term is required' });
    }
    
    const projects = await ProjectService.searchProjects(q);
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Error searching projects', error: err.message });
  }
};
