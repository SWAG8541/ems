const ContentService = require('../services/content.service');

// Create new content
exports.createContent = async (req, res) => {
  try {
    // Add the current user as the author
    const contentData = {
      ...req.body,
      author: req.user.id
    };
    
    const content = await ContentService.createContent(contentData);
    res.status(201).json(content);
  } catch (err) {
    res.status(500).json({ message: 'Error creating content', error: err.message });
  }
};

// Get all content with optional filtering
exports.getAllContent = async (req, res) => {
  try {
    const filters = req.query;
    const content = await ContentService.getAllContent(filters);
    res.status(200).json(content);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching content', error: err.message });
  }
};

// Get content by ID
exports.getContentById = async (req, res) => {
  try {
    const content = await ContentService.getContentById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.status(200).json(content);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching content', error: err.message });
  }
};

// Get content by slug
exports.getContentBySlug = async (req, res) => {
  try {
    const content = await ContentService.getContentBySlug(req.params.slug);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.status(200).json(content);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching content', error: err.message });
  }
};

// Update content
exports.updateContent = async (req, res) => {
  try {
    const content = await ContentService.updateContent(req.params.id, req.body);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.status(200).json(content);
  } catch (err) {
    res.status(500).json({ message: 'Error updating content', error: err.message });
  }
};

// Delete content
exports.deleteContent = async (req, res) => {
  try {
    const result = await ContentService.deleteContent(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.status(200).json({ message: 'Content deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting content', error: err.message });
  }
};

// Search content
exports.searchContent = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search term is required' });
    }
    
    const content = await ContentService.searchContent(q);
    res.status(200).json(content);
  } catch (err) {
    res.status(500).json({ message: 'Error searching content', error: err.message });
  }
};
