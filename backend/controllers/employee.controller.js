const EmployeeService = require('../services/employee.service');

// Create a new employee
exports.createEmployee = async (req, res) => {
  try {
    // Generate employee ID if not provided
    if (!req.body.employeeId) {
      req.body.employeeId = await EmployeeService.generateEmployeeId();
    }
    
    const employee = await EmployeeService.createEmployee(req.body);
    res.status(201).json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Error creating employee', error: err.message });
  }
};

// Get all employees with optional filtering
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await EmployeeService.getAllEmployees(req.query);
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching employees', error: err.message });
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await EmployeeService.getEmployeeById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.status(200).json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching employee', error: err.message });
  }
};

// Get employee by user ID
exports.getEmployeeByUserId = async (req, res) => {
  try {
    const employee = await EmployeeService.getEmployeeByUserId(req.params.userId);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.status(200).json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching employee', error: err.message });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const employee = await EmployeeService.updateEmployee(req.params.id, req.body);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.status(200).json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Error updating employee', error: err.message });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const result = await EmployeeService.deleteEmployee(req.params.id);
    
    if (!result) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting employee', error: err.message });
  }
};

// Get employees by department
exports.getEmployeesByDepartment = async (req, res) => {
  try {
    const employees = await EmployeeService.getEmployeesByDepartment(req.params.departmentId);
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching employees by department', error: err.message });
  }
};

// Get employees by manager
exports.getEmployeesByManager = async (req, res) => {
  try {
    const employees = await EmployeeService.getEmployeesByManager(req.params.managerId);
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching employees by manager', error: err.message });
  }
};

// Search employees
exports.searchEmployees = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search term is required' });
    }
    
    const employees = await EmployeeService.searchEmployees(q);
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Error searching employees', error: err.message });
  }
};

// Get employee count by status
exports.getEmployeeCountByStatus = async (req, res) => {
  try {
    const counts = await EmployeeService.getEmployeeCountByStatus();
    res.status(200).json(counts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching employee counts', error: err.message });
  }
};

// Get employee count by department
exports.getEmployeeCountByDepartment = async (req, res) => {
  try {
    const counts = await EmployeeService.getEmployeeCountByDepartment();
    res.status(200).json(counts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching employee counts by department', error: err.message });
  }
};

// Import employees from CSV/Excel
exports.importEmployees = async (req, res) => {
  try {
    if (!req.body || !Array.isArray(req.body)) {
      return res.status(400).json({ message: 'Invalid data format. Expected an array of employees.' });
    }
    
    const result = await EmployeeService.importEmployees(req.body);
    res.status(200).json({
      message: 'Employees imported successfully',
      count: result.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Error importing employees', error: err.message });
  }
};
