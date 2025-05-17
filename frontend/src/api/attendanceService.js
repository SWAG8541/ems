import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get all attendances
const getAllAttendances = async () => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const response = await axios.get(`${API_URL}/attendance`, config);
  return response.data;
};

// Get attendances by employee
const getAttendancesByEmployee = async (employeeId) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const response = await axios.get(`${API_URL}/attendance/employee/${employeeId}`, config);
  return response.data;
};

// Get attendances by date range
const getAttendancesByDateRange = async (startDate, endDate) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params: {
      startDate,
      endDate
    }
  };

  const response = await axios.get(`${API_URL}/attendance/range`, config);
  return response.data;
};

// Get current attendance
const getCurrentAttendance = async (employeeId) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const response = await axios.get(`${API_URL}/attendance/current/${employeeId}`, config);
  return response.data;
};

// Clock in
const clockIn = async (clockInData) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const response = await axios.post(`${API_URL}/attendance/clock-in`, clockInData, config);
  return response.data;
};

// Clock out
const clockOut = async (clockOutData) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const response = await axios.post(`${API_URL}/attendance/clock-out`, clockOutData, config);
  return response.data;
};

// Start break
const startBreak = async (breakData) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const response = await axios.post(`${API_URL}/attendance/break/start`, breakData, config);
  return response.data;
};

// End break
const endBreak = async (breakData) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const response = await axios.post(`${API_URL}/attendance/break/end`, breakData, config);
  return response.data;
};

const attendanceService = {
  getAllAttendances,
  getAttendancesByEmployee,
  getAttendancesByDateRange,
  getCurrentAttendance,
  clockIn,
  clockOut,
  startBreak,
  endBreak
};

export default attendanceService;
