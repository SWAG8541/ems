import apiClient from './apiClient';

// Get all departments
const getAllDepartments = async (params = {}) => {
  try {
    const response = await apiClient.get('departments', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

// Get department by ID
const getDepartmentById = async (id) => {
  const response = await apiClient.get(`departments/${id}`);
  return response.data;
};

// Create a new department
const createDepartment = async (departmentData) => {
  const response = await apiClient.post('departments', departmentData);
  return response.data;
};

// Update department
const updateDepartment = async (id, departmentData) => {
  const response = await apiClient.put(`departments/${id}`, departmentData);
  return response.data;
};

// Delete department
const deleteDepartment = async (id) => {
  const response = await apiClient.delete(`departments/${id}`);
  return response.data;
};

// Get department hierarchy
const getDepartmentHierarchy = async () => {
  const response = await apiClient.get('departments/hierarchy');
  return response.data;
};

// Get department statistics
const getDepartmentStatistics = async (id) => {
  const response = await apiClient.get(`departments/${id}/statistics`);
  return response.data;
};

const departmentService = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentHierarchy,
  getDepartmentStatistics
};

export default departmentService;
