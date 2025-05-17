const Designation = require('../models/designation.model');
const Employee = require('../models/employee.model');

// Create a new designation
exports.createDesignation = async (designationData) => {
  const designation = new Designation(designationData);
  return await designation.save();
};

// Get all designations with optional filtering
exports.getAllDesignations = async (filters = {}) => {
  const query = {};
  
  // Apply filters if provided
  if (filters.status) query.status = filters.status;
  if (filters.department) query.department = filters.department;
  
  return await Designation.find(query)
    .populate('department', 'name')
    .sort({ name: 1 });
};

// Get designation by ID
exports.getDesignationById = async (designationId) => {
  return await Designation.findById(designationId)
    .populate('department', 'name');
};

// Update designation
exports.updateDesignation = async (designationId, designationData) => {
  return await Designation.findByIdAndUpdate(
    designationId,
    designationData,
    { new: true, runValidators: true }
  )
    .populate('department', 'name');
};

// Delete designation
exports.deleteDesignation = async (designationId) => {
  // Check if there are employees with this designation
  const employeeCount = await Employee.countDocuments({ position: designationId });
  
  if (employeeCount > 0) {
    throw new Error('Cannot delete designation with assigned employees. Please reassign employees first.');
  }
  
  return await Designation.findByIdAndDelete(designationId);
};

// Get designations by department
exports.getDesignationsByDepartment = async (departmentId) => {
  return await Designation.find({ department: departmentId })
    .sort({ name: 1 });
};

// Search designations
exports.searchDesignations = async (searchTerm) => {
  return await Designation.find({
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } }
    ]
  })
    .populate('department', 'name')
    .sort({ name: 1 });
};
