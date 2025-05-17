import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import taskService from '../../api/taskService';

// Initial state
const initialState = {
  tasks: [],
  task: null,
  loading: false,
  error: null,
  success: false,
};

// Async thunks
export const getAllTasks = createAsyncThunk(
  'task/getAllTasks',
  async (params, { rejectWithValue }) => {
    try {
      return await taskService.getAllTasks(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const getTaskById = createAsyncThunk(
  'task/getTaskById',
  async (id, { rejectWithValue }) => {
    try {
      return await taskService.getTaskById(id);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch task');
    }
  }
);

export const getTasksByProject = createAsyncThunk(
  'task/getTasksByProject',
  async (projectId, { rejectWithValue }) => {
    try {
      return await taskService.getTasksByProject(projectId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project tasks');
    }
  }
);

export const getTasksByAssignee = createAsyncThunk(
  'task/getTasksByAssignee',
  async (employeeId, { rejectWithValue }) => {
    try {
      return await taskService.getTasksByAssignee(employeeId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch assigned tasks');
    }
  }
);

export const createTask = createAsyncThunk(
  'task/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      return await taskService.createTask(taskData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'task/updateTask',
  async ({ id, taskData }, { rejectWithValue }) => {
    try {
      return await taskService.updateTask(id, taskData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'task/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      await taskService.deleteTask(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  'task/updateTaskStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return await taskService.updateTaskStatus(id, status);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task status');
    }
  }
);

export const addComment = createAsyncThunk(
  'task/addComment',
  async ({ taskId, commentData }, { rejectWithValue }) => {
    try {
      return await taskService.addComment(taskId, commentData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

export const addSubtask = createAsyncThunk(
  'task/addSubtask',
  async ({ taskId, subtaskData }, { rejectWithValue }) => {
    try {
      return await taskService.addSubtask(taskId, subtaskData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add subtask');
    }
  }
);

export const updateSubtask = createAsyncThunk(
  'task/updateSubtask',
  async ({ taskId, subtaskId, subtaskData }, { rejectWithValue }) => {
    try {
      return await taskService.updateSubtask(taskId, subtaskId, subtaskData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update subtask');
    }
  }
);

export const deleteSubtask = createAsyncThunk(
  'task/deleteSubtask',
  async ({ taskId, subtaskId }, { rejectWithValue }) => {
    try {
      return await taskService.deleteSubtask(taskId, subtaskId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete subtask');
    }
  }
);

// Task slice
const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    resetTaskState: (state) => {
      state.task = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearTaskError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getAllTasks
      .addCase(getAllTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
        state.success = true;
      })
      .addCase(getAllTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // getTaskById
      .addCase(getTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.task = action.payload;
        state.success = true;
      })
      .addCase(getTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // getTasksByProject
      .addCase(getTasksByProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTasksByProject.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
        state.success = true;
      })
      .addCase(getTasksByProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // getTasksByAssignee
      .addCase(getTasksByAssignee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTasksByAssignee.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
        state.success = true;
      })
      .addCase(getTasksByAssignee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // createTask
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
        state.task = action.payload;
        state.success = true;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // updateTask
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.map(task => 
          task._id === action.payload._id ? action.payload : task
        );
        state.task = action.payload;
        state.success = true;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // deleteTask
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter(task => task._id !== action.payload);
        state.success = true;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // updateTaskStatus
      .addCase(updateTaskStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.map(task => 
          task._id === action.payload._id ? action.payload : task
        );
        state.task = action.payload;
        state.success = true;
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // addComment
      .addCase(addComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.loading = false;
        state.task = action.payload;
        state.tasks = state.tasks.map(task => 
          task._id === action.payload._id ? action.payload : task
        );
        state.success = true;
      })
      .addCase(addComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // addSubtask
      .addCase(addSubtask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSubtask.fulfilled, (state, action) => {
        state.loading = false;
        state.task = action.payload;
        state.tasks = state.tasks.map(task => 
          task._id === action.payload._id ? action.payload : task
        );
        state.success = true;
      })
      .addCase(addSubtask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // updateSubtask
      .addCase(updateSubtask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubtask.fulfilled, (state, action) => {
        state.loading = false;
        state.task = action.payload;
        state.tasks = state.tasks.map(task => 
          task._id === action.payload._id ? action.payload : task
        );
        state.success = true;
      })
      .addCase(updateSubtask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // deleteSubtask
      .addCase(deleteSubtask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubtask.fulfilled, (state, action) => {
        state.loading = false;
        state.task = action.payload;
        state.tasks = state.tasks.map(task => 
          task._id === action.payload._id ? action.payload : task
        );
        state.success = true;
      })
      .addCase(deleteSubtask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetTaskState, clearTaskError } = taskSlice.actions;
export default taskSlice.reducer;
