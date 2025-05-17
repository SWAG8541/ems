import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import breakService from '../../api/breakService';

const initialState = {
  breakStatus: null,
  onBreak: false,
  breaks: [],
  totalBreakDuration: 0,
  loading: false,
  error: null
};

// Start a break
export const startBreak = createAsyncThunk(
  'breaks/startBreak',
  async (breakData, thunkAPI) => {
    try {
      // Validate required fields
      if (!breakData.type) {
        return thunkAPI.rejectWithValue('Break type is required');
      }

      // If type is 'other', description is required
      if (breakData.type === 'other' && !breakData.description) {
        return thunkAPI.rejectWithValue('Description is required for break type "other"');
      }

      // Validate employee ID
      if (!breakData.employeeId) {
        return thunkAPI.rejectWithValue('Employee ID is required');
      }

      console.log('Break start thunk data:', breakData);
      return await breakService.startBreak(breakData);
    } catch (error) {
      console.error('Break start error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to start break';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// End a break
export const endBreak = createAsyncThunk(
  'breaks/endBreak',
  async (employeeId, thunkAPI) => {
    try {
      // Validate employee ID
      if (!employeeId) {
        return thunkAPI.rejectWithValue('Employee ID is required');
      }

      console.log('Ending break for employee ID:', employeeId);
      return await breakService.endBreak(employeeId);
    } catch (error) {
      console.error('Break end error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to end break';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get break status
export const getBreakStatus = createAsyncThunk(
  'breaks/getBreakStatus',
  async (employeeId, thunkAPI) => {
    try {
      return await breakService.getBreakStatus(employeeId);
    } catch (error) {
      console.error('Get break status error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to get break status';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get all breaks for a specific date
export const getBreaks = createAsyncThunk(
  'breaks/getBreaks',
  async (params, thunkAPI) => {
    try {
      // Handle both old and new parameter formats
      const date = typeof params === 'string' ? params : params?.date;
      const employeeId = params?.employeeId;

      return await breakService.getBreaks(date, employeeId);
    } catch (error) {
      console.error('Get breaks error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to get breaks';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const breakSlice = createSlice({
  name: 'breaks',
  initialState,
  reducers: {
    clearBreakError: (state) => {
      state.error = null;
    },
    resetBreakState: (state) => {
      state.breakStatus = null;
      state.onBreak = false;
      state.breaks = [];
      state.totalBreakDuration = 0;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Start break cases
      .addCase(startBreak.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startBreak.fulfilled, (state, action) => {
        state.loading = false;
        state.breakStatus = action.payload.break;
        state.onBreak = true;
      })
      .addCase(startBreak.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // End break cases
      .addCase(endBreak.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(endBreak.fulfilled, (state, action) => {
        state.loading = false;
        state.breakStatus = null;
        state.onBreak = false;
        // Add the completed break to the breaks array
        state.breaks.push(action.payload.break);
        state.totalBreakDuration += action.payload.break.duration;
      })
      .addCase(endBreak.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get break status cases
      .addCase(getBreakStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBreakStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.onBreak = action.payload.onBreak;
        if (action.payload.onBreak) {
          state.breakStatus = {
            _id: action.payload.breakId,
            type: action.payload.breakType,
            description: action.payload.description,
            startTime: action.payload.startTime,
            currentDuration: action.payload.currentDuration
          };
        } else {
          state.breakStatus = null;
        }
      })
      .addCase(getBreakStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get breaks cases
      .addCase(getBreaks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBreaks.fulfilled, (state, action) => {
        state.loading = false;
        state.breaks = action.payload.breaks;
        state.totalBreakDuration = action.payload.totalBreakDuration;
      })
      .addCase(getBreaks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearBreakError, resetBreakState } = breakSlice.actions;
export default breakSlice.reducer;
