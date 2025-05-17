import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Autocomplete,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Divider,
  Avatar,
  AvatarGroup,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction
} from '@mui/material';

// Icons
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FlagIcon from '@mui/icons-material/Flag';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DoneIcon from '@mui/icons-material/Done';
import CommentIcon from '@mui/icons-material/Comment';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SendIcon from '@mui/icons-material/Send';
import Checkbox from '@mui/material/Checkbox';

import SimpleDatePicker from '../../components/SimpleDatePicker';

import taskService from '../../api/taskService';
import projectService from '../../api/projectService';
import employeeService from '../../api/employeeService';
import notificationService from '../../api/notificationService';

const TasksPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [currentTask, setCurrentTask] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignee: '',
    startDate: null,
    dueDate: null,
    estimatedHours: 0,
    project: projectId || ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openNotifyDialog, setOpenNotifyDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch tasks
      let tasksData = [];
      try {
        if (projectId) {
          tasksData = await taskService.getTasksByProject(projectId);

          // Fetch project details
          try {
            const projectData = await projectService.getProjectById(projectId);
            setProject(projectData);
          } catch (projectErr) {
            console.error('Error fetching project details:', projectErr);
            // Use mock project data if API fails
            setProject({ _id: projectId, name: 'Project', description: 'Project details unavailable' });
          }
        } else {
          tasksData = await taskService.getAllTasks();
        }
      } catch (tasksErr) {
        console.error('Error fetching tasks:', tasksErr);
        // Use mock tasks data if API fails
        tasksData = [
          { _id: '1', title: 'Sample Task 1', description: 'This is a sample task', status: 'todo', priority: 'medium' },
          { _id: '2', title: 'Sample Task 2', description: 'Another sample task', status: 'in_progress', priority: 'high' }
        ];
      }

      setTasks(tasksData);

      // Fetch employees for assignee selection
      try {
        const employeesData = await employeeService.getAllEmployees();
        // Handle both array and object response formats
        if (employeesData && employeesData.employees) {
          // If response is in { employees, totalCount } format
          setEmployees(employeesData.employees);
        } else if (Array.isArray(employeesData)) {
          // If response is a direct array
          setEmployees(employeesData);
        } else {
          // Fallback to empty array if no valid data
          setEmployees([]);
        }
      } catch (employeesErr) {
        console.error('Error fetching employees:', employeesErr);
        // Use mock employees data if API fails
        setEmployees([
          { _id: '1', name: 'John Doe', department: 'Engineering' },
          { _id: '2', name: 'Jane Smith', department: 'Design' }
        ]);
      }

      setError(null);
    } catch (err) {
      console.error('Error in fetchData:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  // Handle priority filter change
  const handlePriorityFilterChange = (event) => {
    setPriorityFilter(event.target.value);
  };

  // Handle assignee filter change
  const handleAssigneeFilterChange = (event) => {
    setAssigneeFilter(event.target.value);
  };

  // Filter tasks based on search query and filters
  const filteredTasks = tasks.filter(task => {
    // Filter by search query
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    // Filter by status
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

    // Filter by priority
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

    // Filter by assignee
    const matchesAssignee = assigneeFilter === 'all' ||
      (assigneeFilter === 'unassigned' ? !task.assignee :
        (task.assignee && task.assignee._id === assigneeFilter));

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  // Group tasks by status for Kanban view
  const groupedTasks = {
    todo: filteredTasks.filter(task => task.status === 'todo'),
    in_progress: filteredTasks.filter(task => task.status === 'in_progress'),
    review: filteredTasks.filter(task => task.status === 'review'),
    done: filteredTasks.filter(task => task.status === 'done')
  };

  // Open dialog for creating a new task
  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assignee: '',
      startDate: null,
      dueDate: null,
      estimatedHours: 0,
      project: projectId || ''
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  // Open dialog for editing a task
  const handleOpenEditDialog = (task) => {
    setDialogMode('edit');
    setCurrentTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      assignee: task.assignee?._id || '',
      startDate: task.startDate ? new Date(task.startDate) : null,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      estimatedHours: task.estimatedHours || 0,
      project: task.project?._id || projectId || ''
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Handle date change
  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date
    });

    // Clear error when user selects a date
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Task title is required';
    }

    if (formData.dueDate && formData.startDate && formData.dueDate < formData.startDate) {
      errors.dueDate = 'Due date cannot be before start date';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      try {
        if (dialogMode === 'create') {
          // Create new task
          await taskService.createTask(formData);
        } else {
          // Update existing task
          await taskService.updateTask(currentTask._id, formData);
        }
      } catch (apiErr) {
        console.error('API error saving task:', apiErr);
        // Show error but don't close dialog
        setError('Failed to save task: ' + (apiErr.response?.data?.message || apiErr.message || 'Unknown error'));
        setLoading(false);
        return; // Don't close dialog on error
      }

      // Refresh tasks list
      await fetchData();

      // Close dialog
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving task:', err);
      setError('Failed to save task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle task deletion
  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        setLoading(true);
        await taskService.deleteTask(taskId);
        await fetchData();
      } catch (err) {
        console.error('Error deleting task:', err);
        setError('Failed to delete task. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle task status change
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateTaskStatus(taskId, { status: newStatus });
      await fetchData();
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status. Please try again.');
    }
  };

  // Handle task selection
  const handleTaskSelection = (taskId) => {
    setSelectedTasks(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };

  // Handle bulk task selection
  const handleSelectAllTasks = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(task => task._id));
    }
  };

  // Open assign dialog
  const handleOpenAssignDialog = () => {
    if (selectedTasks.length === 0) {
      setError('Please select at least one task to assign');
      return;
    }
    setOpenAssignDialog(true);
  };

  // Close assign dialog
  const handleCloseAssignDialog = () => {
    setOpenAssignDialog(false);
  };

  // Open notification dialog
  const handleOpenNotifyDialog = () => {
    if (selectedTasks.length === 0) {
      setError('Please select at least one task to send notification');
      return;
    }
    setOpenNotifyDialog(true);
  };

  // Close notification dialog
  const handleCloseNotifyDialog = () => {
    setOpenNotifyDialog(false);
    setNotificationMessage('');
  };

  // Handle employee selection
  const handleEmployeeChange = (event) => {
    setSelectedEmployee(event.target.value);
  };

  // Handle notification message change
  const handleNotificationMessageChange = (event) => {
    setNotificationMessage(event.target.value);
  };

  // Assign tasks to selected employee
  const handleAssignTasks = async () => {
    if (!selectedEmployee) {
      setError('Please select an employee');
      return;
    }

    try {
      setLoading(true);

      // Update each selected task
      for (const taskId of selectedTasks) {
        await taskService.updateTask(taskId, { assignedTo: selectedEmployee });
      }

      // Refresh data
      await fetchData();

      // Clear selection
      setSelectedTasks([]);
      setSelectedEmployee('');

      // Close dialog
      handleCloseAssignDialog();

      // Send notification to assignee
      const selectedTasksData = tasks.filter(task => selectedTasks.includes(task._id));
      const taskTitles = selectedTasksData.map(task => task.title).join(', ');
      const employee = employees.find(emp => emp._id === selectedEmployee || emp.id === selectedEmployee);

      if (employee && employee.user) {
        const notificationData = {
          recipient: employee.user._id,
          type: 'task_assigned',
          title: 'New Tasks Assigned',
          message: `You have been assigned ${selectedTasks.length} new task(s): ${taskTitles}`,
          priority: 'normal',
          relatedModel: 'Task',
          link: '/tasks'
        };

        try {
          await notificationService.createNotification(notificationData);
        } catch (notifyErr) {
          console.error('Error sending notification:', notifyErr);
        }
      }
    } catch (err) {
      console.error('Error assigning tasks:', err);
      setError('Failed to assign tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Send notification to task assignees
  const handleSendNotification = async () => {
    if (!notificationMessage) {
      setError('Please enter a notification message');
      return;
    }

    try {
      setLoading(true);

      // Get selected tasks data
      const selectedTasksData = tasks.filter(task => selectedTasks.includes(task._id));

      // Group tasks by assignee
      const assigneeGroups = {};
      selectedTasksData.forEach(task => {
        if (task.assignedTo && task.assignedTo._id) {
          const assigneeId = task.assignedTo._id;
          if (!assigneeGroups[assigneeId]) {
            assigneeGroups[assigneeId] = {
              assignee: task.assignedTo,
              tasks: []
            };
          }
          assigneeGroups[assigneeId].tasks.push(task);
        }
      });

      // Send notification to each assignee
      for (const assigneeId in assigneeGroups) {
        const { assignee, tasks: assigneeTasks } = assigneeGroups[assigneeId];

        if (assignee.user) {
          const taskTitles = assigneeTasks.map(task => task.title).join(', ');

          const notificationData = {
            recipient: assignee.user._id,
            type: 'task_updated',
            title: 'Task Update Notification',
            message: `Regarding your task(s) ${taskTitles}: ${notificationMessage}`,
            priority: 'normal',
            relatedModel: 'Task',
            link: '/tasks'
          };

          try {
            await notificationService.createNotification(notificationData);
          } catch (notifyErr) {
            console.error('Error sending notification:', notifyErr);
          }
        }
      }

      // Clear selection and close dialog
      setSelectedTasks([]);
      handleCloseNotifyDialog();
    } catch (err) {
      console.error('Error sending notifications:', err);
      setError('Failed to send notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get priority chip color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'success';
      case 'medium':
        return 'info';
      case 'high':
        return 'warning';
      case 'urgent':
        return 'error';
      default:
        return 'default';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'todo':
        return <HourglassEmptyIcon fontSize="small" />;
      case 'in_progress':
        return <PlayArrowIcon fontSize="small" />;
      case 'review':
        return <PauseIcon fontSize="small" />;
      case 'done':
        return <CheckCircleIcon fontSize="small" />;
      default:
        return null;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'todo':
        return 'default';
      case 'in_progress':
        return 'primary';
      case 'review':
        return 'warning';
      case 'done':
        return 'success';
      default:
        return 'default';
    }
  };

  // Render task card
  const renderTaskCard = (task) => {
    return (
      <Card
        key={task._id}
        sx={{ mb: 2, cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
        onClick={() => navigate(`/tasks/${task._id}`)}>

        <CardHeader
          title={
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
              {task.title}
            </Typography>
          }
          action={
            <Box>
              <Chip
                icon={getStatusIcon(task.status)}
                label={task.status.replace('_', ' ')}
                size="small"
                color={getStatusColor(task.status)}
                sx={{ mr: 1 }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  size="small"
                  checked={selectedTasks.includes(task._id)}
                  onChange={() => handleTaskSelection(task._id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <IconButton size="small">
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          }
        />
        <CardContent sx={{ pt: 0 }}>
          {task.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {task.description.length > 100
                ? `${task.description.substring(0, 100)}...`
                : task.description}
            </Typography>
          )}

          <Grid container spacing={1} sx={{ mb: 1 }}>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  Due: {formatDate(task.dueDate)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FlagIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                <Chip
                  label={task.priority}
                  size="small"
                  color={getPriorityColor(task.priority)}
                  variant="outlined"
                />
              </Box>
            </Grid>
          </Grid>

          {task.assignee && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <PersonIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="caption">
                Assigned to: {task.assignee.name}
              </Typography>
            </Box>
          )}

          {task.estimatedHours > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Estimated: {task.estimatedHours} hours
              </Typography>
            </Box>
          )}
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'space-between' }}>
          <Box>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEditDialog(task);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(task._id);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Box>
            {task.status !== 'done' && (
              <Tooltip title="Mark as Done">
                <IconButton
                  size="small"
                  color="success"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(task._id, 'done');
                  }}
                >
                  <DoneIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {task.status === 'todo' && (
              <Tooltip title="Start Task">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(task._id, 'in_progress');
                  }}
                >
                  <PlayArrowIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </CardActions>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {project ? `Tasks: ${project.name}` : 'All Tasks'}
          </Typography>
          {project && (
            <Typography variant="body2" color="text.secondary">
              {project.description}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {selectedTasks.length > 0 && (
            <>
              <Button
                variant="outlined"
                startIcon={<PersonAddIcon />}
                onClick={handleOpenAssignDialog}
              >
                Assign ({selectedTasks.length})
              </Button>
              <Button
                variant="outlined"
                startIcon={<NotificationsIcon />}
                onClick={handleOpenNotifyDialog}
              >
                Notify
              </Button>
            </>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Create Task
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Task Filters */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Status"
                startAdornment={<FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="todo">To Do</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="review">Review</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                onChange={handlePriorityFilterChange}
                label="Priority"
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <Button
              variant="outlined"
              startIcon={selectedTasks.length > 0 ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
              onClick={handleSelectAllTasks}
              fullWidth
            >
              {selectedTasks.length === filteredTasks.length ? 'Deselect All' : 'Select All'}
            </Button>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Assignee</InputLabel>
              <Select
                value={assigneeFilter}
                onChange={handleAssigneeFilterChange}
                label="Assignee"
              >
                <MenuItem value="all">All Assignees</MenuItem>
                <MenuItem value="unassigned">Unassigned</MenuItem>
                {employees.map(employee => (
                  <MenuItem key={employee._id || employee.id} value={employee._id || employee.id}>
                    {employee.user?.name || employee.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Kanban Board View */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {/* To Do Column */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                  <HourglassEmptyIcon sx={{ mr: 1 }} /> To Do
                </Typography>
                <Chip label={groupedTasks.todo.length} size="small" />
              </Box>
              <Box sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto', pr: 1 }}>
                {groupedTasks.todo.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No tasks to do
                  </Typography>
                ) : (
                  groupedTasks.todo.map(task => renderTaskCard(task))
                )}
              </Box>
            </Paper>
          </Grid>

          {/* In Progress Column */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: '#e3f2fd', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                  <PlayArrowIcon sx={{ mr: 1 }} /> In Progress
                </Typography>
                <Chip label={groupedTasks.in_progress.length} size="small" color="primary" />
              </Box>
              <Box sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto', pr: 1 }}>
                {groupedTasks.in_progress.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No tasks in progress
                  </Typography>
                ) : (
                  groupedTasks.in_progress.map(task => renderTaskCard(task))
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Review Column */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: '#fff8e1', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                  <PauseIcon sx={{ mr: 1 }} /> Review
                </Typography>
                <Chip label={groupedTasks.review.length} size="small" color="warning" />
              </Box>
              <Box sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto', pr: 1 }}>
                {groupedTasks.review.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No tasks in review
                  </Typography>
                ) : (
                  groupedTasks.review.map(task => renderTaskCard(task))
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Done Column */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: '#e8f5e9', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon sx={{ mr: 1 }} /> Done
                </Typography>
                <Chip label={groupedTasks.done.length} size="small" color="success" />
              </Box>
              <Box sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto', pr: 1 }}>
                {groupedTasks.done.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No completed tasks
                  </Typography>
                ) : (
                  groupedTasks.done.map(task => renderTaskCard(task))
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Task Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Create New Task' : 'Edit Task'}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={!!formErrors.title}
                helperText={formErrors.title}
                required
                margin="normal"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="todo">To Do</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="review">Review</MenuItem>
                  <MenuItem value="done">Done</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Assignee</InputLabel>
                <Select
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                  label="Assignee"
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {employees.map(employee => (
                    <MenuItem key={employee._id || employee.id} value={employee._id || employee.id}>
                      {employee.user?.name || employee.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Estimated Hours"
                name="estimatedHours"
                type="number"
                value={formData.estimatedHours}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0, step: 0.5 } }}
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SimpleDatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={(date) => handleDateChange('startDate', date)}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SimpleDatePicker
                label="Due Date"
                value={formData.dueDate}
                onChange={(date) => handleDateChange('dueDate', date)}
                error={!!formErrors.dueDate}
                helperText={formErrors.dueDate}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : (dialogMode === 'create' ? 'Create' : 'Save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Task Assignment Dialog */}
      <Dialog open={openAssignDialog} onClose={handleCloseAssignDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Assign Tasks
          <IconButton
            aria-label="close"
            onClick={handleCloseAssignDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle1" gutterBottom>
            Selected Tasks: {selectedTasks.length}
          </Typography>
          <List dense sx={{ mb: 2 }}>
            {tasks
              .filter(task => selectedTasks.includes(task._id))
              .map(task => (
                <ListItem key={task._id}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getStatusColor(task.status) + '.light' }}>
                      {getStatusIcon(task.status)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={task.title}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={task.priority}
                          size="small"
                          color={getPriorityColor(task.priority)}
                        />
                        {task.project && (
                          <Typography variant="caption">
                            {task.project.name}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
          </List>

          <FormControl fullWidth margin="normal">
            <InputLabel>Assign To</InputLabel>
            <Select
              value={selectedEmployee}
              onChange={handleEmployeeChange}
              label="Assign To"
            >
              <MenuItem value="">
                <em>Select an employee</em>
              </MenuItem>
              {employees.map(employee => (
                <MenuItem key={employee._id || employee.id} value={employee._id || employee.id}>
                  {employee.user?.name || employee.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignDialog}>Cancel</Button>
          <Button
            onClick={handleAssignTasks}
            variant="contained"
            color="primary"
            disabled={loading || !selectedEmployee}
            startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Dialog */}
      <Dialog open={openNotifyDialog} onClose={handleCloseNotifyDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Send Notification
          <IconButton
            aria-label="close"
            onClick={handleCloseNotifyDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle1" gutterBottom>
            Selected Tasks: {selectedTasks.length}
          </Typography>
          <List dense sx={{ mb: 2 }}>
            {tasks
              .filter(task => selectedTasks.includes(task._id))
              .map(task => (
                <ListItem key={task._id}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getStatusColor(task.status) + '.light' }}>
                      {getStatusIcon(task.status)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={task.title}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {task.assignedTo ? (
                          <Typography variant="caption">
                            Assigned to: {task.assignedTo.user?.name || task.assignedTo.name}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="error">
                            Unassigned
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
          </List>

          <TextField
            fullWidth
            label="Notification Message"
            multiline
            rows={4}
            value={notificationMessage}
            onChange={handleNotificationMessageChange}
            placeholder="Enter a message to send to the assignees of the selected tasks..."
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNotifyDialog}>Cancel</Button>
          <Button
            onClick={handleSendNotification}
            variant="contained"
            color="primary"
            disabled={loading || !notificationMessage}
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          >
            Send Notification
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TasksPage;
