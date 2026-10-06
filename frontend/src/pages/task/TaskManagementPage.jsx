import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  getAllTasks,
  getTasksByProject,
  getTasksByAssignee,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus
} from '../../redux/task/taskSlice';
import { getProjectById } from '../../redux/project/projectSlice';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FilterList as FilterListIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Flag as FlagIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
// Import DatePicker directly
import SimpleDatePicker from '../../components/SimpleDatePicker';
import employeeService from '../../api/employeeService';

const TaskManagementPage = () => {
  const { projectId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    project: projectId || '',
    assignee: '',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    priority: 'medium',
    status: 'todo',
    estimatedHours: 0,
    tags: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [employees, setEmployees] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { tasks: reduxTasks, loading: tasksLoading } = useSelector((state) => state.task);
  const { project: reduxProject, loading: projectLoading } = useSelector((state) => state.project);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (projectId) {
          // Fetch project details
          dispatch(getProjectById(projectId))
            .unwrap()
            .then(projectData => {
              setProject(projectData);
            })
            .catch(err => {
              setError('Failed to fetch project details. Please try again later.');
              console.error(err);
            });

          // Fetch tasks for this project
          dispatch(getTasksByProject(projectId))
            .unwrap()
            .then(tasksData => {
              setTasks(tasksData);
            })
            .catch(err => {
              setError('Failed to fetch tasks. Please try again later.');
              console.error(err);
            });
        } else {
          // Fetch all tasks or tasks assigned to current user
          const employeeResponse = await employeeService.getEmployeeByUserId(user.id);

          if (user.role?.name === 'admin' || user.role?.name === 'manager') {
            // Admin or manager can see all tasks
            dispatch(getAllTasks())
              .unwrap()
              .then(tasksData => {
                setTasks(tasksData);
              })
              .catch(err => {
                setError('Failed to fetch tasks. Please try again later.');
                console.error(err);
              });
          } else {
            // Regular employees see only their assigned tasks
            dispatch(getTasksByAssignee(employeeResponse._id))
              .unwrap()
              .then(tasksData => {
                setTasks(tasksData);
              })
              .catch(err => {
                setError('Failed to fetch tasks. Please try again later.');
                console.error(err);
              });
          }
        }

        // Fetch employees for assignee selection
        const employeesData = await employeeService.getAllEmployees();

        // Handle both array and object response formats
        if (employeesData && employeesData.employees) {
          setEmployees(employeesData.employees);
        } else if (Array.isArray(employeesData)) {
          setEmployees(employeesData);
        } else {
          setEmployees([]);
        }

        setError(null);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, projectId, user.id, user.role?.name]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Open task dialog
  const handleOpenTaskDialog = () => {
    setTaskDialogOpen(true);
    setTaskFormData({
      ...taskFormData,
      project: projectId || ''
    });
  };

  // Close task dialog
  const handleCloseTaskDialog = () => {
    setTaskDialogOpen(false);
    setSelectedTask(null);
    setTaskFormData({
      title: '',
      description: '',
      project: projectId || '',
      assignee: '',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      priority: 'medium',
      status: 'todo',
      estimatedHours: 0,
      tags: []
    });
    setFormErrors({});
  };

  // Handle task form change
  const handleTaskFormChange = (event) => {
    const { name, value } = event.target;
    setTaskFormData({
      ...taskFormData,
      [name]: value
    });

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  // Handle date change
  const handleDateChange = (date) => {
    setTaskFormData({
      ...taskFormData,
      dueDate: date
    });

    // Clear error for this field if it exists
    if (formErrors.dueDate) {
      setFormErrors({
        ...formErrors,
        dueDate: null
      });
    }
  };

  // Submit task
  const handleSubmitTask = async () => {
    // Validate form
    const errors = {};

    if (!taskFormData.title.trim()) {
      errors.title = 'Task title is required';
    }

    if (!taskFormData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!taskFormData.project) {
      errors.project = 'Project is required';
    }

    if (!taskFormData.assignee) {
      errors.assignee = 'Assignee is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Prepare task data
    const taskData = {
      ...taskFormData,
      dueDate: taskFormData.dueDate.toISOString()
    };

    try {
      setLoading(true);

      if (selectedTask) {
        // Update existing task
        await dispatch(updateTask({ id: selectedTask._id, taskData }))
          .unwrap()
          .then(updatedTask => {
            // Update tasks list
            setTasks(tasks.map(t => t._id === updatedTask._id ? updatedTask : t));

            // Close dialog
            handleCloseTaskDialog();

            // Show success message
            setError(null);
          })
          .catch(err => {
            setError('Failed to update task. Please try again.');
            console.error(err);
          });
      } else {
        // Create new task
        await dispatch(createTask(taskData))
          .unwrap()
          .then(newTask => {
            // Add new task to state
            setTasks([newTask, ...tasks]);

            // Close dialog
            handleCloseTaskDialog();

            // Show success message
            setError(null);
          })
          .catch(err => {
            setError('Failed to create task. Please try again.');
            console.error(err);
          });
      }
    } catch (err) {
      setError('Failed to submit task. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // View task details
  const handleViewTask = (task) => {
    navigate(`/tasks/${task._id}`);
  };

  // Edit task
  const handleEditTask = (task) => {
    setSelectedTask(task);
    setTaskFormData({
      title: task.title,
      description: task.description,
      project: task.project?._id || task.project || '',
      assignee: task.assignee?._id || task.assignee || '',
      dueDate: new Date(task.dueDate),
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      estimatedHours: task.estimatedHours || 0,
      tags: task.tags || []
    });
    setTaskDialogOpen(true);
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        setLoading(true);

        await dispatch(deleteTask(taskId))
          .unwrap()
          .then(() => {
            // Remove task from state
            setTasks(tasks.filter(task => task._id !== taskId));

            // Show success message
            setError(null);
          })
          .catch(err => {
            setError('Failed to delete task. Please try again.');
            console.error(err);
          });
      } catch (err) {
        setError('Failed to delete task. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Update task status
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      setLoading(true);

      await dispatch(updateTaskStatus({ id: taskId, status: newStatus }))
        .unwrap()
        .then(updatedTask => {
          // Update task in state
          setTasks(tasks.map(task => task._id === updatedTask._id ? updatedTask : task));

          // Show success message
          setError(null);
        })
        .catch(err => {
          setError('Failed to update task status. Please try again.');
          console.error(err);
        });
    } catch (err) {
      setError('Failed to update task status. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'priority':
        setFilterPriority(value);
        break;
      case 'status':
        setFilterStatus(value);
        break;
      case 'assignee':
        setFilterAssignee(value);
        break;
      default:
        break;
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      todo: 'info',
      in_progress: 'warning',
      review: 'secondary',
      completed: 'success',
      blocked: 'error'
    };
    return colors[status] || 'default';
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      low: 'info',
      medium: 'warning',
      high: 'error'
    };
    return colors[priority] || 'default';
  };

  // Filter tasks based on tab, search, and filters
  const filteredTasks = tasks.filter(task => {
    // Filter by tab
    if (tabValue === 0) {
      // All tasks
    } else if (tabValue === 1) {
      // My tasks
      if (task.assignee?._id !== user.employeeId) return false;
    } else if (tabValue === 2) {
      // Todo tasks
      if (task.status !== 'todo') return false;
    } else if (tabValue === 3) {
      // In Progress tasks
      if (task.status !== 'in_progress') return false;
    } else if (tabValue === 4) {
      // Completed tasks
      if (task.status !== 'completed') return false;
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.assignee?.user?.name?.toLowerCase().includes(query)
      );
    }

    // Filter by priority
    if (filterPriority !== 'all' && task.priority !== filterPriority) {
      return false;
    }

    // Filter by status
    if (filterStatus !== 'all' && task.status !== filterStatus) {
      return false;
    }

    // Filter by assignee
    if (filterAssignee !== 'all' && task.assignee?._id !== filterAssignee) {
      return false;
    }

    return true;
  });

  // DataGrid columns
  const columns = [
    {
      field: 'title',
      headerName: 'Task Title',
      width: 250,
      flex: 1
    },
    {
      field: 'project',
      headerName: 'Project',
      width: 150,
      valueGetter: (_value, row) => row.project?.name || 'N/A'
    },
    {
      field: 'assignee',
      headerName: 'Assignee',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ mr: 1, fontSize: 'small' }} />
          <Typography variant="body2">
            {params.row.assignee?.user?.name || 'Unassigned'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'dueDate',
      headerName: 'Due Date',
      width: 120,
      valueFormatter: (value) => formatDate(value)
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value.charAt(0).toUpperCase() + params.value.slice(1).replace('_', ' ')}
          size="small"
          color={getStatusColor(params.value)}
        />
      )
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
          size="small"
          color={getPriorityColor(params.value)}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Task">
            <IconButton size="small" onClick={() => handleViewTask(params.row)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Task">
            <IconButton size="small" onClick={() => handleEditTask(params.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Task">
            <IconButton size="small" color="error" onClick={() => handleDeleteTask(params.row._id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {params.row.status !== 'completed' && (
            <Tooltip title="Mark as Completed">
              <IconButton
                size="small"
                color="success"
                onClick={() => handleUpdateStatus(params.row._id, 'completed')}
              >
                <CheckCircleIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {projectId && (
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              component={Link}
              to="/projects"
              sx={{ mr: 2 }}
            >
              Back to Projects
            </Button>
          )}
          <Typography variant="h4" component="h1">
            {projectId ? `${project?.name || 'Project'} Tasks` : 'Task Management'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenTaskDialog}
        >
          Create Task
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Project Info */}
      {projectId && project && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6">{project.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {project.description}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Chip
                  label={project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('_', ' ')}
                  color={project.status === 'active' ? 'success' : project.status === 'completed' ? 'secondary' : 'info'}
                />
                <Chip
                  label={`${formatDate(project.startDate)} - ${formatDate(project.endDate)}`}
                  icon={<AccessTimeIcon />}
                  variant="outlined"
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Tasks" />
          <Tab label="My Tasks" />
          <Tab label="To Do" />
          <Tab label="In Progress" />
          <Tab label="Completed" />
        </Tabs>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Search Tasks"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by title, description..."
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={filterPriority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                label="Priority"
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="todo">To Do</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="review">Review</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Assignee</InputLabel>
              <Select
                value={filterAssignee}
                onChange={(e) => handleFilterChange('assignee', e.target.value)}
                label="Assignee"
              >
                <MenuItem value="all">All Assignees</MenuItem>
                {employees.map((employee) => (
                  <MenuItem key={employee._id} value={employee._id}>
                    {employee.user?.name || employee.employeeId}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Tasks Table */}
      <Paper sx={{ height: 600, width: '100%' }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Loading tasks...
            </Typography>
          </Box>
        ) : (
          <DataGrid
            rows={filteredTasks}
            columns={columns}
            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            pageSizeOptions={[10, 25, 50]}
            checkboxSelection={false}
            disableRowSelectionOnClick
            getRowId={(row) => row._id}
            loading={loading}
          />
        )}
      </Paper>

      {/* Task Dialog */}
      <Dialog
        open={taskDialogOpen}
        onClose={handleCloseTaskDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTask ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Task Title"
                name="title"
                value={taskFormData.title}
                onChange={handleTaskFormChange}
                error={!!formErrors.title}
                helperText={formErrors.title}
                required
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={taskFormData.description}
                onChange={handleTaskFormChange}
                multiline
                rows={4}
                error={!!formErrors.description}
                helperText={formErrors.description}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth error={!!formErrors.project} required>
                <InputLabel>Project</InputLabel>
                <Select
                  name="project"
                  value={taskFormData.project}
                  onChange={handleTaskFormChange}
                  label="Project"
                  disabled={!!projectId}
                >
                  <MenuItem value="">Select Project</MenuItem>
                  {/* Project options would be populated here */}
                </Select>
                {formErrors.project && <FormHelperText>{formErrors.project}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth error={!!formErrors.assignee} required>
                <InputLabel>Assignee</InputLabel>
                <Select
                  name="assignee"
                  value={taskFormData.assignee}
                  onChange={handleTaskFormChange}
                  label="Assignee"
                >
                  <MenuItem value="">Select Assignee</MenuItem>
                  {employees.map((employee) => (
                    <MenuItem key={employee._id} value={employee._id}>
                      {employee.user?.name || employee.employeeId}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.assignee && <FormHelperText>{formErrors.assignee}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <SimpleDatePicker
                label="Due Date"
                value={taskFormData.dueDate}
                onChange={handleDateChange}
                error={!!formErrors.dueDate}
                helperText={formErrors.dueDate}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={taskFormData.priority}
                  onChange={handleTaskFormChange}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={taskFormData.status}
                  onChange={handleTaskFormChange}
                  label="Status"
                >
                  <MenuItem value="todo">To Do</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="review">Review</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="blocked">Blocked</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Estimated Hours"
                name="estimatedHours"
                type="number"
                value={taskFormData.estimatedHours}
                onChange={handleTaskFormChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTaskDialog}>Cancel</Button>
          <Button
            onClick={handleSubmitTask}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : (selectedTask ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskManagementPage;
