import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Divider,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import SimpleDatePicker from '../../components/SimpleDatePicker';
import { createEmployee } from '../../redux/employee/employeeSlice';
import departmentService from '../../api/departmentService';
import userService from '../../api/userService';
import employeeService from '../../api/employeeService';
import roleService from '../../api/roleService';

const steps = [
  'Basic Information',
  'Employment Details',
  'Contact Information',
  'Additional Details'
];

const EmployeeCreatePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.employee);

  const [activeStep, setActiveStep] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [existingUsers, setExistingUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [createNewUser, setCreateNewUser] = useState(false);

  const [formData, setFormData] = useState({
    // User information (if creating new user)
    user: {
      name: '',
      email: '',
      password: '',
      role: '' // Will be set to 'employee' by default
    },
    // Basic employee information
    employeeId: '',
    department: '',
    position: '',
    joinDate: null,
    status: 'active',
    manager: '',
    // Contact information
    contactInfo: {
      address: '',
      phone: '',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      }
    },
    // Personal information
    personalInfo: {
      dateOfBirth: null,
      gender: '',
      maritalStatus: ''
    },
    // Employment details
    employmentDetails: {
      employmentType: 'full_time',
      workHoursPerWeek: 40,
      salary: {
        amount: 0,
        currency: 'USD'
      },
      bankDetails: {
        accountNumber: '',
        bankName: '',
        branchCode: ''
      }
    }
  });

  const [errors, setErrors] = useState({});

  // Fetch departments and managers on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch departments
        const departmentsData = await departmentService.getAllDepartments();
        setDepartments(departmentsData || []);

        // Fetch existing users without employees
        const usersData = await userService.getUsersWithoutEmployees();
        setExistingUsers(usersData || []);

        // Fetch managers (employees with management role)
        const managersData = await employeeService.getAllEmployees({ role: 'manager' });
        setManagers(managersData || []);

        // Fetch roles for user creation
        const rolesData = await roleService.getAllRoles();
        setRoles(rolesData || []);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load required data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();

    // Check for department in query params
    const params = new URLSearchParams(window.location.search);
    const deptId = params.get('department');
    if (deptId) {
      setFormData(prev => ({
        ...prev,
        department: deptId
      }));
    }
  }, []);

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0: // Basic Information
        if (createNewUser) {
          if (!formData.user.name) newErrors['user.name'] = 'Name is required';
          if (!formData.user.email) newErrors['user.email'] = 'Email is required';
          else if (!/\S+@\S+\.\S+/.test(formData.user.email)) newErrors['user.email'] = 'Email is invalid';
          if (!formData.user.password) newErrors['user.password'] = 'Password is required';
          else if (formData.user.password.length < 6) newErrors['user.password'] = 'Password must be at least 6 characters';
        } else if (!selectedUser) {
          newErrors.user = 'Please select a user or create a new one';
        }

        if (!formData.position) newErrors.position = 'Position is required';
        if (!formData.joinDate) newErrors.joinDate = 'Join date is required';
        break;

      case 1: // Employment Details
        if (!formData.department) newErrors.department = 'Department is required';
        if (formData.employmentDetails.salary.amount <= 0) newErrors['employmentDetails.salary.amount'] = 'Salary must be greater than 0';
        break;

      case 2: // Contact Information
        if (!formData.contactInfo.phone) newErrors['contactInfo.phone'] = 'Phone number is required';
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child, grandchild] = name.split('.');
      if (grandchild) {
        setFormData({
          ...formData,
          [parent]: {
            ...formData[parent],
            [child]: {
              ...formData[parent][child],
              [grandchild]: value
            }
          }
        });
      } else {
        setFormData({
          ...formData,
          [parent]: {
            ...formData[parent],
            [child]: value
          }
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleDateChange = (name, date) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: date
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: date
      });
    }

    // Clear error when user selects a date
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleUserChange = (event, newValue) => {
    setSelectedUser(newValue);
    if (newValue) {
      setCreateNewUser(false);
    }
  };

  const handleSubmit = async () => {
    if (validateStep(activeStep)) {
      try {
        // Prepare data for submission
        const employeeData = { ...formData };

        // If using existing user, set the user ID
        if (!createNewUser && selectedUser) {
          employeeData.userId = selectedUser._id;
          // Remove the user object as we're using an existing user
          delete employeeData.user;
        } else if (createNewUser) {
          // Set default role for new user if not specified
          if (!employeeData.user.role) {
            employeeData.user.role = roles.find(role => role.name === 'employee')?._id || '';
          }
        }

        // Format dates properly
        if (employeeData.joinDate) {
          employeeData.joinDate = new Date(employeeData.joinDate).toISOString();
        }
        if (employeeData.personalInfo?.dateOfBirth) {
          employeeData.personalInfo.dateOfBirth = new Date(employeeData.personalInfo.dateOfBirth).toISOString();
        }

        // Dispatch action to create employee
        const resultAction = await dispatch(createEmployee(employeeData));
        if (createEmployee.fulfilled.match(resultAction)) {
          // Navigate to employee list on success
          navigate('/employees');
        }
      } catch (err) {
        console.error('Error creating employee:', err);
        setError('Failed to create employee. Please try again.');
      }
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                User Account
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="user-selection-label">User Account</InputLabel>
                <Select
                  labelId="user-selection-label"
                  value={createNewUser ? 'new' : (selectedUser ? 'existing' : '')}
                  onChange={(e) => {
                    if (e.target.value === 'new') {
                      setCreateNewUser(true);
                      setSelectedUser(null);
                    } else {
                      setCreateNewUser(false);
                    }
                  }}
                  label="User Account"
                >
                  <MenuItem value="new">Create New User</MenuItem>
                  <MenuItem value="existing">Use Existing User</MenuItem>
                </Select>
                <FormHelperText>
                  Choose whether to create a new user account or link to an existing one
                </FormHelperText>
              </FormControl>
            </Grid>

            {createNewUser ? (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="user.name"
                    value={formData.user.name}
                    onChange={handleChange}
                    error={!!errors['user.name']}
                    helperText={errors['user.name']}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="user.email"
                    type="email"
                    value={formData.user.email}
                    onChange={handleChange}
                    error={!!errors['user.email']}
                    helperText={errors['user.email']}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="user.password"
                    type="password"
                    value={formData.user.password}
                    onChange={handleChange}
                    error={!!errors['user.password']}
                    helperText={errors['user.password']}
                    required
                  />
                </Grid>
              </>
            ) : (
              <Grid item xs={12}>
                <Autocomplete
                  options={existingUsers}
                  getOptionLabel={(option) => `${option.name} (${option.email})`}
                  value={selectedUser}
                  onChange={handleUserChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Existing User"
                      error={!!errors.user}
                      helperText={errors.user}
                    />
                  )}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Employee ID"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                helperText="Leave blank to auto-generate"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                error={!!errors.position}
                helperText={errors.position || "Employee's job title"}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SimpleDatePicker
                label="Join Date"
                value={formData.joinDate}
                onChange={(date) => handleDateChange('joinDate', date)}
                error={!!errors.joinDate}
                helperText={errors.joinDate}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="on_leave">On Leave</MenuItem>
                  <MenuItem value="probation">Probation</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Employment Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.department}>
                <InputLabel>Department</InputLabel>
                <Select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  label="Department"
                  required
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.department && <FormHelperText>{errors.department}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Manager</InputLabel>
                <Select
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                  label="Manager"
                >
                  <MenuItem value="">None</MenuItem>
                  {managers.map((manager) => (
                    <MenuItem key={manager._id} value={manager._id}>
                      {manager.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Employment Type</InputLabel>
                <Select
                  name="employmentDetails.employmentType"
                  value={formData.employmentDetails.employmentType}
                  onChange={handleChange}
                  label="Employment Type"
                >
                  <MenuItem value="full_time">Full Time</MenuItem>
                  <MenuItem value="part_time">Part Time</MenuItem>
                  <MenuItem value="contract">Contract</MenuItem>
                  <MenuItem value="intern">Intern</MenuItem>
                  <MenuItem value="probation">Probation</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Work Hours Per Week"
                name="employmentDetails.workHoursPerWeek"
                type="number"
                value={formData.employmentDetails.workHoursPerWeek}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Salary Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Salary Amount"
                name="employmentDetails.salary.amount"
                type="number"
                value={formData.employmentDetails.salary.amount}
                onChange={handleChange}
                error={!!errors['employmentDetails.salary.amount']}
                helperText={errors['employmentDetails.salary.amount']}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  name="employmentDetails.salary.currency"
                  value={formData.employmentDetails.salary.currency}
                  onChange={handleChange}
                  label="Currency"
                >
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="GBP">GBP</MenuItem>
                  <MenuItem value="INR">INR</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Bank Details
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bank Name"
                name="employmentDetails.bankDetails.bankName"
                value={formData.employmentDetails.bankDetails.bankName}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Account Number"
                name="employmentDetails.bankDetails.accountNumber"
                value={formData.employmentDetails.bankDetails.accountNumber}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Branch Code"
                name="employmentDetails.bankDetails.branchCode"
                value={formData.employmentDetails.bankDetails.branchCode}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="contactInfo.address"
                value={formData.contactInfo.address}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="contactInfo.phone"
                value={formData.contactInfo.phone}
                onChange={handleChange}
                error={!!errors['contactInfo.phone']}
                helperText={errors['contactInfo.phone']}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Emergency Contact
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Emergency Contact Name"
                name="contactInfo.emergencyContact.name"
                value={formData.contactInfo.emergencyContact.name}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Relationship"
                name="contactInfo.emergencyContact.relationship"
                value={formData.contactInfo.emergencyContact.relationship}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Emergency Contact Phone"
                name="contactInfo.emergencyContact.phone"
                value={formData.contactInfo.emergencyContact.phone}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <SimpleDatePicker
                label="Date of Birth"
                value={formData.personalInfo.dateOfBirth}
                onChange={(date) => handleDateChange('personalInfo.dateOfBirth', date)}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="personalInfo.gender"
                  value={formData.personalInfo.gender}
                  onChange={handleChange}
                  label="Gender"
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                  <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Marital Status</InputLabel>
                <Select
                  name="personalInfo.maritalStatus"
                  value={formData.personalInfo.maritalStatus}
                  onChange={handleChange}
                  label="Marital Status"
                >
                  <MenuItem value="single">Single</MenuItem>
                  <MenuItem value="married">Married</MenuItem>
                  <MenuItem value="divorced">Divorced</MenuItem>
                  <MenuItem value="widowed">Widowed</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Employee
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form>
          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>

            <Box>
              <Button
                variant="outlined"
                onClick={() => navigate('/employees')}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create Employee'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default EmployeeCreatePage;
