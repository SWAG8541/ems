import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Breadcrumbs
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import BusinessIcon from '@mui/icons-material/Business';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import departmentService from '../../api/departmentService';
import employeeService from '../../api/employeeService';

const DepartmentCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manager: '',
    parentDepartment: '',
    status: 'active',
    location: {
      building: '',
      floor: '',
      room: '',
      address: '',
      city: '',
      country: ''
    }
  });
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState({});
  
  // Fetch departments and managers on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch departments for parent department dropdown
        const departmentsData = await departmentService.getAllDepartments();
        setDepartments(departmentsData || []);
        
        // Fetch managers (employees who can be managers)
        const employeesData = await employeeService.getAllEmployees();
        setManagers(employeesData || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load required data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested location fields
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [locationField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear validation error when field is changed
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Department name is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Create new department
      const newDepartment = await departmentService.createDepartment(formData);
      
      setLoading(false);
      
      // Navigate to the new department's detail page
      navigate(`/departments/${newDepartment._id}`);
    } catch (err) {
      console.error('Error creating department:', err);
      setError('Failed to create department. Please try again.');
      setLoading(false);
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
          Dashboard
        </Link>
        <Link to="/departments" style={{ textDecoration: 'none', color: 'inherit' }}>
          Departments
        </Link>
        <Typography color="text.primary">Create Department</Typography>
      </Breadcrumbs>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Department
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={Link}
          to="/departments"
        >
          Back to Departments
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Department Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                required
                InputProps={{
                  startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Parent Department</InputLabel>
                <Select
                  name="parentDepartment"
                  value={formData.parentDepartment}
                  onChange={handleChange}
                  label="Parent Department"
                >
                  <MenuItem value="">None</MenuItem>
                  {departments.map(dept => (
                    <MenuItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Department Manager</InputLabel>
                <Select
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                  label="Department Manager"
                >
                  <MenuItem value="">None</MenuItem>
                  {managers.map(manager => (
                    <MenuItem key={manager._id} value={manager._id}>
                      {manager.user?.name} ({manager.employeeId})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                Location Details
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Building"
                name="location.building"
                value={formData.location.building}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Floor"
                name="location.floor"
                value={formData.location.floor}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Room"
                name="location.room"
                value={formData.location.room}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Address"
                name="location.address"
                value={formData.location.address}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="City"
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Country"
                name="location.country"
                value={formData.location.country}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid sx={{ mt: 2 }} size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  component={Link}
                  to="/departments"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create Department'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default DepartmentCreatePage;
