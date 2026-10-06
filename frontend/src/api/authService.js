import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/auth/`;

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Login user
const login = async (userData) => {
  const response = await api.post('login', userData);

  if (response.data) {
    // Make sure employeeId is properly included in the user object
    if (response.data.user && response.data.user.employeeId) {
      console.log('Employee ID found:', response.data.user.employeeId);

      // Ensure the employeeId is directly accessible in the user object
      const userDataToStore = {
        ...response.data,
        employeeId: response.data.user.employeeId // Add employeeId at the top level
      };

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(userDataToStore));

      return userDataToStore;
    } else {
      console.warn('No employee ID found in user data');
      // Store user data in localStorage as is
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    }
  }

  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

// Get user profile
const getProfile = async () => {
  const response = await api.get('profile');
  return response.data;
};

// Register user (admin only in our case)
const register = async (userData) => {
  const response = await api.post('register', userData);
  return response.data;
};

const authService = {
  login,
  logout,
  getProfile,
  register
};

export default authService;
