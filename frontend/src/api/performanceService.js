import apiClient from './apiClient';

// Get all performance reviews
const getAllReviews = async (params = {}) => {
  try {
    const response = await apiClient.get('performance/reviews', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching performance reviews:', error);
    throw error;
  }
};

// Get performance review by ID
const getReviewById = async (id) => {
  try {
    const response = await apiClient.get(`performance/reviews/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching performance review ${id}:`, error);
    throw error;
  }
};

// Create a new performance review
const createReview = async (reviewData) => {
  try {
    const response = await apiClient.post('performance/reviews', reviewData);
    return response.data;
  } catch (error) {
    console.error('Error creating performance review:', error);
    throw error;
  }
};

// Update an existing performance review
const updateReview = async (id, reviewData) => {
  try {
    const response = await apiClient.put(`performance/reviews/${id}`, reviewData);
    return response.data;
  } catch (error) {
    console.error(`Error updating performance review ${id}:`, error);
    throw error;
  }
};

// Delete a performance review
const deleteReview = async (id) => {
  try {
    const response = await apiClient.delete(`performance/reviews/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting performance review ${id}:`, error);
    throw error;
  }
};

// Get performance metrics
const getPerformanceMetrics = async (params = {}) => {
  try {
    const response = await apiClient.get('performance/metrics', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    throw error;
  }
};

// Get employee performance history
const getEmployeePerformanceHistory = async (employeeId) => {
  try {
    const response = await apiClient.get(`performance/employee/${employeeId}/history`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching performance history for employee ${employeeId}:`, error);
    throw error;
  }
};

// Submit a review (change status to completed)
const submitReview = async (id, submissionData) => {
  try {
    const response = await apiClient.post(`performance/reviews/${id}/submit`, submissionData);
    return response.data;
  } catch (error) {
    console.error(`Error submitting performance review ${id}:`, error);
    throw error;
  }
};

const performanceService = {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getPerformanceMetrics,
  getEmployeePerformanceHistory,
  submitReview
};

export default performanceService;
