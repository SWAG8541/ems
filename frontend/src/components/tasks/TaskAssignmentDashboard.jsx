import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  AvatarGroup,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Badge,
  LinearProgress
} from '@mui/material';

// Icons
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FlagIcon from '@mui/icons-material/Flag';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

import taskService from '../../api/taskService';
import employeeService from '../../api/employeeService';
import projectService from '../../api/projectService';
import notificationService from '../../api/notificationService';

const TaskAssignmentDashboard = ({ projectId }) => {
  const navigate = useNavigate();
  
  // State variables
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openNotifyDialog, setOpenNotifyDialog] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [tasksByAssignee, setTasksByAssignee] = useState({});
  const [projectFilter, setProjectFilter] = useState(projectId || 'all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [projectId]);
  
  // Fetch all necessary data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch tasks
      let tasksData = [];
      if (projectId) {
        tasksData = await taskService.getTasksByProject(projectId);
      } else {
        tasksData = await taskService.getAllTasks();
      }
      
      // Fetch employees
      const employeesData = await employeeService.getAllEmployees();
      const employeesList = Array.isArray(employeesData) ? employeesData : 
                           (employeesData.employees || []);
      
      // Fetch projects
      const projectsData = await projectService.getAllProjects();
      const projectsList = Array.isArray(projectsData) ? projectsData : 
                          (projectsData.projects || []);
      
      // Group tasks by assignee
      const taskGroups = groupTasksByAssignee(tasksData, employeesList);
      
      setTasks(tasksData);
      setEmployees(employeesList);
      setProjects(projectsList);
      setTasksByAssignee(taskGroups);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Group tasks by assignee
  const groupTasksByAssignee = (tasks, employees) => {
    const groups = {
      unassigned: []
    };
    
    // Initialize groups for each employee
    employees.forEach(employee => {
      const employeeId = employee._id || employee.id;
      groups[employeeId] = [];
    });
    
    // Group tasks
    tasks.forEach(task => {
      if (task.assignedTo && task.assignedTo._id) {
        const assigneeId = task.assignedTo._id;
        if (groups[assigneeId]) {
          groups[assigneeId].push(task);
        } else {
          groups[assigneeId] = [task];
        }
      } else {
        groups.unassigned.push(task);
      }
    });
    
    return groups;
  };
  
  // Filter tasks based on selected filters
  const getFilteredTasks = () => {
    return tasks.filter(task => {
      // Filter by project
      const matchesProject = projectFilter === 'all' || task.project?._id === projectFilter;
      
      // Filter by status
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      
      // Filter by priority
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      
      return matchesProject && matchesStatus && matchesPriority;
    });
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
    if (selectedTasks.length === getFilteredTasks().length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(getFilteredTasks().map(task => task._id));
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
  
  // Get priority color
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
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Calculate workload percentage for an employee
  const calculateWorkload = (employeeId) => {
    const employeeTasks = tasksByAssignee[employeeId] || [];
    const totalTasks = employeeTasks.length;
    
    if (totalTasks === 0) return 0;
    
    const completedTasks = employeeTasks.filter(task => task.status === 'done').length;
    const workloadPercentage = Math.round((completedTasks / totalTasks) * 100);
    
    return 100 - workloadPercentage; // Higher percentage means more work remaining
  };
  
  // Render employee card with tasks
  const renderEmployeeCard = (employee) => {
    const employeeId = employee._id || employee.id;
    const employeeTasks = tasksByAssignee[employeeId] || [];
    const workload = calculateWorkload(employeeId);
    const workloadColor = workload > 75 ? 'error' : workload > 50 ? 'warning' : 'success';
    
    return (
      <Grid key={employeeId} size={{ xs: 12, md: 6, lg: 4 }}>
        <Card>
          <CardHeader
            avatar={
              <Avatar>
                {employee.user?.name?.charAt(0) || employee.name?.charAt(0) || 'U'}
              </Avatar>
            }
            title={employee.user?.name || employee.name}
            subheader={employee.department?.name || employee.position || 'Employee'}
            action={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title="Current Workload">
                  <Chip 
                    label={`${workload}%`} 
                    color={workloadColor} 
                    size="small" 
                    sx={{ mr: 1 }}
                  />
                </Tooltip>
                <IconButton size="small">
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
            }
          />
          <Divider />
          <CardContent sx={{ p: 0 }}>
            <List dense>
              {employeeTasks.length === 0 ? (
                <ListItem>
                  <ListItemText 
                    primary="No tasks assigned" 
                    secondary="This employee has no tasks assigned yet"
                  />
                </ListItem>
              ) : (
                employeeTasks.slice(0, 5).map(task => (
                  <ListItem 
                    key={task._id} 
                    button 
                    onClick={() => navigate(`/tasks/${task._id}`)}
                    sx={{ 
                      borderLeft: 4, 
                      borderColor: `${getPriorityColor(task.priority)}.main`,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: getStatusColor(task.status) + '.light' }}>
                        {getStatusIcon(task.status)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={task.title} 
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.75rem' }} />
                            <Typography variant="caption">
                              {formatDate(task.dueDate)}
                            </Typography>
                          </Box>
                          <Chip 
                            label={task.priority} 
                            size="small" 
                            color={getPriorityColor(task.priority)} 
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Checkbox
                        edge="end"
                        checked={selectedTasks.includes(task._id)}
                        onChange={() => handleTaskSelection(task._id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))
              )}
              {employeeTasks.length > 5 && (
                <ListItem button onClick={() => navigate(`/tasks?assignee=${employeeId}`)}>
                  <ListItemText 
                    primary={`View all ${employeeTasks.length} tasks`} 
                    sx={{ textAlign: 'center', color: 'primary.main' }}
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>
    );
  };
  
  // Render unassigned tasks card
  const renderUnassignedTasksCard = () => {
    const unassignedTasks = tasksByAssignee.unassigned || [];
    
    return (
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <Card sx={{ bgcolor: '#f5f5f5' }}>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <AssignmentIcon />
              </Avatar>
            }
            title="Unassigned Tasks"
            subheader={`${unassignedTasks.length} tasks need assignment`}
            action={
              <Button
                size="small"
                variant="outlined"
                startIcon={<PersonAddIcon />}
                onClick={handleOpenAssignDialog}
                disabled={selectedTasks.length === 0}
              >
                Assign
              </Button>
            }
          />
          <Divider />
          <CardContent sx={{ p: 0 }}>
            <List dense>
              {unassignedTasks.length === 0 ? (
                <ListItem>
                  <ListItemText 
                    primary="No unassigned tasks" 
                    secondary="All tasks have been assigned"
                  />
                </ListItem>
              ) : (
                unassignedTasks.map(task => (
                  <ListItem 
                    key={task._id} 
                    button 
                    onClick={() => navigate(`/tasks/${task._id}`)}
                    sx={{ 
                      borderLeft: 4, 
                      borderColor: `${getPriorityColor(task.priority)}.main`,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: getStatusColor(task.status) + '.light' }}>
                        {getStatusIcon(task.status)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={task.title} 
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.75rem' }} />
                            <Typography variant="caption">
                              {formatDate(task.dueDate)}
                            </Typography>
                          </Box>
                          <Chip 
                            label={task.priority} 
                            size="small" 
                            color={getPriorityColor(task.priority)} 
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Checkbox
                        edge="end"
                        checked={selectedTasks.includes(task._id)}
                        onChange={() => handleTaskSelection(task._id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>
    );
  };
  
  return (
    <Box>
      {/* Header with actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Task Assignment Dashboard
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<NotificationsIcon />}
            onClick={handleOpenNotifyDialog}
            disabled={selectedTasks.length === 0}
            sx={{ mr: 1 }}
          >
            Notify
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={handleOpenAssignDialog}
            disabled={selectedTasks.length === 0}
          >
            Assign Tasks
          </Button>
        </Box>
      </Box>
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Project</InputLabel>
              <Select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                label="Project"
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
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="todo">To Do</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="review">Review</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
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
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={selectedTasks.length > 0 ? <CheckCircleIcon /> : <DragIndicatorIcon />}
                onClick={handleSelectAllTasks}
              >
                {selectedTasks.length === getFilteredTasks().length ? 'Deselect All' : 'Select All'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Task assignment grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Unassigned tasks card */}
          {renderUnassignedTasksCard()}
          
          {/* Employee cards */}
          {employees.map(employee => renderEmployeeCard(employee))}
        </Grid>
      )}
      
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

export default TaskAssignmentDashboard;
