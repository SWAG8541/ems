const express = require('express');
const router = express.Router();
const EmployeeController = require('../controllers/employee.controller');
const { protect } = require('../middleware/auth.middleware');
const { hasPermission } = require('../middleware/permission.middleware');

// Create a new employee
router.post('/', protect, hasPermission('employee', 'create'), EmployeeController.createEmployee);

// Get all employees
router.get('/', protect, hasPermission('employee', 'read'), EmployeeController.getAllEmployees);

// Get employee by ID
router.get('/:id', protect, hasPermission('employee', 'read'), EmployeeController.getEmployeeById);

// Get employee by user ID
router.get('/user/:userId', protect, hasPermission('employee', 'read'), EmployeeController.getEmployeeByUserId);

// Update employee
router.put('/:id', protect, hasPermission('employee', 'update'), EmployeeController.updateEmployee);

// Delete employee
router.delete('/:id', protect, hasPermission('employee', 'delete'), EmployeeController.deleteEmployee);

// Get employees by department
router.get('/department/:departmentId', protect, hasPermission('employee', 'read'), EmployeeController.getEmployeesByDepartment);

// Get employees by manager
router.get('/manager/:managerId', protect, hasPermission('employee', 'read'), EmployeeController.getEmployeesByManager);

// Search employees
router.get('/search', protect, hasPermission('employee', 'read'), EmployeeController.searchEmployees);

// Get employee count by status
router.get('/stats/by-status', protect, hasPermission('employee', 'read'), EmployeeController.getEmployeeCountByStatus);

// Get employee count by department
router.get('/stats/by-department', protect, hasPermission('employee', 'read'), EmployeeController.getEmployeeCountByDepartment);

// Import employees
router.post('/import', protect, hasPermission('employee', 'import'), EmployeeController.importEmployees);

module.exports = router;
