const express = require('express');
const router = express.Router();
const ContentController = require('../controllers/content.controller');
const { protect } = require('../middleware/auth.middleware');
const { hasPermission } = require('../middleware/permission.middleware');

// Create new content
router.post('/', protect, hasPermission('content', 'create'), ContentController.createContent);

// Get all content
router.get('/', ContentController.getAllContent);

// Search content
router.get('/search', ContentController.searchContent);

// Get content by slug
router.get('/slug/:slug', ContentController.getContentBySlug);

// Get content by ID
router.get('/:id', ContentController.getContentById);

// Update content
router.put('/:id', protect, hasPermission('content', 'update'), ContentController.updateContent);

// Delete content
router.delete('/:id', protect, hasPermission('content', 'delete'), ContentController.deleteContent);

module.exports = router;
