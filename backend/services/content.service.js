const Content = require('../models/content.model');

// Create new content
exports.createContent = async (contentData) => {
  const content = new Content(contentData);
  return await content.save();
};

// Get all content with optional filtering
exports.getAllContent = async (filters = {}) => {
  const query = {};
  
  // Apply filters if provided
  if (filters.status) query.status = filters.status;
  if (filters.contentType) query.contentType = filters.contentType;
  if (filters.author) query.author = filters.author;
  if (filters.tags) query.tags = { $in: filters.tags };
  
  return await Content.find(query)
    .populate('author', 'name email')
    .sort({ createdAt: -1 });
};

// Get content by ID
exports.getContentById = async (contentId) => {
  return await Content.findById(contentId).populate('author', 'name email');
};

// Get content by slug
exports.getContentBySlug = async (slug) => {
  return await Content.findOne({ slug }).populate('author', 'name email');
};

// Update content
exports.updateContent = async (contentId, contentData) => {
  return await Content.findByIdAndUpdate(
    contentId,
    contentData,
    { new: true, runValidators: true }
  ).populate('author', 'name email');
};

// Delete content
exports.deleteContent = async (contentId) => {
  return await Content.findByIdAndDelete(contentId);
};

// Search content
exports.searchContent = async (searchTerm) => {
  return await Content.find(
    { $text: { $search: searchTerm } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .populate('author', 'name email');
};
