import apiClient from './apiClient';

// Create a new leave request
const createLeave = async (leaveData) => {
  const response = await apiClient.post('leaves', leaveData);
  return response.data;
};

// Get all leave requests with pagination and filtering
const getAllLeaves = async (params = {}) => {
  const response = await apiClient.get('leaves', { params });
  return response.data;
};

// Get leave request by ID
const getLeaveById = async (id) => {
  const response = await apiClient.get(`leaves/${id}`);
  return response.data;
};

// Update leave request
const updateLeave = async (id, leaveData) => {
  const response = await apiClient.put(`leaves/${id}`, leaveData);
  return response.data;
};

// Delete leave request
const deleteLeave = async (id) => {
  const response = await apiClient.delete(`leaves/${id}`);
  return response.data;
};

// Approve leave request
const approveLeave = async (id, comments = '') => {
  const response = await apiClient.post(`leaves/${id}/approve`, { comments });
  return response.data;
};

// Reject leave request
const rejectLeave = async (id, reason) => {
  const response = await apiClient.post(`leaves/${id}/reject`, { reason });
  return response.data;
};

// Cancel leave request
const cancelLeave = async (id, reason) => {
  const response = await apiClient.post(`leaves/${id}/cancel`, { reason });
  return response.data;
};

// Add comment to leave request
const addComment = async (leaveId, commentData) => {
  const response = await apiClient.post(`leaves/${leaveId}/comments`, commentData);
  return response.data;
};

// Get leave requests by employee
const getLeavesByEmployee = async (employeeId, params = {}) => {
  const response = await apiClient.get(`leaves/employee/${employeeId}`, { params });
  return response.data;
};

// Get leave statistics by employee
const getLeaveStatisticsByEmployee = async (employeeId, year = new Date().getFullYear()) => {
  const response = await apiClient.get(`leaves/employee/${employeeId}/statistics?year=${year}`);
  return response.data;
};

// Get pending leave requests for approval
const getPendingLeavesForApproval = async (managerId) => {
  const response = await apiClient.get(`leaves/pending-approval/${managerId}`);
  return response.data;
};

// Get employees by department
const getEmployeesByDepartment = async (departmentId) => {
  const response = await apiClient.get(`employees/department/${departmentId}`);
  return response.data;
};

const leaveService = {
  createLeave,
  getAllLeaves,
  getLeaveById,
  updateLeave,
  deleteLeave,
  approveLeave,
  rejectLeave,
  cancelLeave,
  addComment,
  getLeavesByEmployee,
  getLeaveStatisticsByEmployee,
  getPendingLeavesForApproval,
  getEmployeesByDepartment
};

export default leaveService;
