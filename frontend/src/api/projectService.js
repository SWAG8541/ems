import apiClient from './apiClient';

// Get all projects with pagination and filtering
const getAllProjects = async (params = {}) => {
  const response = await apiClient.get('projects', { params });
  return response.data;
};

// Get project by ID
const getProjectById = async (id) => {
  const response = await apiClient.get(`projects/${id}`);
  return response.data;
};

// Create a new project
const createProject = async (projectData) => {
  const response = await apiClient.post('projects', projectData);
  return response.data;
};

// Update project
const updateProject = async (id, projectData) => {
  const response = await apiClient.put(`projects/${id}`, projectData);
  return response.data;
};

// Delete project
const deleteProject = async (id) => {
  const response = await apiClient.delete(`projects/${id}`);
  return response.data;
};

// Add team member to project
const addTeamMember = async (projectId, memberData) => {
  const response = await apiClient.post(`projects/${projectId}/team`, memberData);
  return response.data;
};

// Remove team member from project
const removeTeamMember = async (projectId, memberId) => {
  const response = await apiClient.delete(`projects/${projectId}/team/${memberId}`);
  return response.data;
};

// Update entire project team
const updateProjectTeam = async (projectId, teamData) => {
  const response = await apiClient.put(`projects/${projectId}/team`, teamData);
  return response.data;
};

// Get project statistics
const getProjectStats = async (projectId) => {
  const response = await apiClient.get(`projects/${projectId}/stats`);
  return response.data;
};

// Search projects
const searchProjects = async (query) => {
  const response = await apiClient.get(`projects/search?q=${query}`);
  return response.data;
};

// Get project tasks
const getProjectTasks = async (projectId) => {
  const response = await apiClient.get(`projects/${projectId}/tasks`);
  return response.data;
};

// Get projects by employee
const getProjectsByEmployee = async (employeeId) => {
  const response = await apiClient.get(`projects/employee/${employeeId}`);
  return response.data;
};

// Get projects by department
const getProjectsByDepartment = async (departmentId) => {
  const response = await apiClient.get(`projects/department/${departmentId}`);
  return response.data;
};

const projectService = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
  updateProjectTeam,
  getProjectStats,
  searchProjects,
  getProjectTasks,
  getProjectsByEmployee,
  getProjectsByDepartment
};

export default projectService;
