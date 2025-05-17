import apiClient from './apiClient';

// Start a break
const startBreak = async (breakData) => {
  // Get user from localStorage to include employeeId
  const user = JSON.parse(localStorage.getItem('user'));
  const employeeId = user?.employeeId;

  // If no employeeId available, return mock data for development
  if (!employeeId) {
    console.warn('No employee ID available, returning mock data for starting break');
    // Return mock data instead of making API call
    return {
      success: true,
      message: 'Break started successfully (mock data)',
      breakId: 'mock-break-' + Date.now(),
      type: breakData.type,
      description: breakData.description || null,
      startTime: new Date().toISOString(),
      onBreak: true
    };
  }

  // Validate break type
  if (!breakData.type) {
    throw new Error('Break type is required');
  }

  // If type is 'other', description is required
  if (breakData.type === 'other' && !breakData.description) {
    throw new Error('Description is required for break type "other"');
  }

  const dataWithEmployeeId = {
    ...breakData,
    employeeId: employeeId
  };

  console.log('Sending break start data to API:', dataWithEmployeeId);

  try {
    const response = await apiClient.post('breaks/start', dataWithEmployeeId);
    console.log('Break start API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Break start API error:', error.response?.data || error.message);
    throw error;
  }
};

// End a break
const endBreak = async () => {
  // Get user from localStorage to include employeeId
  const user = JSON.parse(localStorage.getItem('user'));
  const employeeId = user?.employeeId;

  // If no employeeId available, return mock data for development
  if (!employeeId) {
    console.warn('No employee ID available, returning mock data for ending break');
    // Return mock data instead of making API call
    return {
      success: true,
      message: 'Break ended successfully (mock data)',
      breakId: 'mock-break-' + Date.now(),
      endTime: new Date().toISOString(),
      duration: 15, // 15 minutes
      onBreak: false
    };
  }

  const data = {
    employeeId: employeeId
  };

  console.log('Sending break end data to API:', data);

  try {
    const response = await apiClient.post('breaks/end', data);
    console.log('Break end API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Break end API error:', error.response?.data || error.message);
    throw error;
  }
};

// Get break status
const getBreakStatus = async (employeeId = null) => {
  // Get user from localStorage if employeeId not provided
  if (!employeeId) {
    const user = JSON.parse(localStorage.getItem('user'));
    employeeId = user?.employeeId;
    console.log('Using employee ID from localStorage for break status:', employeeId);
  }

  // If still no employeeId, return mock data for development instead of making API call
  if (!employeeId) {
    console.warn('No employee ID available, returning mock data for development');
    // Return mock data instead of making API call
    return {
      onBreak: false,
      breakId: null,
      breakType: null,
      description: null,
      startTime: null,
      currentDuration: 0
    };
  }

  console.log('Getting break status for employee ID:', employeeId);

  try {
    // Use the endpoint with employeeId
    const response = await apiClient.get(`breaks/status/${employeeId}`);
    console.log('Break status API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Break status API error:', error.response?.data || error.message);
    throw error;
  }
};

// Get all breaks for a specific date
const getBreaks = async (date = null, employeeId = null) => {
  // Get user from localStorage if employeeId not provided
  if (!employeeId) {
    const user = JSON.parse(localStorage.getItem('user'));
    employeeId = user?.employeeId;
  }

  // If no employeeId, throw an error
  if (!employeeId) {
    throw new Error('No employee ID available. Please log in as an employee or contact your administrator.');
  }

  // Prepare query parameters
  const params = {};
  if (date) {
    params.date = date instanceof Date ? date.toISOString().split('T')[0] : date;
  }

  try {
    // Use the endpoint with employeeId
    const response = await apiClient.get(`breaks/list/${employeeId}`, { params });
    console.log('Breaks API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Breaks API error:', error.response?.data || error.message);
    throw error;
  }
};

const breakService = {
  startBreak,
  endBreak,
  getBreakStatus,
  getBreaks
};

export default breakService;
