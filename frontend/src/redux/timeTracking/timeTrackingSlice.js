import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import timeTrackingService from '../../api/timeTrackingService';

const initialState = {
  clockStatus: null,
  timeEntries: [],
  attendanceSummary: null,
  loading: false,
  error: null,
  success: false
};

// Clock in
export const clockIn = createAsyncThunk(
  'timeTracking/clockIn',
  async (clockInData, thunkAPI) => {
    try {
      // Get user from state if available
      const { auth } = thunkAPI.getState();
      const userEmployeeId = auth.user?.employeeId;

      // Validate required fields
      if (!clockInData.dailyGoal) {
        return thunkAPI.rejectWithValue('Daily goal is required for clock in');
      }

      // Add employeeId to the clock in data
      const dataWithEmployeeId = {
        ...clockInData,
        employeeId: clockInData.employeeId || userEmployeeId,
        dailyGoal: clockInData.dailyGoal.trim() // Ensure dailyGoal is trimmed
      };

      console.log('Clock in thunk data:', dataWithEmployeeId);

      return await timeTrackingService.clockIn(dataWithEmployeeId);
    } catch (error) {
      console.error('Clock in error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to clock in';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Clock out
export const clockOut = createAsyncThunk(
  'timeTracking/clockOut',
  async (clockOutData, thunkAPI) => {
    try {
      // Get user from state if available
      const { auth } = thunkAPI.getState();
      const userEmployeeId = auth.user?.employeeId;

      // Validate required fields
      if (!clockOutData.statusReport) {
        return thunkAPI.rejectWithValue('Status report is required for clock out');
      }

      // Add employeeId to the clock out data
      const dataWithEmployeeId = {
        ...clockOutData,
        employeeId: clockOutData.employeeId || userEmployeeId,
        statusReport: clockOutData.statusReport.trim() // Ensure statusReport is trimmed
      };

      console.log('Clock out thunk data:', dataWithEmployeeId);

      return await timeTrackingService.clockOut(dataWithEmployeeId);
    } catch (error) {
      console.error('Clock out error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to clock out';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get clock status
export const getClockStatus = createAsyncThunk(
  'timeTracking/getClockStatus',
  async (employeeId = null, thunkAPI) => {
    try {
      // Get user from state if available
      const { auth } = thunkAPI.getState();
      const userEmployeeId = auth.user?.employeeId;

      // Use provided employeeId or fall back to user's employeeId
      const effectiveEmployeeId = employeeId || userEmployeeId;

      return await timeTrackingService.getClockStatus(effectiveEmployeeId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to get clock status';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get attendance summary
export const getAttendanceSummary = createAsyncThunk(
  'timeTracking/getAttendanceSummary',
  async ({ employeeId = null, params = {} }, thunkAPI) => {
    try {
      return await timeTrackingService.getAttendanceSummary(employeeId, params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to get attendance summary';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add time entry
export const addTimeEntry = createAsyncThunk(
  'timeTracking/addTimeEntry',
  async (timeEntryData, thunkAPI) => {
    try {
      // Get user from state if available
      const { auth } = thunkAPI.getState();
      const userEmployeeId = auth.user?.employeeId;

      // Validate required fields
      if (!timeEntryData.description) {
        return thunkAPI.rejectWithValue('Description is required');
      }

      if (!timeEntryData.startTime || !timeEntryData.endTime) {
        return thunkAPI.rejectWithValue('Start time and end time are required');
      }

      // Add employee ID to the time entry data
      const dataWithEmployeeId = {
        ...timeEntryData,
        employee: timeEntryData.employee || userEmployeeId // Use 'employee' field as expected by the API
      };

      console.log('Adding time entry in thunk:', dataWithEmployeeId);

      return await timeTrackingService.addTimeEntry(dataWithEmployeeId);
    } catch (error) {
      console.error('Error in addTimeEntry thunk:', error);
      const message = error.response?.data?.message || error.message || 'Failed to add time entry';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get time entries
export const getTimeEntries = createAsyncThunk(
  'timeTracking/getTimeEntries',
  async ({ employeeId = null, params = {} } = {}, thunkAPI) => {
    try {
      // Get user from state if available
      const { auth } = thunkAPI.getState();
      const userEmployeeId = auth.user?.employeeId;

      // Use provided employeeId or fall back to user's employeeId
      const effectiveEmployeeId = employeeId || userEmployeeId;

      return await timeTrackingService.getTimeEntries(effectiveEmployeeId, params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to get time entries';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update time entry
export const updateTimeEntry = createAsyncThunk(
  'timeTracking/updateTimeEntry',
  async ({ timeEntryId, timeEntryData }, thunkAPI) => {
    try {
      return await timeTrackingService.updateTimeEntry(timeEntryId, timeEntryData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update time entry';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete time entry
export const deleteTimeEntry = createAsyncThunk(
  'timeTracking/deleteTimeEntry',
  async (timeEntryId, thunkAPI) => {
    try {
      await timeTrackingService.deleteTimeEntry(timeEntryId);
      return timeEntryId;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete time entry';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const timeTrackingSlice = createSlice({
  name: 'timeTracking',
  initialState,
  reducers: {
    clearTimeTrackingError: (state) => {
      state.error = null;
    },
    resetTimeTrackingSuccess: (state) => {
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Clock in
      .addCase(clockIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clockIn.fulfilled, (state, action) => {
        state.loading = false;
        state.clockStatus = action.payload;
        state.success = true;
      })
      .addCase(clockIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Clock out
      .addCase(clockOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clockOut.fulfilled, (state, action) => {
        state.loading = false;
        state.clockStatus = action.payload;
        state.success = true;
      })
      .addCase(clockOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get clock status
      .addCase(getClockStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getClockStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.clockStatus = action.payload;
      })
      .addCase(getClockStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get attendance summary
      .addCase(getAttendanceSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAttendanceSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.attendanceSummary = action.payload;
      })
      .addCase(getAttendanceSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add time entry
      .addCase(addTimeEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addTimeEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.timeEntries.unshift(action.payload);
        state.success = true;
      })
      .addCase(addTimeEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get time entries
      .addCase(getTimeEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTimeEntries.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both array and object with timeEntries property
        state.timeEntries = Array.isArray(action.payload) ? action.payload :
                           (action.payload && action.payload.timeEntries ? action.payload.timeEntries : []);
      })
      .addCase(getTimeEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update time entry
      .addCase(updateTimeEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateTimeEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        const index = state.timeEntries.findIndex(entry => entry._id === action.payload._id);
        if (index !== -1) {
          state.timeEntries[index] = action.payload;
        }
      })
      .addCase(updateTimeEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete time entry
      .addCase(deleteTimeEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTimeEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.timeEntries = state.timeEntries.filter(entry => entry._id !== action.payload);
        state.success = true;
      })
      .addCase(deleteTimeEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearTimeTrackingError, resetTimeTrackingSuccess } = timeTrackingSlice.actions;
export default timeTrackingSlice.reducer;
