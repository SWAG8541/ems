import apiClient from './apiClient';

// Get all employees with pagination and filtering
const getAllEmployees = async (params = {}) => {
  try {
    const response = await apiClient.get('employees', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};

// Get employee by ID
const getEmployeeById = async (id) => {
  const response = await apiClient.get(`employees/${id}`);
  return response.data;
};

// Get employee by user ID
const getEmployeeByUserId = async (userId) => {
  const response = await apiClient.get(`employees/user/${userId}`);
  return response.data;
};

// Create a new employee
const createEmployee = async (employeeData) => {
  try {
    const response = await apiClient.post('employees', employeeData);
    return response.data;
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
};

// Update employee
const updateEmployee = async (id, employeeData) => {
  const response = await apiClient.put(`employees/${id}`, employeeData);
  return response.data;
};

// Delete employee
const deleteEmployee = async (id) => {
  const response = await apiClient.delete(`employees/${id}`);
  return response.data;
};

// Get employee profile (for current logged-in employee)
const getEmployeeProfile = async () => {
  const response = await apiClient.get('employees/profile');
  return response.data;
};

// Get employees by department
const getEmployeesByDepartment = async (departmentId, params = {}) => {
  const response = await apiClient.get(`employees/department/${departmentId}`, { params });
  return response.data;
};

// Get employees by manager
const getEmployeesByManager = async (managerId, params = {}) => {
  const response = await apiClient.get(`employees/manager/${managerId}`, { params });
  return response.data;
};

// Search employees
const searchEmployees = async (query) => {
  const response = await apiClient.get(`employees/search?q=${query}`);
  return response.data;
};

// Upload employee document
const uploadDocument = async (employeeId, documentData) => {
  const formData = new FormData();
  formData.append('document', documentData.file);
  formData.append('name', documentData.name);
  formData.append('type', documentData.type);

  const response = await apiClient.post(`employees/${employeeId}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

// Delete employee document
const deleteDocument = async (employeeId, documentId) => {
  const response = await apiClient.delete(`employees/${employeeId}/documents/${documentId}`);
  return response.data;
};

// Add skill to employee
const addSkill = async (employeeId, skillData) => {
  const response = await apiClient.post(`employees/${employeeId}/skills`, skillData);
  return response.data;
};

// Update skill
const updateSkill = async (employeeId, skillId, skillData) => {
  const response = await apiClient.put(`employees/${employeeId}/skills/${skillId}`, skillData);
  return response.data;
};

// Delete skill
const deleteSkill = async (employeeId, skillId) => {
  const response = await apiClient.delete(`employees/${employeeId}/skills/${skillId}`);
  return response.data;
};

// Add education to employee
const addEducation = async (employeeId, educationData) => {
  const response = await apiClient.post(`employees/${employeeId}/education`, educationData);
  return response.data;
};

// Update education
const updateEducation = async (employeeId, educationId, educationData) => {
  const response = await apiClient.put(`employees/${employeeId}/education/${educationId}`, educationData);
  return response.data;
};

// Delete education
const deleteEducation = async (employeeId, educationId) => {
  const response = await apiClient.delete(`employees/${employeeId}/education/${educationId}`);
  return response.data;
};

// Add work experience to employee
const addWorkExperience = async (employeeId, experienceData) => {
  const response = await apiClient.post(`employees/${employeeId}/experience`, experienceData);
  return response.data;
};

// Update work experience
const updateWorkExperience = async (employeeId, experienceId, experienceData) => {
  const response = await apiClient.put(`employees/${employeeId}/experience/${experienceId}`, experienceData);
  return response.data;
};

// Delete work experience
const deleteWorkExperience = async (employeeId, experienceId) => {
  const response = await apiClient.delete(`employees/${employeeId}/experience/${experienceId}`);
  return response.data;
};

// Update leave balance
const updateLeaveBalance = async (employeeId, leaveBalanceData) => {
  const response = await apiClient.put(`employees/${employeeId}/leave-balance`, leaveBalanceData);
  return response.data;
};

// Update attendance settings
const updateAttendanceSettings = async (employeeId, settingsData) => {
  const response = await apiClient.put(`employees/${employeeId}/attendance-settings`, settingsData);
  return response.data;
};

const employeeService = {
  getAllEmployees,
  getEmployeeById,
  getEmployeeByUserId,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeProfile,
  getEmployeesByDepartment,
  getEmployeesByManager,
  searchEmployees,
  uploadDocument,
  deleteDocument,
  addSkill,
  updateSkill,
  deleteSkill,
  addEducation,
  updateEducation,
  deleteEducation,
  addWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
  updateLeaveBalance,
  updateAttendanceSettings
};

export default employeeService;
