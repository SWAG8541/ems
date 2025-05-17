const Department = require('../models/department.model');
const Employee = require('../models/employee.model');

// Create a new department
exports.createDepartment = async (departmentData) => {
  const department = new Department(departmentData);
  return await department.save();
};

// Get all departments with optional filtering
exports.getAllDepartments = async (filters = {}) => {
  const query = {};
  
  // Apply filters if provided
  if (filters.status) query.status = filters.status;
  if (filters.parentDepartment) query.parentDepartment = filters.parentDepartment;
  
  return await Department.find(query)
    .populate('manager', 'employeeId')
    .populate({
      path: 'manager',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('parentDepartment', 'name')
    .sort({ name: 1 });
};

// Get department by ID
exports.getDepartmentById = async (departmentId) => {
  return await Department.findById(departmentId)
    .populate('manager', 'employeeId')
    .populate({
      path: 'manager',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('parentDepartment', 'name');
};

// Update department
exports.updateDepartment = async (departmentId, departmentData) => {
  return await Department.findByIdAndUpdate(
    departmentId,
    departmentData,
    { new: true, runValidators: true }
  )
    .populate('manager', 'employeeId')
    .populate({
      path: 'manager',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('parentDepartment', 'name');
};

// Delete department
exports.deleteDepartment = async (departmentId) => {
  // Check if there are employees in this department
  const employeeCount = await Employee.countDocuments({ department: departmentId });
  
  if (employeeCount > 0) {
    throw new Error('Cannot delete department with employees. Please reassign employees first.');
  }
  
  // Check if there are child departments
  const childDepartments = await Department.countDocuments({ parentDepartment: departmentId });
  
  if (childDepartments > 0) {
    throw new Error('Cannot delete department with child departments. Please reassign or delete child departments first.');
  }
  
  return await Department.findByIdAndDelete(departmentId);
};

// Get department hierarchy
exports.getDepartmentHierarchy = async () => {
  // Get all departments
  const allDepartments = await Department.find()
    .populate('manager', 'employeeId')
    .populate({
      path: 'manager',
      populate: {
        path: 'user',
        select: 'name email'
      }
    });
  
  // Build hierarchy
  const departmentMap = {};
  const rootDepartments = [];
  
  // First, create a map of departments by ID
  allDepartments.forEach(dept => {
    departmentMap[dept._id] = {
      ...dept.toObject(),
      children: []
    };
  });
  
  // Then, build the hierarchy
  allDepartments.forEach(dept => {
    if (dept.parentDepartment) {
      // This is a child department
      if (departmentMap[dept.parentDepartment]) {
        departmentMap[dept.parentDepartment].children.push(departmentMap[dept._id]);
      }
    } else {
      // This is a root department
      rootDepartments.push(departmentMap[dept._id]);
    }
  });
  
  return rootDepartments;
};

// Get department with employee count
exports.getDepartmentsWithEmployeeCount = async () => {
  const departments = await Department.find().select('_id name status');
  
  const result = await Promise.all(
    departments.map(async (dept) => {
      const employeeCount = await Employee.countDocuments({ department: dept._id });
      return {
        _id: dept._id,
        name: dept.name,
        status: dept.status,
        employeeCount
      };
    })
  );
  
  return result;
};

// Search departments
exports.searchDepartments = async (searchTerm) => {
  return await Department.find({
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } }
    ]
  })
    .populate('manager', 'employeeId')
    .populate({
      path: 'manager',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('parentDepartment', 'name')
    .sort({ name: 1 });
};
