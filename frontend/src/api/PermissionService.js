import apiClient from './apiClient';

// Get all permissions
const getAllPermissions = async () => {
  try {
    const response = await apiClient.get('permissions');
    return response.data;
  } catch (error) {
    console.error('Error fetching permissions:', error);
    throw error;
  }
};

// Get permissions by role ID
const getPermissionsByRole = async (roleId) => {
  try {
    const response = await apiClient.get(`permissions/role/${roleId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching permissions for role ${roleId}:`, error);
    throw error;
  }
};

// Update role permissions
const updateRolePermissions = async (roleId, permissions) => {
  try {
    const response = await apiClient.put(`permissions/role/${roleId}`, { permissions });
    return response.data;
  } catch (error) {
    console.error(`Error updating permissions for role ${roleId}:`, error);
    throw error;
  }
};

const permissionService = {
  getAllPermissions,
  getPermissionsByRole,
  updateRolePermissions
};

export default permissionService;
