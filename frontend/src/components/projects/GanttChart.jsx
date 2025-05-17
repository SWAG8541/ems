import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Grid,
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
  DialogActions
} from '@mui/material';

// Icons
import TodayIcon from '@mui/icons-material/Today';
import FilterListIcon from '@mui/icons-material/FilterList';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import PrintIcon from '@mui/icons-material/Print';
import SaveIcon from '@mui/icons-material/Save';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FlagIcon from '@mui/icons-material/Flag';
import EditIcon from '@mui/icons-material/Edit';

// Date utilities
import { format, addDays, subDays, differenceInDays, isWeekend, isSameDay, parseISO } from 'date-fns';

// Services
import taskService from '../../api/taskService';
import projectService from '../../api/projectService';

const GanttChart = ({ projectId }) => {
  // State variables
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(addDays(new Date(), 30));
  const [visibleDays, setVisibleDays] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = day, 2 = week, 3 = month
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  
  // Fetch project and tasks data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch project details
        const projectData = await projectService.getProjectById(projectId);
        setProject(projectData);
        
        // Fetch tasks for the project
        const tasksData = await taskService.getTasksByProject(projectId);
        setTasks(tasksData);
        
        // Set start and end dates based on project and tasks
        if (projectData.startDate || projectData.endDate) {
          const projectStartDate = projectData.startDate ? new Date(projectData.startDate) : new Date();
          const projectEndDate = projectData.endDate ? new Date(projectData.endDate) : addDays(new Date(), 30);
          
          setStartDate(projectStartDate);
          setEndDate(projectEndDate);
        } else if (tasksData.length > 0) {
          // Find earliest start date and latest end date from tasks
          let earliestDate = new Date();
          let latestDate = addDays(new Date(), 30);
          
          tasksData.forEach(task => {
            if (task.startDate && new Date(task.startDate) < earliestDate) {
              earliestDate = new Date(task.startDate);
            }
            if (task.dueDate && new Date(task.dueDate) > latestDate) {
              latestDate = new Date(task.dueDate);
            }
          });
          
          setStartDate(subDays(earliestDate, 3)); // Add buffer
          setEndDate(addDays(latestDate, 3)); // Add buffer
        }
        
      } catch (err) {
        console.error('Error fetching data for Gantt chart:', err);
        setError('Failed to load project data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (projectId) {
      fetchData();
    }
  }, [projectId]);
  
  // Generate visible days based on start/end dates and zoom level
  useEffect(() => {
    const days = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
    
    setVisibleDays(days);
  }, [startDate, endDate]);
  
  // Handle zoom in
  const handleZoomIn = () => {
    if (zoomLevel < 3) {
      setZoomLevel(zoomLevel + 1);
    }
  };
  
  // Handle zoom out
  const handleZoomOut = () => {
    if (zoomLevel > 1) {
      setZoomLevel(zoomLevel - 1);
    }
  };
  
  // Handle task click
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setTaskDetailsOpen(true);
  };
  
  // Close task details dialog
  const handleCloseTaskDetails = () => {
    setTaskDetailsOpen(false);
  };
  
  // Handle filter change
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    if (name === 'status') {
      setFilterStatus(value);
    } else if (name === 'assignee') {
      setFilterAssignee(value);
    }
  };
  
  // Filter tasks based on selected filters
  const getFilteredTasks = () => {
    return tasks.filter(task => {
      // Filter by status
      if (filterStatus !== 'all' && task.status !== filterStatus) {
        return false;
      }
      
      // Filter by assignee
      if (filterAssignee !== 'all') {
        if (filterAssignee === 'unassigned' && task.assignedTo) {
          return false;
        } else if (filterAssignee !== 'unassigned' && (!task.assignedTo || task.assignedTo._id !== filterAssignee)) {
          return false;
        }
      }
      
      return true;
    });
  };
  
  // Get task duration in days
  const getTaskDuration = (task) => {
    if (!task.startDate || !task.dueDate) {
      return 1; // Default to 1 day if no dates
    }
    
    const start = new Date(task.startDate);
    const end = new Date(task.dueDate);
    
    return Math.max(1, differenceInDays(end, start) + 1); // Minimum 1 day
  };
  
  // Get task position (left offset) in the timeline
  const getTaskPosition = (task) => {
    if (!task.startDate) {
      return 0;
    }
    
    const taskStart = new Date(task.startDate);
    const daysFromStart = Math.max(0, differenceInDays(taskStart, startDate));
    
    return daysFromStart;
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'todo':
        return '#e0e0e0';
      case 'in_progress':
        return '#bbdefb';
      case 'review':
        return '#ffe0b2';
      case 'done':
        return '#c8e6c9';
      default:
        return '#e0e0e0';
    }
  };
  
  // Get status border color
  const getStatusBorderColor = (status) => {
    switch (status) {
      case 'todo':
        return '#9e9e9e';
      case 'in_progress':
        return '#2196f3';
      case 'review':
        return '#ff9800';
      case 'done':
        return '#4caf50';
      default:
        return '#9e9e9e';
    }
  };
  
  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return '#4caf50';
      case 'medium':
        return '#2196f3';
      case 'high':
        return '#ff9800';
      case 'urgent':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };
  
  // Format date for display
  const formatDate = (date) => {
    return format(new Date(date), 'MMM d, yyyy');
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
  
  // Calculate column width based on zoom level
  const dayWidth = zoomLevel === 1 ? 50 : zoomLevel === 2 ? 30 : 20;
  
  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Project Timeline: {project?.name}
          </Typography>
          <Box>
            <Tooltip title="Zoom In">
              <IconButton onClick={handleZoomIn} disabled={zoomLevel >= 3}>
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom Out">
              <IconButton onClick={handleZoomOut} disabled={zoomLevel <= 1}>
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print">
              <IconButton>
                <PrintIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status Filter</InputLabel>
              <Select
                name="status"
                value={filterStatus}
                onChange={handleFilterChange}
                label="Status Filter"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="todo">To Do</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="review">Review</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Assignee Filter</InputLabel>
              <Select
                name="assignee"
                value={filterAssignee}
                onChange={handleFilterChange}
                label="Assignee Filter"
              >
                <MenuItem value="all">All Assignees</MenuItem>
                <MenuItem value="unassigned">Unassigned</MenuItem>
                {project?.team?.map(member => (
                  <MenuItem key={member._id} value={member._id}>
                    {member.user?.name || member.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                Project Duration: {formatDate(startDate)} - {formatDate(endDate)}
              </Typography>
              <Chip 
                icon={<TodayIcon />} 
                label={`${visibleDays.length} days`} 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ overflow: 'auto' }}>
        <Box sx={{ display: 'flex', minWidth: visibleDays.length * dayWidth + 300 }}>
          {/* Task labels column */}
          <Box sx={{ width: 300, flexShrink: 0, borderRight: 1, borderColor: 'divider' }}>
            <Box sx={{ height: 60, p: 1, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Task
              </Typography>
            </Box>
            
            {getFilteredTasks().map((task, index) => (
              <Box 
                key={task._id} 
                sx={{ 
                  height: 60, 
                  p: 1, 
                  borderBottom: 1, 
                  borderColor: 'divider',
                  bgcolor: index % 2 === 0 ? 'background.paper' : 'action.hover',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <Typography variant="body2" fontWeight="medium">
                    {task.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Chip 
                      size="small" 
                      label={task.status.replace('_', ' ')} 
                      sx={{ 
                        height: 20, 
                        fontSize: '0.7rem',
                        bgcolor: getStatusColor(task.status),
                        borderColor: getStatusBorderColor(task.status),
                        mr: 0.5
                      }} 
                      variant="outlined" 
                    />
                    {task.assignedTo && (
                      <Tooltip title={`Assigned to: ${task.assignedTo.user?.name || task.assignedTo.name}`}>
                        <PersonIcon fontSize="small" color="action" />
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
          
          {/* Timeline grid */}
          <Box sx={{ flexGrow: 1 }}>
            {/* Date headers */}
            <Box sx={{ display: 'flex', height: 60, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
              {visibleDays.map((day, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    width: dayWidth, 
                    borderRight: 1, 
                    borderColor: 'divider',
                    textAlign: 'center',
                    p: 1,
                    bgcolor: isWeekend(day) ? 'action.hover' : 'inherit'
                  }}
                >
                  <Typography variant="caption" display="block">
                    {format(day, 'EEE')}
                  </Typography>
                  <Typography variant="caption" fontWeight="bold">
                    {format(day, 'MMM d')}
                  </Typography>
                </Box>
              ))}
            </Box>
            
            {/* Task bars */}
            {getFilteredTasks().map((task, index) => (
              <Box 
                key={task._id} 
                sx={{ 
                  position: 'relative', 
                  height: 60, 
                  borderBottom: 1, 
                  borderColor: 'divider',
                  bgcolor: index % 2 === 0 ? 'background.paper' : 'action.hover'
                }}
              >
                {/* Task bar */}
                {task.startDate && (
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      left: getTaskPosition(task) * dayWidth,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      height: 30,
                      width: getTaskDuration(task) * dayWidth,
                      bgcolor: getStatusColor(task.status),
                      border: 1,
                      borderColor: getStatusBorderColor(task.status),
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 2
                      }
                    }}
                    onClick={() => handleTaskClick(task)}
                  >
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        px: 1
                      }}
                    >
                      {task.title}
                    </Typography>
                  </Box>
                )}
                
                {/* Today marker */}
                {visibleDays.some(day => isSameDay(day, new Date())) && (
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      left: differenceInDays(new Date(), startDate) * dayWidth,
                      top: 0,
                      height: '100%',
                      width: 2,
                      bgcolor: 'error.main',
                      zIndex: 1
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>
      
      {/* Task Details Dialog */}
      <Dialog open={taskDetailsOpen} onClose={handleCloseTaskDetails} maxWidth="sm" fullWidth>
        {selectedTask && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{selectedTask.title}</Typography>
                <Chip 
                  label={selectedTask.status.replace('_', ' ')} 
                  color={getStatusColor(selectedTask.status)} 
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body1" gutterBottom>
                    {selectedTask.description || 'No description provided.'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Start Date
                  </Typography>
                  <Typography variant="body2">
                    {selectedTask.startDate ? formatDate(selectedTask.startDate) : 'Not set'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Due Date
                  </Typography>
                  <Typography variant="body2">
                    {selectedTask.dueDate ? formatDate(selectedTask.dueDate) : 'Not set'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Assigned To
                  </Typography>
                  <Typography variant="body2">
                    {selectedTask.assignedTo ? 
                      (selectedTask.assignedTo.user?.name || selectedTask.assignedTo.name) : 
                      'Unassigned'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Priority
                  </Typography>
                  <Chip 
                    size="small" 
                    label={selectedTask.priority} 
                    sx={{ bgcolor: getPriorityColor(selectedTask.priority) + '20', color: getPriorityColor(selectedTask.priority) }} 
                  />
                </Grid>
                
                {selectedTask.estimatedHours > 0 && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Estimated Hours
                    </Typography>
                    <Typography variant="body2">
                      {selectedTask.estimatedHours} hours
                    </Typography>
                  </Grid>
                )}
                
                {selectedTask.actualHours > 0 && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Actual Hours
                    </Typography>
                    <Typography variant="body2">
                      {selectedTask.actualHours} hours
                    </Typography>
                  </Grid>
                )}
                
                {selectedTask.dependencies && selectedTask.dependencies.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Dependencies
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedTask.dependencies.map(dep => (
                        <Chip 
                          key={dep._id} 
                          size="small" 
                          label={`${dep.type}: ${dep.task.title}`} 
                          variant="outlined" 
                        />
                      ))}
                    </Box>
                  </Grid>
                )}
                
                {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Subtasks
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {selectedTask.subtasks.map(subtask => (
                        <Box 
                          key={subtask._id} 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            p: 1,
                            borderRadius: 1,
                            bgcolor: subtask.status === 'done' ? 'success.light' : 'background.paper'
                          }}
                        >
                          {subtask.status === 'done' ? (
                            <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 1 }} />
                          ) : (
                            <HourglassEmptyIcon fontSize="small" sx={{ mr: 1 }} />
                          )}
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              textDecoration: subtask.status === 'done' ? 'line-through' : 'none' 
                            }}
                          >
                            {subtask.title}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseTaskDetails}>Close</Button>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<EditIcon />}
                onClick={() => {
                  handleCloseTaskDetails();
                  // Navigate to task edit page
                  window.location.href = `/tasks/${selectedTask._id}`;
                }}
              >
                View Details
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default GanttChart;
