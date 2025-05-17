const express = require('express');
const router = express.Router();
const DepartmentController = require('../controllers/department.controller');
const { protect } = require('../middleware/auth.middleware');
const { hasPermission } = require('../middleware/permission.middleware');

// Create a new department
router.post('/', protect, hasPermission('department', 'create'), DepartmentController.createDepartment);

// Get all departments
router.get('/', protect, hasPermission('department', 'read'), DepartmentController.getAllDepartments);

// Get department by ID
router.get('/:id', protect, hasPermission('department', 'read'), DepartmentController.getDepartmentById);

// Update department
router.put('/:id', protect, hasPermission('department', 'update'), DepartmentController.updateDepartment);

// Delete department
router.delete('/:id', protect, hasPermission('department', 'delete'), DepartmentController.deleteDepartment);

// Get department hierarchy
router.get('/hierarchy', protect, hasPermission('department', 'read'), DepartmentController.getDepartmentHierarchy);

// Get departments with employee count
router.get('/with-employee-count', protect, hasPermission('department', 'read'), DepartmentController.getDepartmentsWithEmployeeCount);

// Search departments
router.get('/search', protect, hasPermission('department', 'read'), DepartmentController.searchDepartments);

module.exports = router;
