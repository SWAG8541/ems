import apiClient from './apiClient';

// Get all tasks with pagination and filtering
const getAllTasks = async (params = {}) => {
  const response = await apiClient.get('tasks', { params });
  return response.data;
};

// Get task by ID
const getTaskById = async (id) => {
  const response = await apiClient.get(`tasks/${id}`);
  return response.data;
};

// Create a new task
const createTask = async (taskData) => {
  const response = await apiClient.post('tasks', taskData);
  return response.data;
};

// Update task
const updateTask = async (id, taskData) => {
  const response = await apiClient.put(`tasks/${id}`, taskData);
  return response.data;
};

// Delete task
const deleteTask = async (id) => {
  const response = await apiClient.delete(`tasks/${id}`);
  return response.data;
};

// Add comment to task
const addComment = async (taskId, commentData) => {
  const response = await apiClient.post(`tasks/${taskId}/comments`, commentData);
  return response.data;
};

// Get tasks by assignee
const getTasksByAssignee = async (employeeId, params = {}) => {
  const response = await apiClient.get(`tasks/assignee/${employeeId}`, { params });
  return response.data;
};

// Get tasks by project
const getTasksByProject = async (projectId, params = {}) => {
  const response = await apiClient.get(`tasks/project/${projectId}`, { params });
  return response.data;
};

// Search tasks
const searchTasks = async (query) => {
  const response = await apiClient.get(`tasks/search?q=${query}`);
  return response.data;
};

// Update task status
const updateTaskStatus = async (taskId, status) => {
  const response = await apiClient.patch(`tasks/${taskId}/status`, { status });
  return response.data;
};

// Add subtask
const addSubtask = async (taskId, subtaskData) => {
  const response = await apiClient.post(`tasks/${taskId}/subtasks`, subtaskData);
  return response.data;
};

// Update subtask
const updateSubtask = async (taskId, subtaskId, subtaskData) => {
  const response = await apiClient.put(`tasks/${taskId}/subtasks/${subtaskId}`, subtaskData);
  return response.data;
};

// Delete subtask
const deleteSubtask = async (taskId, subtaskId) => {
  const response = await apiClient.delete(`tasks/${taskId}/subtasks/${subtaskId}`);
  return response.data;
};

// Add dependency
const addDependency = async (taskId, dependencyData) => {
  const response = await apiClient.post(`tasks/${taskId}/dependencies`, dependencyData);
  return response.data;
};

// Remove dependency
const removeDependency = async (taskId, dependencyId) => {
  const response = await apiClient.delete(`tasks/${taskId}/dependencies/${dependencyId}`);
  return response.data;
};

// Get task dependencies
const getTaskDependencies = async (taskId) => {
  const response = await apiClient.get(`tasks/${taskId}/dependencies`);
  return response.data;
};

// Get task statistics
const getTaskStatistics = async (params = {}) => {
  const response = await apiClient.get('tasks/statistics', { params });
  return response.data;
};

const taskService = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  getTasksByAssignee,
  getTasksByProject,
  searchTasks,
  updateTaskStatus,
  addSubtask,
  updateSubtask,
  deleteSubtask,
  addDependency,
  removeDependency,
  getTaskDependencies,
  getTaskStatistics
};

export default taskService;
