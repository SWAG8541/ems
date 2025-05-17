import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../api/userService';

const initialState = {
  users: [],
  user: null,
  loading: false,
  error: null,
  success: false,
  totalCount: 0
};

// Get all users
export const getAllUsers = createAsyncThunk(
  'user/getAllUsers',
  async (params, thunkAPI) => {
    try {
      return await userService.getAllUsers(params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch users';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get user by ID
export const getUserById = createAsyncThunk(
  'user/getUserById',
  async (id, thunkAPI) => {
    try {
      return await userService.getUserById(id);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch user';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create a new user
export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData, thunkAPI) => {
    try {
      return await userService.createUser(userData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create user';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update user
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ id, userData }, thunkAPI) => {
    try {
      return await userService.updateUser(id, userData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update user';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete user
export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id, thunkAPI) => {
    try {
      await userService.deleteUser(id);
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete user';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Search users
export const searchUsers = createAsyncThunk(
  'user/searchUsers',
  async (query, thunkAPI) => {
    try {
      return await userService.searchUsers(query);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to search users';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    resetUserSuccess: (state) => {
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all users
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users || action.payload;
        state.totalCount = action.payload.totalCount || action.payload.length;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get user by ID
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create user
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.user = action.payload;
        
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user._id !== action.payload);
        state.success = true;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Search users
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearUserError, resetUserSuccess } = userSlice.actions;
export default userSlice.reducer;
