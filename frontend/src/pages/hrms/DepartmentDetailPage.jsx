import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Tab,
  Tabs
} from '@mui/material';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import GroupIcon from '@mui/icons-material/Group';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import BarChartIcon from '@mui/icons-material/BarChart';

// Custom TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`department-tabpanel-${index}`}
      aria-labelledby={`department-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const DepartmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);

  // Mock data for development
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [department, setDepartment] = useState(null);
  const [employees, setEmployees] = useState([]);

  // Fetch department data
  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        setLoading(true);

        // Fetch department by ID
        const departmentData = await departmentService.getDepartmentById(id);
        setDepartment(departmentData);

        // Fetch employees in this department
        const employeesData = await employeeService.getEmployeesByDepartment(id);
        setEmployees(employeesData || []);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching department data:', err);
        setError('Failed to load department data. Please try again.');
        setLoading(false);
      }
    };

    fetchDepartmentData();
  }, [id]);

  // Handle department deletion
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      try {
        setLoading(true);
        await departmentService.deleteDepartment(id);
        navigate('/departments');
      } catch (err) {
        console.error('Error deleting department:', err);
        setError('Failed to delete department. ' + err.message);
        setLoading(false);
      }
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Calculate budget percentage
  const calculateBudgetPercentage = () => {
    if (!department?.budget?.allocated || !department?.budget?.spent) return 0;
    return Math.round((department.budget.spent / department.budget.allocated) * 100);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={Link}
          to="/departments"
        >
          Back to Departments
        </Button>
      </Box>
    );
  }

  if (!department) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Department not found
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={Link}
          to="/departments"
        >
          Back to Departments
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={Link}
          to="/departments"
        >
          Back to Departments
        </Button>
        <Box>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            component={Link}
            to={`/departments/${id}/edit`}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* Department Header */}
      <Paper sx={{ mb: 3, overflow: 'hidden' }}>
        <Box sx={{
          p: 3,
          background: 'linear-gradient(to right, #2e7d32, #81c784)',
          color: 'white',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'center', sm: 'flex-start' },
          gap: 3
        }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: '#fff',
              color: '#2e7d32',
              fontSize: '3rem',
              border: '4px solid white'
            }}
          >
            <BusinessIcon fontSize="large" />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" gutterBottom>
              {department.name}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {department.description}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              <Chip
                icon={<GroupIcon />}
                label={`${department.employeeCount || employees.length} Employees`}
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
              />
              <Chip
                icon={<SupervisorAccountIcon />}
                label={`Manager: ${department.manager?.user?.name || 'Not Assigned'}`}
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
              />
            </Box>
          </Box>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            alignItems: { xs: 'center', sm: 'flex-end' }
          }}>
            <Typography variant="body2">
              Created: {formatDate(department.createdAt)}
            </Typography>
            <Typography variant="body2">
              Last Updated: {formatDate(department.updatedAt)}
            </Typography>
          </Box>
        </Box>

        {/* Tabs for different sections */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="department details tabs">
            <Tab label="Overview" />
            <Tab label="Employees" />
            <Tab label="Budget" />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardHeader title="Department Information" />
                <Divider />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Name"
                        secondary={department.name}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Description"
                        secondary={department.description}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Location"
                        secondary={department.location || 'N/A'}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Contact Email"
                        secondary={department.contactEmail || 'N/A'}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Contact Phone"
                        secondary={department.contactPhone || 'N/A'}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardHeader title="Department Manager" />
                <Divider />
                <CardContent>
                  {department.manager ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1">
                          {department.manager.user?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {department.manager.position}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {department.manager.user?.email}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      No manager assigned
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Employees Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              Department Employees
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to={`/employees/new?department=${id}`}
            >
              Add Employee
            </Button>
          </Box>
          <Grid container spacing={2}>
            {employees.length > 0 ? (
              employees.map((employee) => (
                <Grid key={employee._id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {employee.user?.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1">
                            {employee.user?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {employee.position}
                          </Typography>
                        </Box>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Employee ID: {employee.employeeId}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Email: {employee.user?.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Joined: {formatDate(employee.joinDate)}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          component={Link}
                          to={`/employees/${employee._id}`}
                        >
                          View Profile
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No employees in this department
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Budget Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardHeader title="Budget Overview" />
                <Divider />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Allocated Budget"
                        secondary={department.budget?.allocated ?
                          formatCurrency(department.budget.allocated, department.budget.currency) :
                          'N/A'}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Spent"
                        secondary={department.budget?.spent ?
                          formatCurrency(department.budget.spent, department.budget.currency) :
                          'N/A'}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Remaining"
                        secondary={department.budget?.allocated && department.budget?.spent ?
                          formatCurrency(department.budget.allocated - department.budget.spent, department.budget.currency) :
                          'N/A'}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Budget Utilization"
                        secondary={`${calculateBudgetPercentage()}%`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardHeader title="Budget Visualization" />
                <Divider />
                <CardContent sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Budget charts will be implemented in the next step
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default DepartmentDetailPage;
