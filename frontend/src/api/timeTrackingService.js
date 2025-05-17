import apiClient from './apiClient';

// Clock in
const clockIn = async (clockInData) => {
  // Get user from localStorage to include employeeId
  const user = JSON.parse(localStorage.getItem('user'));
  const employeeId = user?.employeeId;

  // If no employeeId, throw an error
  if (!employeeId) {
    throw new Error('No employee ID available. Please log in as an employee or contact your administrator.');
  }

  // Ensure dailyGoal is included and not empty
  if (!clockInData.dailyGoal) {
    throw new Error('Daily goal is required for clock in');
  }

  const dataWithEmployeeId = {
    ...clockInData,
    employeeId: employeeId,
    dailyGoal: clockInData.dailyGoal.trim() // Ensure dailyGoal is trimmed
  };

  console.log('Sending clock in data to API:', dataWithEmployeeId);

  try {
    const response = await apiClient.post('time-tracking/clock-in', dataWithEmployeeId);
    console.log('Clock in API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Clock in API error:', error.response?.data || error.message);
    throw error;
  }
};

// Clock out
const clockOut = async (clockOutData) => {
  // Get user from localStorage to include employeeId
  const user = JSON.parse(localStorage.getItem('user'));
  const employeeId = user?.employeeId;

  // If no employeeId, throw an error
  if (!employeeId) {
    throw new Error('No employee ID available. Please log in as an employee or contact your administrator.');
  }

  // Ensure statusReport is included and not empty
  if (!clockOutData.statusReport) {
    throw new Error('Status report is required for clock out');
  }

  const dataWithEmployeeId = {
    ...clockOutData,
    employeeId: employeeId,
    statusReport: clockOutData.statusReport.trim() // Ensure statusReport is trimmed
  };

  console.log('Sending clock out data to API:', dataWithEmployeeId);

  try {
    const response = await apiClient.post('time-tracking/clock-out', dataWithEmployeeId);
    console.log('Clock out API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Clock out API error:', error.response?.data || error.message);
    throw error;
  }
};

// Get clock status
const getClockStatus = async (employeeId = null) => {
  // Get user from localStorage if employeeId not provided
  if (!employeeId) {
    const user = JSON.parse(localStorage.getItem('user'));
    employeeId = user?.employeeId;
    console.log('Using employee ID from localStorage:', employeeId);
  }

  // If no employeeId, throw an error
  if (!employeeId) {
    throw new Error('No employee ID available. Please log in as an employee or contact your administrator.');
  }

  // Use employeeId in URL
  const url = `time-tracking/clock-status/${employeeId}`;
  console.log('Fetching clock status from URL:', url);

  try {
    const response = await apiClient.get(url);
    console.log('Clock status response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching clock status:', error.response?.data || error.message);
    throw error;
  }
};

// Get attendance summary
const getAttendanceSummary = async (employeeId = null, params = {}) => {
  // Get user from localStorage if employeeId not provided
  if (!employeeId) {
    const user = JSON.parse(localStorage.getItem('user'));
    employeeId = user?.employeeId;
  }

  // Use employeeId in URL if available
  const url = employeeId ? `time-tracking/attendance-summary/${employeeId}` : 'time-tracking/attendance-summary';
  const response = await apiClient.get(url, { params });
  return response.data;
};

// Add time entry
const addTimeEntry = async (timeEntryData) => {
  // Get user from localStorage to include employeeId
  const user = JSON.parse(localStorage.getItem('user'));
  const employeeId = timeEntryData.employee || user?.employeeId;

  // If no employeeId, throw an error
  if (!employeeId) {
    throw new Error('No employee ID available. Please log in as an employee or contact your administrator.');
  }

  // Format dates for API and prepare data
  const formattedData = {
    employee: employeeId, // Use 'employee' field as expected by the API
    date: timeEntryData.date instanceof Date ? timeEntryData.date.toISOString() : timeEntryData.date,
    startTime: timeEntryData.startTime instanceof Date ? timeEntryData.startTime.toISOString() : timeEntryData.startTime,
    endTime: timeEntryData.endTime instanceof Date ? timeEntryData.endTime.toISOString() : timeEntryData.endTime,
    duration: timeEntryData.duration || 0,
    description: timeEntryData.description || '',
    billable: typeof timeEntryData.billable === 'boolean' ? timeEntryData.billable : true
  };

  // Add project and task if they exist
  if (timeEntryData.project) {
    // If project is an object with an id, just use the id
    formattedData.project = typeof timeEntryData.project === 'object' && timeEntryData.project !== null ?
      timeEntryData.project.id || timeEntryData.project._id :
      timeEntryData.project;
  }

  if (timeEntryData.task) {
    // If task is an object with an id, just use the id
    formattedData.task = typeof timeEntryData.task === 'object' && timeEntryData.task !== null ?
      timeEntryData.task.id || timeEntryData.task._id :
      timeEntryData.task;
  }

  console.log('Sending time entry data to API:', formattedData);

  try {
    const response = await apiClient.post('time-tracking/time-entries', formattedData);
    return response.data;
  } catch (error) {
    console.error('Error adding time entry:', error.response?.data || error.message);
    throw error;
  }
};

// Get time entries
const getTimeEntries = async (employeeId = null, params = {}) => {
  // Get user from localStorage if employeeId not provided
  if (!employeeId) {
    const user = JSON.parse(localStorage.getItem('user'));
    employeeId = user?.employeeId;
    console.log('Using employee ID from localStorage for time entries:', employeeId);
  }

  // If no employeeId, throw an error
  if (!employeeId) {
    throw new Error('No employee ID available. Please log in as an employee or contact your administrator.');
  }

  console.log('Getting time entries for employee ID:', employeeId);

  // Use employeeId in URL
  const url = `time-tracking/time-entries/${employeeId}`;
  console.log('Fetching time entries from URL:', url);

  try {
    const response = await apiClient.get(url, { params });

    // Ensure we return an array of time entries
    const data = response.data;
    console.log('Time entries API response:', data);

    if (Array.isArray(data)) {
      return data;
    } else if (data && data.timeEntries && Array.isArray(data.timeEntries)) {
      return data.timeEntries;
    } else {
      console.warn('API did not return an array of time entries:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching time entries:', error.response?.data || error.message);
    throw error;
  }
};

// Update time entry
const updateTimeEntry = async (timeEntryId, timeEntryData) => {
  const response = await apiClient.put(`time-entries/${timeEntryId}`, timeEntryData);
  return response.data;
};

// Delete time entry
const deleteTimeEntry = async (timeEntryId) => {
  const response = await apiClient.delete(`time-entries/${timeEntryId}`);
  return response.data;
};

// Get time entries by project
const getTimeEntriesByProject = async (projectId, params = {}) => {
  const response = await apiClient.get(`time-entries/project/${projectId}`, { params });
  return response.data;
};

// Get time entries by task
const getTimeEntriesByTask = async (taskId, params = {}) => {
  const response = await apiClient.get(`time-entries/task/${taskId}`, { params });
  return response.data;
};

const timeTrackingService = {
  clockIn,
  clockOut,
  getClockStatus,
  getAttendanceSummary,
  addTimeEntry,
  getTimeEntries,
  updateTimeEntry,
  deleteTimeEntry,
  getTimeEntriesByProject,
  getTimeEntriesByTask
};

export default timeTrackingService;
