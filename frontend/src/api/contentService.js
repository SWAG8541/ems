import apiClient from './apiClient';

// Create new content
const createContent = async (contentData) => {
  const response = await apiClient.post('content', contentData);
  return response.data;
};

// Get all content with optional filtering
const getAllContent = async (params = {}) => {
  const response = await apiClient.get('content', { params });
  return response.data;
};

// Get content by ID
const getContentById = async (id) => {
  const response = await apiClient.get(`content/${id}`);
  return response.data;
};

// Get content by slug
const getContentBySlug = async (slug) => {
  const response = await apiClient.get(`content/slug/${slug}`);
  return response.data;
};

// Update content
const updateContent = async (id, contentData) => {
  const response = await apiClient.put(`content/${id}`, contentData);
  return response.data;
};

// Delete content
const deleteContent = async (id) => {
  const response = await apiClient.delete(`content/${id}`);
  return response.data;
};

// Search content
const searchContent = async (query) => {
  const response = await apiClient.get(`content/search?q=${query}`);
  return response.data;
};

// Publish content
const publishContent = async (id) => {
  const response = await apiClient.patch(`content/${id}/publish`);
  return response.data;
};

// Archive content
const archiveContent = async (id) => {
  const response = await apiClient.patch(`content/${id}/archive`);
  return response.data;
};

const contentService = {
  createContent,
  getAllContent,
  getContentById,
  getContentBySlug,
  updateContent,
  deleteContent,
  searchContent,
  publishContent,
  archiveContent
};

export default contentService;
