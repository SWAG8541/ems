import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getEmployeeById, updateEmployee, resetEmployeeState } from '../../redux/employee/employeeSlice';
import departmentService from '../../api/departmentService';
import employeeService from '../../api/employeeService';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

const EmployeeEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { employee, loading, error, success } = useSelector((state) => state.employee);

  // State for form data
  const [formData, setFormData] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);

  // Steps for the stepper
  const steps = [
    'Personal Information',
    'Employment Details',
    'Contact Information',
    'Skills & Education',
    'Leave & Attendance'
  ];

  // Fetch employee data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employee data
        await dispatch(getEmployeeById(id));

        // Fetch departments
        const departmentsData = await departmentService.getAllDepartments();
        setDepartments(departmentsData || []);

        // Fetch managers
        const managersData = await employeeService.getAllEmployees({ role: 'manager' });
        // Filter out the current employee from managers list
        const filteredManagers = managersData.filter(manager => manager._id !== id);
        setManagers(filteredManagers || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setFormErrors({ general: 'Failed to load required data. Please try again.' });
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      dispatch(resetEmployeeState());
    };
  }, [dispatch, id]);

  // Initialize form data when employee data is loaded
  useEffect(() => {
    if (employee) {
      setFormData(employee);
    }
  }, [employee]);

  // Navigate back to employee details page after successful update
  useEffect(() => {
    if (success) {
      navigate(`/employees/${id}`);
    }
  }, [success, navigate, id]);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle nested object changes
  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Validate form data
    const errors = validateForm();
    if (Object.keys(errors).length === 0) {
      try {
        // Format dates properly
        const updatedData = { ...formData };

        if (updatedData.joinDate) {
          updatedData.joinDate = new Date(updatedData.joinDate).toISOString();
        }

        if (updatedData.personalInfo?.dateOfBirth) {
          updatedData.personalInfo.dateOfBirth = new Date(updatedData.personalInfo.dateOfBirth).toISOString();
        }

        // Dispatch update action
        const resultAction = await dispatch(updateEmployee({ id, employeeData: updatedData }));

        if (updateEmployee.fulfilled.match(resultAction)) {
          // Navigate to employee details page on success
          navigate(`/employees/${id}`);
        }
      } catch (err) {
        console.error('Error updating employee:', err);
        setFormErrors({ general: 'Failed to update employee. Please try again.' });
      }
    } else {
      setFormErrors(errors);
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};

    // Validate based on current step
    if (activeStep === 0) {
      // Personal Information validation
      if (!formData.user?.name) {
        errors.name = 'Name is required';
      }

      if (!formData.user?.email) {
        errors.email = 'Email is required';
      } else if (!/^\S+@\S+\.\S+$/.test(formData.user.email)) {
        errors.email = 'Invalid email format';
      }

      if (!formData.status) {
        errors.status = 'Status is required';
      }
    }

    if (activeStep === 1) {
      // Employment Details validation
      if (!formData.position) {
        errors.position = 'Position is required';
      }

      if (!formData.joinDate) {
        errors.joinDate = 'Join date is required';
      }

      if (formData.employmentDetails?.salary?.amount &&
          (isNaN(formData.employmentDetails.salary.amount) ||
           Number(formData.employmentDetails.salary.amount) < 0)) {
        errors.salaryAmount = 'Salary must be a positive number';
      }
    }

    if (activeStep === 2) {
      // Contact Information validation
      if (formData.contactInfo?.phone && !/^[\d\s\-+()]+$/.test(formData.contactInfo.phone)) {
        errors.phone = 'Invalid phone number format';
      }

      if (formData.contactInfo?.emergencyContact?.phone &&
          !/^[\d\s\-+()]+$/.test(formData.contactInfo.emergencyContact.phone)) {
        errors.emergencyContactPhone = 'Invalid phone number format';
      }
    }

    return errors;
  };

  // Handle next step
  const handleNext = () => {
    // Validate current step before proceeding
    const errors = validateForm();
    if (Object.keys(errors).length === 0) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setFormErrors({});
    } else {
      setFormErrors(errors);
    }
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Render loading state
  if (loading && !employee) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={Link}
          to={`/employees/${id}`}
        >
          Back to Employee Details
        </Button>
        <Typography variant="h4" component="h1">
          Edit Employee
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSubmit}
          disabled={loading}
        >
          Save Changes
        </Button>
      </Box>

      {/* Error messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {formErrors.general && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {formErrors.general}
        </Alert>
      )}

      {/* Stepper */}
      <Paper sx={{ mb: 3, p: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Form content */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {steps[activeStep]}
        </Typography>

        <Box sx={{ mt: 3 }}>
          {activeStep === 0 && (
            <Grid container spacing={3}>
              {/* Personal Information */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  name="employeeId"
                  value={formData.employeeId || ''}
                  onChange={handleChange}
                  error={!!formErrors.employeeId}
                  helperText={formErrors.employeeId}
                  disabled // Employee ID should not be editable
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.user?.name || ''}
                  onChange={(e) => {
                    // Handle nested user object
                    setFormData(prev => ({
                      ...prev,
                      user: {
                        ...prev.user,
                        name: e.target.value
                      }
                    }));
                  }}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.user?.email || ''}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      user: {
                        ...prev.user,
                        email: e.target.value
                      }
                    }));
                  }}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!formErrors.status}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status || 'active'}
                    onChange={handleChange}
                    label="Status"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="on_leave">On Leave</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                    <MenuItem value="terminated">Terminated</MenuItem>
                  </Select>
                  {formErrors.status && <FormHelperText>{formErrors.status}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.personalInfo?.dateOfBirth ? new Date(formData.personalInfo.dateOfBirth).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleNestedChange('personalInfo', 'dateOfBirth', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  error={!!formErrors.dateOfBirth}
                  helperText={formErrors.dateOfBirth}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!formErrors.gender}>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={formData.personalInfo?.gender || ''}
                    onChange={(e) => handleNestedChange('personalInfo', 'gender', e.target.value)}
                    label="Gender"
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                    <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
                  </Select>
                  {formErrors.gender && <FormHelperText>{formErrors.gender}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!formErrors.maritalStatus}>
                  <InputLabel>Marital Status</InputLabel>
                  <Select
                    value={formData.personalInfo?.maritalStatus || ''}
                    onChange={(e) => handleNestedChange('personalInfo', 'maritalStatus', e.target.value)}
                    label="Marital Status"
                  >
                    <MenuItem value="single">Single</MenuItem>
                    <MenuItem value="married">Married</MenuItem>
                    <MenuItem value="divorced">Divorced</MenuItem>
                    <MenuItem value="widowed">Widowed</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                  {formErrors.maritalStatus && <FormHelperText>{formErrors.maritalStatus}</FormHelperText>}
                </FormControl>
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Grid container spacing={3}>
              {/* Employment Details */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Position"
                  name="position"
                  value={formData.position || ''}
                  onChange={handleChange}
                  error={!!formErrors.position}
                  helperText={formErrors.position}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  name="department"
                  value={formData.department?.name || formData.department || ''}
                  onChange={handleChange}
                  error={!!formErrors.department}
                  helperText={formErrors.department}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Join Date"
                  name="joinDate"
                  type="date"
                  value={formData.joinDate ? new Date(formData.joinDate).toISOString().split('T')[0] : ''}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  error={!!formErrors.joinDate}
                  helperText={formErrors.joinDate}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!formErrors.employmentType}>
                  <InputLabel>Employment Type</InputLabel>
                  <Select
                    value={formData.employmentDetails?.employmentType || 'full_time'}
                    onChange={(e) => handleNestedChange('employmentDetails', 'employmentType', e.target.value)}
                    label="Employment Type"
                  >
                    <MenuItem value="full_time">Full Time</MenuItem>
                    <MenuItem value="part_time">Part Time</MenuItem>
                    <MenuItem value="contract">Contract</MenuItem>
                    <MenuItem value="intern">Intern</MenuItem>
                    <MenuItem value="probation">Probation</MenuItem>
                  </Select>
                  {formErrors.employmentType && <FormHelperText>{formErrors.employmentType}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Work Hours Per Week"
                  type="number"
                  value={formData.employmentDetails?.workHoursPerWeek || 40}
                  onChange={(e) => handleNestedChange('employmentDetails', 'workHoursPerWeek', e.target.value)}
                  error={!!formErrors.workHoursPerWeek}
                  helperText={formErrors.workHoursPerWeek}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Salary Amount"
                  type="number"
                  value={formData.employmentDetails?.salary?.amount || ''}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      employmentDetails: {
                        ...prev.employmentDetails,
                        salary: {
                          ...prev.employmentDetails?.salary,
                          amount: e.target.value
                        }
                      }
                    }));
                  }}
                  error={!!formErrors.salaryAmount}
                  helperText={formErrors.salaryAmount}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Salary Currency"
                  value={formData.employmentDetails?.salary?.currency || 'USD'}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      employmentDetails: {
                        ...prev.employmentDetails,
                        salary: {
                          ...prev.employmentDetails?.salary,
                          currency: e.target.value
                        }
                      }
                    }));
                  }}
                  error={!!formErrors.salaryCurrency}
                  helperText={formErrors.salaryCurrency}
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 2 && (
            <Grid container spacing={3}>
              {/* Contact Information */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={3}
                  value={formData.contactInfo?.address || ''}
                  onChange={(e) => handleNestedChange('contactInfo', 'address', e.target.value)}
                  error={!!formErrors.address}
                  helperText={formErrors.address}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.contactInfo?.phone || ''}
                  onChange={(e) => handleNestedChange('contactInfo', 'phone', e.target.value)}
                  error={!!formErrors.phone}
                  helperText={formErrors.phone}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Emergency Contact
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact Name"
                  value={formData.contactInfo?.emergencyContact?.name || ''}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      contactInfo: {
                        ...prev.contactInfo,
                        emergencyContact: {
                          ...prev.contactInfo?.emergencyContact,
                          name: e.target.value
                        }
                      }
                    }));
                  }}
                  error={!!formErrors.emergencyContactName}
                  helperText={formErrors.emergencyContactName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact Relationship"
                  value={formData.contactInfo?.emergencyContact?.relationship || ''}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      contactInfo: {
                        ...prev.contactInfo,
                        emergencyContact: {
                          ...prev.contactInfo?.emergencyContact,
                          relationship: e.target.value
                        }
                      }
                    }));
                  }}
                  error={!!formErrors.emergencyContactRelationship}
                  helperText={formErrors.emergencyContactRelationship}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact Phone"
                  value={formData.contactInfo?.emergencyContact?.phone || ''}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      contactInfo: {
                        ...prev.contactInfo,
                        emergencyContact: {
                          ...prev.contactInfo?.emergencyContact,
                          phone: e.target.value
                        }
                      }
                    }));
                  }}
                  error={!!formErrors.emergencyContactPhone}
                  helperText={formErrors.emergencyContactPhone}
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 3 && (
            <Typography variant="body1">
              Skills & Education form will be implemented in the next step.
            </Typography>
          )}

          {activeStep === 4 && (
            <Typography variant="body1">
              Leave & Attendance form will be implemented in the next step.
            </Typography>
          )}
        </Box>

        {/* Navigation buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            disabled={loading}
          >
            {activeStep === steps.length - 1 ? 'Save Changes' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default EmployeeEditPage;
