import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../api/authService';
import socketService from '../../services/socketService';

// Get user from localStorage
const user = JSON.parse(localStorage.getItem('user'));

const initialState = {
  user: user || null,
  isAuthenticated: !!user,
  loading: false,
  error: null
};

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      return await authService.login(userData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Logout user
export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await authService.logout();
  }
);

// Get user profile
export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, thunkAPI) => {
    try {
      return await authService.getProfile();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to get profile';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;

        // Ensure employeeId is included in the user object
        if (action.payload.user && action.payload.user.employeeId) {
          state.user = {
            ...action.payload.user,
            employeeId: action.payload.user.employeeId
          };
        } else if (action.payload.employeeId) {
          // If employeeId is at the top level of the payload
          state.user = {
            ...action.payload.user,
            employeeId: action.payload.employeeId
          };
        } else {
          state.user = action.payload.user;
          console.warn('No employee ID found in login response');
        }

        console.log('User in Redux after login:', state.user);

        // Initialize socket connection
        const token = action.payload.token || localStorage.getItem('token');
        const rooms = [];

        // Add user-specific room
        if (state.user?._id) {
          rooms.push(`user-${state.user._id}`);
        }

        // Add role-based rooms
        if (state.user?.role) {
          rooms.push(state.user.role);
        }

        // Add department room if applicable
        if (state.user?.department) {
          rooms.push(`department-${state.user.department}`);
        }

        // Initialize socket with token and rooms
        socketService.initializeSocket(token, rooms);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Logout case
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;

        // Close socket connection
        socketService.closeSocket();
      })

      // Get profile cases
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
