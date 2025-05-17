const express = require('express');
const router = express.Router();
const DesignationController = require('../controllers/designation.controller');
const { protect } = require('../middleware/auth.middleware');
const { hasPermission } = require('../middleware/permission.middleware');

// Create a new designation
router.post('/', protect, DesignationController.createDesignation);

// Get all designations
router.get('/', protect, DesignationController.getAllDesignations);

// Get designation by ID
router.get('/:id', protect, hasPermission('designation', 'read'), DesignationController.getDesignationById);

// Update designation
router.put('/:id', protect, hasPermission('designation', 'update'), DesignationController.updateDesignation);

// Delete designation
router.delete('/:id', protect, hasPermission('designation', 'delete'), DesignationController.deleteDesignation);

// Get designations by department
router.get('/department/:departmentId', protect, hasPermission('designation', 'read'), DesignationController.getDesignationsByDepartment);

// Search designations
router.get('/search', protect, hasPermission('designation', 'read'), DesignationController.searchDesignations);

module.exports = router;
