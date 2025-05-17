import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import employeeService from '../../api/employeeService';

const initialState = {
  employees: [],
  employee: null,
  loading: false,
  error: null,
  success: false,
  totalCount: 0
};

// Get all employees with filtering and pagination
export const getAllEmployees = createAsyncThunk(
  'employee/getAllEmployees',
  async (params, thunkAPI) => {
    try {
      return await employeeService.getAllEmployees(params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch employees';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get employee by ID
export const getEmployeeById = createAsyncThunk(
  'employee/getEmployeeById',
  async (id, thunkAPI) => {
    try {
      return await employeeService.getEmployeeById(id);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch employee';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create a new employee
export const createEmployee = createAsyncThunk(
  'employee/createEmployee',
  async (employeeData, thunkAPI) => {
    try {
      return await employeeService.createEmployee(employeeData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create employee';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update an employee
export const updateEmployee = createAsyncThunk(
  'employee/updateEmployee',
  async ({ id, employeeData }, thunkAPI) => {
    try {
      return await employeeService.updateEmployee(id, employeeData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update employee';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete an employee
export const deleteEmployee = createAsyncThunk(
  'employee/deleteEmployee',
  async (id, thunkAPI) => {
    try {
      await employeeService.deleteEmployee(id);
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete employee';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get employee profile (for current logged-in employee)
export const getEmployeeProfile = createAsyncThunk(
  'employee/getEmployeeProfile',
  async (_, thunkAPI) => {
    try {
      return await employeeService.getEmployeeProfile();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch employee profile';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    resetEmployeeState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearEmployeeError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all employees
      .addCase(getAllEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload.employees;
        state.totalCount = action.payload.totalCount;
      })
      .addCase(getAllEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get employee by ID
      .addCase(getEmployeeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEmployeeById.fulfilled, (state, action) => {
        state.loading = false;
        state.employee = action.payload;
      })
      .addCase(getEmployeeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create employee
      .addCase(createEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.employees.push(action.payload);
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update employee
      .addCase(updateEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.employee = action.payload;
        state.employees = state.employees.map(employee => 
          employee._id === action.payload._id ? action.payload : employee
        );
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Delete employee
      .addCase(deleteEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = state.employees.filter(employee => employee._id !== action.payload);
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get employee profile
      .addCase(getEmployeeProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEmployeeProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.employee = action.payload;
      })
      .addCase(getEmployeeProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetEmployeeState, clearEmployeeError } = employeeSlice.actions;
export default employeeSlice.reducer;
