const RoleService = require('../services/role.service');

// Create a new role
exports.createRole = async (req, res) => {
  try {
    const role = await RoleService.createRole(req.body);
    res.status(201).json(role);
  } catch (err) {
    if (err.message.includes('already exists')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Error creating role', error: err.message });
  }
};

// Update an existing role
exports.updateRole = async (req, res) => {
  try {
    const role = await RoleService.updateRole(req.params.id, req.body);
    res.status(200).json(role);
  } catch (err) {
    if (err.message === 'Role not found') {
      return res.status(404).json({ message: err.message });
    }
    if (err.message.includes('already exists')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Error updating role', error: err.message });
  }
};

// Get all roles with filtering and pagination
exports.getAllRoles = async (req, res) => {
  try {
    const result = await RoleService.getAllRoles(req.query);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching roles', error: err.message });
  }
};

// Get one role
exports.getRoleById = async (req, res) => {
  try {
    const role = await RoleService.getRoleById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.status(200).json(role);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching role', error: err.message });
  }
};

// Delete a role
exports.deleteRole = async (req, res) => {
  try {
    const result = await RoleService.deleteRole(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.status(200).json({ message: 'Role deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting role', error: err.message });
  }
};
