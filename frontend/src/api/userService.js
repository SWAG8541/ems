import apiClient from './apiClient';

// Get all users with pagination and filtering
const getAllUsers = async (params = {}) => {
  const response = await apiClient.get('users', { params });
  return response.data;
};

// Get user by ID
const getUserById = async (id) => {
  const response = await apiClient.get(`users/${id}`);
  return response.data;
};

// Create a new user
const createUser = async (userData) => {
  const response = await apiClient.post('users', userData);
  return response.data;
};

// Update user
const updateUser = async (id, userData) => {
  const response = await apiClient.put(`users/${id}`, userData);
  return response.data;
};

// Delete user
const deleteUser = async (id) => {
  const response = await apiClient.delete(`users/${id}`);
  return response.data;
};

// Search users
const searchUsers = async (query) => {
  const response = await apiClient.get(`users/search?q=${query}`);
  return response.data;
};

// Get users without employees
const getUsersWithoutEmployees = async () => {
  try {
    const response = await apiClient.get('users/without-employees');
    return response.data;
  } catch (error) {
    console.error('Error fetching users without employees:', error);
    throw error;
  }
};

// Get managers
const getManagers = async () => {
  try {
    const response = await apiClient.get('users/managers');
    return response.data;
  } catch (error) {
    console.error('Error fetching managers:', error);
    throw error;
  }
};

const userService = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
  getUsersWithoutEmployees,
  getManagers
};

export default userService;
