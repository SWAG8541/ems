const Employee = require('../models/employee.model');
const User = require('../models/user.model');
const Department = require('../models/department.model');

// Create a new employee
exports.createEmployee = async (employeeData) => {
  const employee = new Employee(employeeData);
  return await employee.save();
};

// Get all employees with optional filtering
exports.getAllEmployees = async (filters = {}) => {
  const query = {};
  
  // Apply filters if provided
  if (filters.status) query.status = filters.status;
  if (filters.department) query.department = filters.department;
  if (filters.position) query.position = { $regex: filters.position, $options: 'i' };
  if (filters.manager) query.manager = filters.manager;
  
  return await Employee.find(query)
    .populate('user', 'name email')
    .populate('department', 'name')
    .populate('manager', 'employeeId')
    .sort({ employeeId: 1 });
};

// Get employee by ID
exports.getEmployeeById = async (employeeId) => {
  return await Employee.findById(employeeId)
    .populate('user', 'name email')
    .populate('department', 'name')
    .populate('manager', 'employeeId user')
    .populate({
      path: 'manager',
      populate: {
        path: 'user',
        select: 'name email'
      }
    });
};

// Get employee by user ID
exports.getEmployeeByUserId = async (userId) => {
  return await Employee.findOne({ user: userId })
    .populate('user', 'name email')
    .populate('department', 'name')
    .populate('manager', 'employeeId user')
    .populate({
      path: 'manager',
      populate: {
        path: 'user',
        select: 'name email'
      }
    });
};

// Update employee
exports.updateEmployee = async (employeeId, employeeData) => {
  return await Employee.findByIdAndUpdate(
    employeeId,
    employeeData,
    { new: true, runValidators: true }
  )
    .populate('user', 'name email')
    .populate('department', 'name')
    .populate('manager', 'employeeId user')
    .populate({
      path: 'manager',
      populate: {
        path: 'user',
        select: 'name email'
      }
    });
};

// Delete employee
exports.deleteEmployee = async (employeeId) => {
  return await Employee.findByIdAndDelete(employeeId);
};

// Get employees by department
exports.getEmployeesByDepartment = async (departmentId) => {
  return await Employee.find({ department: departmentId })
    .populate('user', 'name email')
    .sort({ employeeId: 1 });
};

// Get employees by manager
exports.getEmployeesByManager = async (managerId) => {
  return await Employee.find({ manager: managerId })
    .populate('user', 'name email')
    .populate('department', 'name')
    .sort({ employeeId: 1 });
};

// Search employees
exports.searchEmployees = async (searchTerm) => {
  // First search in User model for name and email
  const users = await User.find({
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } }
    ]
  }).select('_id');
  
  const userIds = users.map(user => user._id);
  
  // Then search in Employee model
  return await Employee.find({
    $or: [
      { user: { $in: userIds } },
      { employeeId: { $regex: searchTerm, $options: 'i' } },
      { position: { $regex: searchTerm, $options: 'i' } }
    ]
  })
    .populate('user', 'name email')
    .populate('department', 'name')
    .sort({ employeeId: 1 });
};

// Get employee count by status
exports.getEmployeeCountByStatus = async () => {
  return await Employee.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Get employee count by department
exports.getEmployeeCountByDepartment = async () => {
  const departments = await Department.find().select('_id name');
  const counts = await Promise.all(
    departments.map(async (dept) => {
      const count = await Employee.countDocuments({ department: dept._id });
      return {
        department: dept.name,
        count
      };
    })
  );
  
  return counts;
};

// Import employees from CSV/Excel
exports.importEmployees = async (employeesData) => {
  // This would handle validation and bulk insert
  const result = await Employee.insertMany(employeesData, { ordered: false });
  return result;
};

// Generate employee ID
exports.generateEmployeeId = async (prefix = 'EMP') => {
  const lastEmployee = await Employee.findOne().sort({ employeeId: -1 });
  
  if (!lastEmployee) {
    return `${prefix}001`;
  }
  
  const lastId = lastEmployee.employeeId;
  const numericPart = lastId.replace(/^\D+/g, '');
  const nextNumericPart = parseInt(numericPart, 10) + 1;
  
  return `${prefix}${nextNumericPart.toString().padStart(3, '0')}`;
};
