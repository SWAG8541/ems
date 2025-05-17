const DesignationService = require('../services/designation.service');

// Create a new designation
exports.createDesignation = async (req, res) => {
  try {
    const designation = await DesignationService.createDesignation(req.body);
    res.status(201).json(designation);
  } catch (err) {
    res.status(500).json({ message: 'Error creating designation', error: err.message });
  }
};

// Get all designations with optional filtering
exports.getAllDesignations = async (req, res) => {
  try {
    const designations = await DesignationService.getAllDesignations(req.query);
    res.status(200).json(designations);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching designations', error: err.message });
  }
};

// Get designation by ID
exports.getDesignationById = async (req, res) => {
  try {
    const designation = await DesignationService.getDesignationById(req.params.id);
    
    if (!designation) {
      return res.status(404).json({ message: 'Designation not found' });
    }
    
    res.status(200).json(designation);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching designation', error: err.message });
  }
};

// Update designation
exports.updateDesignation = async (req, res) => {
  try {
    const designation = await DesignationService.updateDesignation(req.params.id, req.body);
    
    if (!designation) {
      return res.status(404).json({ message: 'Designation not found' });
    }
    
    res.status(200).json(designation);
  } catch (err) {
    res.status(500).json({ message: 'Error updating designation', error: err.message });
  }
};

// Delete designation
exports.deleteDesignation = async (req, res) => {
  try {
    const result = await DesignationService.deleteDesignation(req.params.id);
    
    if (!result) {
      return res.status(404).json({ message: 'Designation not found' });
    }
    
    res.status(200).json({ message: 'Designation deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting designation', error: err.message });
  }
};

// Get designations by department
exports.getDesignationsByDepartment = async (req, res) => {
  try {
    const designations = await DesignationService.getDesignationsByDepartment(req.params.departmentId);
    res.status(200).json(designations);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching designations by department', error: err.message });
  }
};

// Search designations
exports.searchDesignations = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search term is required' });
    }
    
    const designations = await DesignationService.searchDesignations(q);
    res.status(200).json(designations);
  } catch (err) {
    res.status(500).json({ message: 'Error searching designations', error: err.message });
  }
};
