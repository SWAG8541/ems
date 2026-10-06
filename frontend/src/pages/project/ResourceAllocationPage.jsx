import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  LinearProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

// Icons
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import GroupIcon from '@mui/icons-material/Group';
import BarChartIcon from '@mui/icons-material/BarChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Services
import employeeService from '../../api/employeeService';
import projectService from '../../api/projectService';
import taskService from '../../api/taskService';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`resource-tabpanel-${index}`}
      aria-labelledby={`resource-tab-${index}`}
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

const ResourceAllocationPage = () => {
  // State variables
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [departments, setDepartments] = useState([]);
  const [resourceData, setResourceData] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetailsOpen, setEmployeeDetailsOpen] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch employees
        const employeesData = await employeeService.getAllEmployees();
        setEmployees(Array.isArray(employeesData) ? employeesData :
                    (employeesData.employees || []));

        // Fetch projects
        const projectsData = await projectService.getAllProjects();
        setProjects(Array.isArray(projectsData) ? projectsData :
                   (projectsData.projects || []));

        // Fetch tasks
        const tasksData = await taskService.getAllTasks();
        setTasks(tasksData);

        // Extract departments
        const deptSet = new Set();
        const employeesList = Array.isArray(employeesData) ? employeesData : (employeesData.employees || []);
        employeesList.forEach(emp => {
          if (emp.department) {
            deptSet.add(emp.department.name || emp.department);
          }
        });
        setDepartments(Array.from(deptSet));

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load resource data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process resource allocation data
  useEffect(() => {
    if (employees.length > 0 && tasks.length > 0) {
      const resourceAllocation = employees.map(employee => {
        // Get tasks assigned to this employee
        const assignedTasks = tasks.filter(task =>
          task.assignedTo &&
          (task.assignedTo._id === employee._id || task.assignedTo === employee._id)
        );

        // Calculate workload metrics
        const totalTasks = assignedTasks.length;
        const completedTasks = assignedTasks.filter(task => task.status === 'done').length;
        const inProgressTasks = assignedTasks.filter(task => task.status === 'in_progress').length;
        const pendingTasks = assignedTasks.filter(task => task.status === 'todo').length;

        // Calculate estimated hours
        const totalEstimatedHours = assignedTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
        const remainingEstimatedHours = assignedTasks
          .filter(task => task.status !== 'done')
          .reduce((sum, task) => sum + (task.estimatedHours || 0), 0);

        // Calculate completion percentage
        const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Calculate workload status
        let workloadStatus = 'normal';
        if (pendingTasks > 10 || totalEstimatedHours > 80) {
          workloadStatus = 'overallocated';
        } else if (pendingTasks < 2 && totalEstimatedHours < 20) {
          workloadStatus = 'underallocated';
        }

        // Group tasks by project
        const projectAllocation = {};
        assignedTasks.forEach(task => {
          const projectId = task.project?._id || 'unassigned';
          const projectName = task.project?.name || 'Unassigned';

          if (!projectAllocation[projectId]) {
            projectAllocation[projectId] = {
              projectId,
              projectName,
              tasks: [],
              estimatedHours: 0
            };
          }

          projectAllocation[projectId].tasks.push(task);
          projectAllocation[projectId].estimatedHours += (task.estimatedHours || 0);
        });

        return {
          employee,
          totalTasks,
          completedTasks,
          inProgressTasks,
          pendingTasks,
          totalEstimatedHours,
          remainingEstimatedHours,
          completionPercentage,
          workloadStatus,
          projectAllocation: Object.values(projectAllocation),
          assignedTasks
        };
      });

      // Apply filters
      let filteredData = resourceAllocation;

      if (filterDepartment !== 'all') {
        filteredData = filteredData.filter(item =>
          item.employee.department &&
          (item.employee.department.name === filterDepartment || item.employee.department === filterDepartment)
        );
      }

      if (filterProject !== 'all') {
        filteredData = filteredData.filter(item =>
          item.projectAllocation.some(proj => proj.projectId === filterProject)
        );
      }

      setResourceData(filteredData);
    }
  }, [employees, tasks, filterDepartment, filterProject]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle filter change
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    if (name === 'department') {
      setFilterDepartment(value);
    } else if (name === 'project') {
      setFilterProject(value);
    }
  };

  // Handle employee click
  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setEmployeeDetailsOpen(true);
  };

  // Close employee details dialog
  const handleCloseEmployeeDetails = () => {
    setEmployeeDetailsOpen(false);
  };

  // Get workload status color
  const getWorkloadStatusColor = (status) => {
    switch (status) {
      case 'overallocated':
        return 'error';
      case 'underallocated':
        return 'warning';
      case 'normal':
        return 'success';
      default:
        return 'default';
    }
  };

  // Get workload status label
  const getWorkloadStatusLabel = (status) => {
    switch (status) {
      case 'overallocated':
        return 'Overallocated';
      case 'underallocated':
        return 'Underallocated';
      case 'normal':
        return 'Normal';
      default:
        return 'Unknown';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Resource Allocation
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={() => window.location.reload()}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                name="department"
                value={filterDepartment}
                onChange={handleFilterChange}
                label="Department"
                startAdornment={<FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                <MenuItem value="all">All Departments</MenuItem>
                {departments.map((dept, index) => (
                  <MenuItem key={index} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Project</InputLabel>
              <Select
                name="project"
                value={filterProject}
                onChange={handleFilterChange}
                label="Project"
                startAdornment={<FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                <MenuItem value="all">All Projects</MenuItem>
                {projects.map(project => (
                  <MenuItem key={project._id} value={project._id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Typography variant="body2" color="text.secondary">
                Showing {resourceData.length} of {employees.length} employees
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Resources
              </Typography>
              <Typography variant="h3" color="primary">
                {resourceData.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active employees
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Tasks
              </Typography>
              <Typography variant="h3" color="primary">
                {resourceData.reduce((sum, item) => sum + item.totalTasks, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Assigned tasks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overallocated
              </Typography>
              <Typography variant="h3" color="error">
                {resourceData.filter(item => item.workloadStatus === 'overallocated').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Employees with high workload
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Underallocated
              </Typography>
              <Typography variant="h3" color="warning.main">
                {resourceData.filter(item => item.workloadStatus === 'underallocated').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Employees with low workload
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="resource allocation tabs">
          <Tab icon={<BarChartIcon />} label="Workload" />
          <Tab icon={<TableChartIcon />} label="Allocation Table" />
          <Tab icon={<PieChartIcon />} label="Project Distribution" />
        </Tabs>
      </Box>

      {/* Workload Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {resourceData.map(item => (
            <Grid key={item.employee._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 6 }
                }}
                onClick={() => handleEmployeeClick(item)}
              >
                <CardHeader
                  avatar={
                    <Avatar>
                      {item.employee.user?.name?.charAt(0) || item.employee.name?.charAt(0) || 'E'}
                    </Avatar>
                  }
                  title={item.employee.user?.name || item.employee.name}
                  subheader={item.employee.department?.name || item.employee.department || 'No Department'}
                  action={
                    <Chip
                      label={getWorkloadStatusLabel(item.workloadStatus)}
                      color={getWorkloadStatusColor(item.workloadStatus)}
                      size="small"
                    />
                  }
                />
                <Divider />
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Workload
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.completionPercentage}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={item.completionPercentage}
                      color={getWorkloadStatusColor(item.workloadStatus)}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>

                  <Grid container spacing={1}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Tasks
                      </Typography>
                      <Typography variant="h6">
                        {item.totalTasks}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Estimated Hours
                      </Typography>
                      <Typography variant="h6">
                        {item.totalEstimatedHours}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Pending
                      </Typography>
                      <Typography variant="body1">
                        {item.pendingTasks}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        In Progress
                      </Typography>
                      <Typography variant="body1">
                        {item.inProgressTasks}
                      </Typography>
                    </Grid>
                  </Grid>

                  {item.projectAllocation.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Projects
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {item.projectAllocation.map(proj => (
                          <Chip
                            key={proj.projectId}
                            label={proj.projectName}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Allocation Table Tab */}
      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small">
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Department</TableCell>
                <TableCell align="right">Total Tasks</TableCell>
                <TableCell align="right">Pending</TableCell>
                <TableCell align="right">In Progress</TableCell>
                <TableCell align="right">Completed</TableCell>
                <TableCell align="right">Est. Hours</TableCell>
                <TableCell align="right">Remaining Hours</TableCell>
                <TableCell>Workload Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resourceData.map(item => (
                <TableRow
                  key={item.employee._id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {item.employee.user?.name || item.employee.name}
                  </TableCell>
                  <TableCell>{item.employee.department?.name || item.employee.department || 'No Department'}</TableCell>
                  <TableCell align="right">{item.totalTasks}</TableCell>
                  <TableCell align="right">{item.pendingTasks}</TableCell>
                  <TableCell align="right">{item.inProgressTasks}</TableCell>
                  <TableCell align="right">{item.completedTasks}</TableCell>
                  <TableCell align="right">{item.totalEstimatedHours}</TableCell>
                  <TableCell align="right">{item.remainingEstimatedHours}</TableCell>
                  <TableCell>
                    <Chip
                      label={getWorkloadStatusLabel(item.workloadStatus)}
                      color={getWorkloadStatusColor(item.workloadStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEmployeeClick(item)}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Project Distribution Tab */}
      <TabPanel value={tabValue} index={2}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Project Distribution View Coming Soon
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This feature is under development and will be available in a future update.
          </Typography>
        </Paper>
      </TabPanel>

      {/* Employee Details Dialog */}
      <Dialog open={employeeDetailsOpen} onClose={handleCloseEmployeeDetails} maxWidth="md" fullWidth>
        {selectedEmployee && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  {selectedEmployee.employee.user?.name || selectedEmployee.employee.name}
                </Typography>
                <Chip
                  label={getWorkloadStatusLabel(selectedEmployee.workloadStatus)}
                  color={getWorkloadStatusColor(selectedEmployee.workloadStatus)}
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Employee Information
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <PersonIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary="Department"
                            secondary={selectedEmployee.employee.department?.name || selectedEmployee.employee.department || 'No Department'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <BusinessCenterIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary="Position"
                            secondary={selectedEmployee.employee.position || 'Not specified'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <AccessTimeIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary="Workload"
                            secondary={`${selectedEmployee.totalEstimatedHours} hours (${selectedEmployee.totalTasks} tasks)`}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Project Allocation
                      </Typography>
                      {selectedEmployee.projectAllocation.length > 0 ? (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Project</TableCell>
                                <TableCell align="right">Tasks</TableCell>
                                <TableCell align="right">Est. Hours</TableCell>
                                <TableCell align="right">% of Workload</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedEmployee.projectAllocation.map(proj => (
                                <TableRow key={proj.projectId}>
                                  <TableCell>{proj.projectName}</TableCell>
                                  <TableCell align="right">{proj.tasks.length}</TableCell>
                                  <TableCell align="right">{proj.estimatedHours}</TableCell>
                                  <TableCell align="right">
                                    {selectedEmployee.totalEstimatedHours > 0
                                      ? Math.round((proj.estimatedHours / selectedEmployee.totalEstimatedHours) * 100)
                                      : 0}%
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No projects assigned.
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Assigned Tasks
                      </Typography>
                      {selectedEmployee.assignedTasks.length > 0 ? (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Task</TableCell>
                                <TableCell>Project</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Priority</TableCell>
                                <TableCell>Due Date</TableCell>
                                <TableCell align="right">Est. Hours</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedEmployee.assignedTasks.map(task => (
                                <TableRow key={task._id}>
                                  <TableCell>{task.title}</TableCell>
                                  <TableCell>{task.project?.name || 'Unassigned'}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={task.status.replace('_', ' ')}
                                      size="small"
                                      color={
                                        task.status === 'done' ? 'success' :
                                        task.status === 'in_progress' ? 'primary' :
                                        task.status === 'review' ? 'warning' : 'default'
                                      }
                                      variant="outlined"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={task.priority}
                                      size="small"
                                      color={
                                        task.priority === 'urgent' ? 'error' :
                                        task.priority === 'high' ? 'warning' :
                                        task.priority === 'medium' ? 'info' : 'success'
                                      }
                                      variant="outlined"
                                    />
                                  </TableCell>
                                  <TableCell>{formatDate(task.dueDate)}</TableCell>
                                  <TableCell align="right">{task.estimatedHours || 0}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No tasks assigned.
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseEmployeeDetails}>Close</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  handleCloseEmployeeDetails();
                  // Navigate to employee detail page
                  window.location.href = `/employees/${selectedEmployee.employee._id}`;
                }}
              >
                View Employee Profile
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ResourceAllocationPage;
