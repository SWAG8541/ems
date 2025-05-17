import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import projectService from '../../api/projectService';

// Initial state
const initialState = {
  projects: [],
  project: null,
  loading: false,
  error: null,
  success: false,
};

// Async thunks
export const getAllProjects = createAsyncThunk(
  'project/getAllProjects',
  async (params, { rejectWithValue }) => {
    try {
      return await projectService.getAllProjects(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects');
    }
  }
);

export const getProjectById = createAsyncThunk(
  'project/getProjectById',
  async (id, { rejectWithValue }) => {
    try {
      return await projectService.getProjectById(id);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project');
    }
  }
);

export const createProject = createAsyncThunk(
  'project/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      return await projectService.createProject(projectData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create project');
    }
  }
);

export const updateProject = createAsyncThunk(
  'project/updateProject',
  async ({ id, projectData }, { rejectWithValue }) => {
    try {
      return await projectService.updateProject(id, projectData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update project');
    }
  }
);

export const deleteProject = createAsyncThunk(
  'project/deleteProject',
  async (id, { rejectWithValue }) => {
    try {
      await projectService.deleteProject(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete project');
    }
  }
);

export const addTeamMember = createAsyncThunk(
  'project/addTeamMember',
  async ({ projectId, teamMemberData }, { rejectWithValue }) => {
    try {
      return await projectService.addTeamMember(projectId, teamMemberData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add team member');
    }
  }
);

export const removeTeamMember = createAsyncThunk(
  'project/removeTeamMember',
  async ({ projectId, employeeId }, { rejectWithValue }) => {
    try {
      return await projectService.removeTeamMember(projectId, employeeId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove team member');
    }
  }
);

// Project slice
const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    resetProjectState: (state) => {
      state.project = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearProjectError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getAllProjects
      .addCase(getAllProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
        state.success = true;
      })
      .addCase(getAllProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // getProjectById
      .addCase(getProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.project = action.payload;
        state.success = true;
      })
      .addCase(getProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // createProject
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
        state.project = action.payload;
        state.success = true;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // updateProject
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.map(project => 
          project._id === action.payload._id ? action.payload : project
        );
        state.project = action.payload;
        state.success = true;
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // deleteProject
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter(project => project._id !== action.payload);
        state.success = true;
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // addTeamMember
      .addCase(addTeamMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTeamMember.fulfilled, (state, action) => {
        state.loading = false;
        state.project = action.payload;
        state.projects = state.projects.map(project => 
          project._id === action.payload._id ? action.payload : project
        );
        state.success = true;
      })
      .addCase(addTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // removeTeamMember
      .addCase(removeTeamMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeTeamMember.fulfilled, (state, action) => {
        state.loading = false;
        state.project = action.payload;
        state.projects = state.projects.map(project => 
          project._id === action.payload._id ? action.payload : project
        );
        state.success = true;
      })
      .addCase(removeTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetProjectState, clearProjectError } = projectSlice.actions;
export default projectSlice.reducer;
