import apiClient from './apiClient';

// Get all roles
const getAllRoles = async () => {
  const response = await apiClient.get('roles');
  return response.data;
};

// Get role by ID
const getRoleById = async (id) => {
  const response = await apiClient.get(`roles/${id}`);
  return response.data;
};

// Create a new role
const createRole = async (roleData) => {
  const response = await apiClient.post('roles', roleData);
  return response.data;
};

// Update role
const updateRole = async (id, roleData) => {
  const response = await apiClient.put(`roles/${id}`, roleData);
  return response.data;
};

// Delete role
const deleteRole = async (id) => {
  const response = await apiClient.delete(`roles/${id}`);
  return response.data;
};

// Get all permissions
const getAllPermissions = async () => {
  const response = await apiClient.get('permissions');
  return response.data;
};

// Seed permissions (admin only)
const seedPermissions = async () => {
  const response = await apiClient.post('permissions/seed');
  return response.data;
};

const roleService = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getAllPermissions,
  seedPermissions
};

export default roleService;
