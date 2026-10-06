// API configuration
// Check if window._env_ exists (for runtime environment variables)
const getEnv = (key, defaultValue) => {
  if (typeof window !== 'undefined' && window._env_ && window._env_[key]) {
    return window._env_[key];
  }

  // Vite environment variables
  if (import.meta.env?.[key]) {
    return import.meta.env[key];
  }

  // For Create React App environment variables
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }

  return defaultValue;
};

export const API_BASE_URL = getEnv('VITE_API_URL', getEnv('REACT_APP_API_URL', 'http://localhost:7005/api')).replace(/\/+$/, '');

export const SOCKET_URL = getEnv('VITE_SOCKET_URL', API_BASE_URL.replace(/\/api$/, ''));

// Authentication configuration
export const AUTH_TOKEN_KEY = 'auth_token';
export const USER_DATA_KEY = 'user_data';

// Application configuration
export const APP_NAME = 'Employee Management System';
export const APP_VERSION = '1.0.0';

// Time configuration
export const WORK_START_TIME = '09:00:00'; // 9:00 AM
export const WORK_END_TIME = '17:00:00';   // 5:00 PM
export const STANDARD_WORK_HOURS = 8;      // 8 hours per day

// Notification configuration
export const NOTIFICATION_POLL_INTERVAL = 30000; // 30 seconds

// Note: Leave types and break types should be fetched from the backend API
// These are just defaults in case the API call fails
export const DEFAULT_LEAVE_TYPES = [
  { value: 'annual', label: 'Annual Leave' },
  { value: 'sick', label: 'Sick Leave' }
];

export const DEFAULT_BREAK_TYPES = [
  { value: 'lunch', label: 'Lunch Break' },
  { value: 'other', label: 'Other' }
];

// Default pagination settings
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

// Date format settings
export const DATE_FORMAT = 'yyyy-MM-dd';
export const TIME_FORMAT = 'HH:mm:ss';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';
