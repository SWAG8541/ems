const Project = require('../models/project.model');
const Task = require('../models/task.model');
const TimeEntry = require('../models/timeEntry.model');

// Create a new project
exports.createProject = async (projectData) => {
  // Generate project code if not provided
  if (!projectData.code) {
    projectData.code = await this.generateProjectCode(projectData.name);
  }
  
  const project = new Project(projectData);
  return await project.save();
};

// Get all projects with optional filtering
exports.getAllProjects = async (filters = {}) => {
  const query = {};
  
  // Apply filters if provided
  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.manager) query.manager = filters.manager;
  if (filters.department) query.department = filters.department;
  if (filters.startDate && filters.endDate) {
    query.startDate = { $gte: new Date(filters.startDate) };
    query.endDate = { $lte: new Date(filters.endDate) };
  }
  
  return await Project.find(query)
    .populate('manager', 'employeeId')
    .populate({
      path: 'manager',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('department', 'name')
    .sort({ startDate: -1 });
};

// Get project by ID
exports.getProjectById = async (projectId) => {
  return await Project.findById(projectId)
    .populate('manager', 'employeeId')
    .populate({
      path: 'manager',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('department', 'name')
    .populate({
      path: 'team.employee',
      populate: {
        path: 'user',
        select: 'name email'
      }
    });
};

// Update project
exports.updateProject = async (projectId, projectData) => {
  return await Project.findByIdAndUpdate(
    projectId,
    projectData,
    { new: true, runValidators: true }
  )
    .populate('manager', 'employeeId')
    .populate({
      path: 'manager',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('department', 'name');
};

// Delete project
exports.deleteProject = async (projectId) => {
  // Check if there are tasks associated with this project
  const taskCount = await Task.countDocuments({ project: projectId });
  
  if (taskCount > 0) {
    throw new Error('Cannot delete project with associated tasks. Please delete or reassign tasks first.');
  }
  
  // Check if there are time entries associated with this project
  const timeEntryCount = await TimeEntry.countDocuments({ project: projectId });
  
  if (timeEntryCount > 0) {
    throw new Error('Cannot delete project with time entries. Please delete or reassign time entries first.');
  }
  
  return await Project.findByIdAndDelete(projectId);
};

// Add team member to project
exports.addTeamMember = async (projectId, teamMemberData) => {
  const project = await Project.findById(projectId);
  
  if (!project) {
    throw new Error('Project not found');
  }
  
  // Check if employee is already in the team
  const existingMember = project.team.find(
    member => member.employee.toString() === teamMemberData.employee.toString()
  );
  
  if (existingMember) {
    throw new Error('Employee is already a team member');
  }
  
  project.team.push(teamMemberData);
  return await project.save();
};

// Remove team member from project
exports.removeTeamMember = async (projectId, employeeId) => {
  const project = await Project.findById(projectId);
  
  if (!project) {
    throw new Error('Project not found');
  }
  
  // Check if employee is in the team
  const memberIndex = project.team.findIndex(
    member => member.employee.toString() === employeeId.toString()
  );
  
  if (memberIndex === -1) {
    throw new Error('Employee is not a team member');
  }
  
  // Check if there are tasks assigned to this team member
  const taskCount = await Task.countDocuments({
    project: projectId,
    assignedTo: employeeId
  });
  
  if (taskCount > 0) {
    throw new Error('Cannot remove team member with assigned tasks. Please reassign tasks first.');
  }
  
  project.team.splice(memberIndex, 1);
  return await project.save();
};

// Get project tasks
exports.getProjectTasks = async (projectId, filters = {}) => {
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
    .sort({ dueDate: 1 });
};

// Get project time entries
exports.getProjectTimeEntries = async (projectId, filters = {}) => {
  const query = { project: projectId };
  
  // Apply filters if provided
  if (filters.employee) query.employee = filters.employee;
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
    .populate('task', 'title taskNumber')
    .sort({ date: -1 });
};

// Get project statistics
exports.getProjectStatistics = async (projectId) => {
  const project = await Project.findById(projectId);
  
  if (!project) {
    throw new Error('Project not found');
  }
  
  // Get task statistics
  const taskStats = await Task.aggregate([
    { $match: { project: project._id } },
    { $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Get time entry statistics
  const timeEntryStats = await TimeEntry.aggregate([
    { $match: { project: project._id } },
    { $group: {
        _id: null,
        totalHours: { $sum: '$duration' },
        billableHours: { $sum: { $cond: [{ $eq: ['$billable', true] }, '$duration', 0] } }
      }
    }
  ]);
  
  // Calculate project progress
  const totalTasks = await Task.countDocuments({ project: project._id });
  const completedTasks = await Task.countDocuments({
    project: project._id,
    status: 'done'
  });
  
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Update project progress
  project.progress = progress;
  await project.save();
  
  return {
    taskStats: taskStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {}),
    timeStats: timeEntryStats.length > 0 ? {
      totalHours: timeEntryStats[0].totalHours / 60, // Convert minutes to hours
      billableHours: timeEntryStats[0].billableHours / 60 // Convert minutes to hours
    } : {
      totalHours: 0,
      billableHours: 0
    },
    progress,
    teamSize: project.team.length
  };
};

// Search projects
exports.searchProjects = async (searchTerm) => {
  return await Project.find({
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { code: { $regex: searchTerm, $options: 'i' } },
      { 'client.name': { $regex: searchTerm, $options: 'i' } }
    ]
  })
    .populate('manager', 'employeeId')
    .populate({
      path: 'manager',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('department', 'name')
    .sort({ startDate: -1 });
};

// Generate project code
exports.generateProjectCode = async (projectName) => {
  // Extract initials from project name
  const initials = projectName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('');
  
  // Get current year
  const year = new Date().getFullYear().toString().substr(-2);
  
  // Get count of projects this year
  const projectCount = await Project.countDocuments({
    code: { $regex: `^${initials}${year}` }
  });
  
  // Generate code
  return `${initials}${year}${(projectCount + 1).toString().padStart(3, '0')}`;
};
