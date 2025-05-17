const Role = require('../models/role.model');

// Create a new role with permissions
exports.createRole = async (roleData) => {
  // Check if role with same name already exists
  const existingRole = await Role.findOne({ name: roleData.name });
  if (existingRole) {
    throw new Error(`Role with name '${roleData.name}' already exists`);
  }

  // Create new role
  const role = new Role(roleData);
  return await role.save();
};

// Update an existing role
exports.updateRole = async (roleId, roleData) => {
  // Check if role exists
  const role = await Role.findById(roleId);
  if (!role) {
    throw new Error('Role not found');
  }

  // Check if name is being changed and if new name already exists
  if (roleData.name && roleData.name !== role.name) {
    const existingRole = await Role.findOne({ name: roleData.name });
    if (existingRole) {
      throw new Error(`Role with name '${roleData.name}' already exists`);
    }
  }

  // Update role
  return await Role.findByIdAndUpdate(
    roleId,
    roleData,
    { new: true, runValidators: true }
  );
};

// Get all roles with filtering and pagination
exports.getAllRoles = async (filters = {}) => {
  const query = {};

  // Apply filters if provided
  if (filters.name) {
    query.name = { $regex: filters.name, $options: 'i' };
  }

  // Set up pagination
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const skip = (page - 1) * limit;

  // Get total count for pagination
  const total = await Role.countDocuments(query);

  // Get roles with pagination
  const roles = await Role.find(query)
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit);

  return {
    roles,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

// Get one role by ID
exports.getRoleById = async (roleId) => {
  return await Role.findById(roleId);
};

// Delete a role by ID
exports.deleteRole = async (roleId) => {
  const result = await Role.findByIdAndDelete(roleId);
  return result; // Returns null if not found
};
