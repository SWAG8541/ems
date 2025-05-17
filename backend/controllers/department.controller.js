const DepartmentService = require('../services/department.service');

// Create a new department
exports.createDepartment = async (req, res) => {
  try {
    const department = await DepartmentService.createDepartment(req.body);
    res.status(201).json(department);
  } catch (err) {
    res.status(500).json({ message: 'Error creating department', error: err.message });
  }
};

// Get all departments with optional filtering
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await DepartmentService.getAllDepartments(req.query);
    res.status(200).json(departments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching departments', error: err.message });
  }
};

// Get department by ID
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await DepartmentService.getDepartmentById(req.params.id);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    res.status(200).json(department);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching department', error: err.message });
  }
};

// Update department
exports.updateDepartment = async (req, res) => {
  try {
    const department = await DepartmentService.updateDepartment(req.params.id, req.body);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    res.status(200).json(department);
  } catch (err) {
    res.status(500).json({ message: 'Error updating department', error: err.message });
  }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
  try {
    const result = await DepartmentService.deleteDepartment(req.params.id);
    
    if (!result) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    res.status(200).json({ message: 'Department deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting department', error: err.message });
  }
};

// Get department hierarchy
exports.getDepartmentHierarchy = async (req, res) => {
  try {
    const hierarchy = await DepartmentService.getDepartmentHierarchy();
    res.status(200).json(hierarchy);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching department hierarchy', error: err.message });
  }
};

// Get departments with employee count
exports.getDepartmentsWithEmployeeCount = async (req, res) => {
  try {
    const departments = await DepartmentService.getDepartmentsWithEmployeeCount();
    res.status(200).json(departments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching departments with employee count', error: err.message });
  }
};

// Search departments
exports.searchDepartments = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search term is required' });
    }
    
    const departments = await DepartmentService.searchDepartments(q);
    res.status(200).json(departments);
  } catch (err) {
    res.status(500).json({ message: 'Error searching departments', error: err.message });
  }
};
