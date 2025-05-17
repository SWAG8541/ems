import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import attendanceService from '../../api/attendanceService';

const initialState = {
  attendances: [],
  currentAttendance: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
};

// Get all attendances
export const getAllAttendances = createAsyncThunk(
  'attendance/getAllAttendances',
  async (_, thunkAPI) => {
    try {
      return await attendanceService.getAllAttendances();
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get attendances by employee
export const getAttendancesByEmployee = createAsyncThunk(
  'attendance/getAttendancesByEmployee',
  async (employeeId, thunkAPI) => {
    try {
      return await attendanceService.getAttendancesByEmployee(employeeId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get attendances by date range
export const getAttendancesByDateRange = createAsyncThunk(
  'attendance/getAttendancesByDateRange',
  async ({ startDate, endDate }, thunkAPI) => {
    try {
      return await attendanceService.getAttendancesByDateRange(startDate, endDate);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get current attendance
export const getCurrentAttendance = createAsyncThunk(
  'attendance/getCurrentAttendance',
  async (employeeId, thunkAPI) => {
    try {
      return await attendanceService.getCurrentAttendance(employeeId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Clock in
export const clockIn = createAsyncThunk(
  'attendance/clockIn',
  async (clockInData, thunkAPI) => {
    try {
      return await attendanceService.clockIn(clockInData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Clock out
export const clockOut = createAsyncThunk(
  'attendance/clockOut',
  async (clockOutData, thunkAPI) => {
    try {
      return await attendanceService.clockOut(clockOutData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Start break
export const startBreak = createAsyncThunk(
  'attendance/startBreak',
  async (breakData, thunkAPI) => {
    try {
      return await attendanceService.startBreak(breakData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// End break
export const endBreak = createAsyncThunk(
  'attendance/endBreak',
  async (breakData, thunkAPI) => {
    try {
      return await attendanceService.endBreak(breakData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    updateAttendanceRealtime: (state, action) => {
      // Handle real-time attendance updates from socket
      const updatedAttendance = action.payload;
      
      // Update current attendance if it matches
      if (state.currentAttendance && state.currentAttendance._id === updatedAttendance._id) {
        state.currentAttendance = updatedAttendance;
      }
      
      // Update in the attendances array
      const index = state.attendances.findIndex(a => a._id === updatedAttendance._id);
      if (index !== -1) {
        // Replace the attendance in the array
        state.attendances = [
          ...state.attendances.slice(0, index),
          updatedAttendance,
          ...state.attendances.slice(index + 1)
        ];
      } else {
        // Add to the beginning of the array if it's a new attendance
        state.attendances = [updatedAttendance, ...state.attendances];
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all attendances
      .addCase(getAllAttendances.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllAttendances.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.attendances = action.payload;
      })
      .addCase(getAllAttendances.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get attendances by employee
      .addCase(getAttendancesByEmployee.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAttendancesByEmployee.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.attendances = action.payload;
      })
      .addCase(getAttendancesByEmployee.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get attendances by date range
      .addCase(getAttendancesByDateRange.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAttendancesByDateRange.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.attendances = action.payload;
      })
      .addCase(getAttendancesByDateRange.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get current attendance
      .addCase(getCurrentAttendance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentAttendance = action.payload;
      })
      .addCase(getCurrentAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Clock in
      .addCase(clockIn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(clockIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentAttendance = action.payload;
        state.attendances = [action.payload, ...state.attendances];
      })
      .addCase(clockIn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Clock out
      .addCase(clockOut.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(clockOut.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentAttendance = action.payload;
        
        // Update the attendance in the array
        const index = state.attendances.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.attendances = [
            ...state.attendances.slice(0, index),
            action.payload,
            ...state.attendances.slice(index + 1)
          ];
        }
      })
      .addCase(clockOut.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Start break
      .addCase(startBreak.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(startBreak.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentAttendance = action.payload;
        
        // Update the attendance in the array
        const index = state.attendances.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.attendances = [
            ...state.attendances.slice(0, index),
            action.payload,
            ...state.attendances.slice(index + 1)
          ];
        }
      })
      .addCase(startBreak.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // End break
      .addCase(endBreak.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(endBreak.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentAttendance = action.payload;
        
        // Update the attendance in the array
        const index = state.attendances.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.attendances = [
            ...state.attendances.slice(0, index),
            action.payload,
            ...state.attendances.slice(index + 1)
          ];
        }
      })
      .addCase(endBreak.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset, updateAttendanceRealtime } = attendanceSlice.actions;
export default attendanceSlice.reducer;
