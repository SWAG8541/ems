import apiClient from './apiClient';

// Get all designations
const getAllDesignations = async (params = {}) => {
  try {
    const response = await apiClient.get('designations', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching designations:', error);
    throw error;
  }
};

// Get designation by ID
const getDesignationById = async (id) => {
  const response = await apiClient.get(`designations/${id}`);
  return response.data;
};

// Create a new designation
const createDesignation = async (designationData) => {
  const response = await apiClient.post('designations', designationData);
  return response.data;
};

// Update designation
const updateDesignation = async (id, designationData) => {
  const response = await apiClient.put(`designations/${id}`, designationData);
  return response.data;
};

// Delete designation
const deleteDesignation = async (id) => {
  const response = await apiClient.delete(`designations/${id}`);
  return response.data;
};

// Get designations by department
const getDesignationsByDepartment = async (departmentId) => {
  const response = await apiClient.get(`designations/department/${departmentId}`);
  return response.data;
};

// Search designations
const searchDesignations = async (query) => {
  const response = await apiClient.get(`designations/search?q=${query}`);
  return response.data;
};

const designationService = {
  getAllDesignations,
  getDesignationById,
  createDesignation,
  updateDesignation,
  deleteDesignation,
  getDesignationsByDepartment,
  searchDesignations
};

export default designationService;
