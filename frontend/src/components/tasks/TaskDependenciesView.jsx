import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Button,
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
  Tooltip
} from '@mui/material';

// Icons
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

import taskService from '../../api/taskService';

const TaskDependenciesView = ({ task, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dependencyType, setDependencyType] = useState('blocks');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);

  // Fetch available tasks for dependencies
  useEffect(() => {
    const fetchAvailableTasks = async () => {
      try {
        setLoading(true);
        // Get tasks from the same project
        const projectTasks = await taskService.getTasksByProject(task.project?._id);
        // Filter out the current task and already dependent tasks
        const existingDependencyIds = task.dependencies?.map(dep => dep.task._id) || [];
        const availableTasks = projectTasks.filter(t => 
          t._id !== task._id && !existingDependencyIds.includes(t._id)
        );
        setAvailableTasks(availableTasks);
        setFilteredTasks(availableTasks);
      } catch (err) {
        console.error('Error fetching available tasks:', err);
        setError('Failed to load available tasks');
      } finally {
        setLoading(false);
      }
    };

    if (task.project?._id && openDialog) {
      fetchAvailableTasks();
    }
  }, [task, openDialog]);

  // Filter tasks based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTasks(availableTasks);
    } else {
      const filtered = availableTasks.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.taskNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTasks(filtered);
    }
  }, [searchQuery, availableTasks]);

  // Handle opening the add dependency dialog
  const handleOpenDialog = () => {
    setOpenDialog(true);
    setSelectedTaskId('');
    setDependencyType('blocks');
    setSearchQuery('');
  };

  // Handle closing the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle dependency type change
  const handleDependencyTypeChange = (event) => {
    setDependencyType(event.target.value);
  };

  // Handle task selection
  const handleTaskSelection = (event) => {
    setSelectedTaskId(event.target.value);
  };

  // Handle search query change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Add dependency
  const handleAddDependency = async () => {
    if (!selectedTaskId) {
      setError('Please select a task');
      return;
    }

    try {
      setLoading(true);
      const updatedTask = await taskService.addDependency(task._id, {
        task: selectedTaskId,
        type: dependencyType
      });
      
      if (onUpdate) {
        onUpdate(updatedTask);
      }
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error adding dependency:', err);
      setError('Failed to add dependency');
    } finally {
      setLoading(false);
    }
  };

  // Remove dependency
  const handleRemoveDependency = async (dependencyId) => {
    try {
      setLoading(true);
      const updatedTask = await taskService.removeDependency(task._id, dependencyId);
      
      if (onUpdate) {
        onUpdate(updatedTask);
      }
    } catch (err) {
      console.error('Error removing dependency:', err);
      setError('Failed to remove dependency');
    } finally {
      setLoading(false);
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

  // Get dependency type icon
  const getDependencyTypeIcon = (type) => {
    switch (type) {
      case 'blocks':
        return <ArrowForwardIcon fontSize="small" />;
      case 'is_blocked_by':
        return <ArrowBackIcon fontSize="small" />;
      case 'relates_to':
        return <LinkIcon fontSize="small" />;
      case 'duplicates':
      case 'is_duplicated_by':
        return <InfoIcon fontSize="small" />;
      default:
        return <LinkIcon fontSize="small" />;
    }
  };

  // Get dependency type label
  const getDependencyTypeLabel = (type) => {
    switch (type) {
      case 'blocks':
        return 'Blocks';
      case 'is_blocked_by':
        return 'Is Blocked By';
      case 'relates_to':
        return 'Relates To';
      case 'duplicates':
        return 'Duplicates';
      case 'is_duplicated_by':
        return 'Is Duplicated By';
      default:
        return type;
    }
  };

  // Check if task is blocked
  const isTaskBlocked = () => {
    if (!task.dependencies) return false;
    
    return task.dependencies.some(dep => 
      dep.type === 'is_blocked_by' && 
      dep.task.status !== 'done'
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Dependencies
          {isTaskBlocked() && (
            <Tooltip title="This task is blocked by unfinished tasks">
              <WarningIcon color="warning" sx={{ ml: 1 }} />
            </Tooltip>
          )}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Add Dependency
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <>
          {(!task.dependencies || task.dependencies.length === 0) ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No dependencies defined for this task.
            </Typography>
          ) : (
            <List dense>
              {task.dependencies.map((dependency) => (
                <ListItem
                  key={dependency._id}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: dependency.task.status === 'done' ? 'success.light' : 
                             (dependency.type === 'is_blocked_by' && dependency.task.status !== 'done') ? 'warning.light' : 'background.paper'
                  }}
                >
                  <ListItemIcon>
                    {getDependencyTypeIcon(dependency.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {dependency.task.taskNumber}: {dependency.task.title}
                        </Typography>
                        <Chip
                          size="small"
                          label={getDependencyTypeLabel(dependency.type)}
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Chip
                          size="small"
                          icon={getStatusIcon(dependency.task.status)}
                          label={dependency.task.status.replace('_', ' ')}
                          color={getStatusColor(dependency.task.status)}
                          variant="outlined"
                        />
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleRemoveDependency(dependency._id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </>
      )}

      {/* Add Dependency Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Task Dependency</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Define how this task relates to other tasks in the project.
            </Typography>
          </Box>

          <FormControl fullWidth margin="normal">
            <InputLabel>Dependency Type</InputLabel>
            <Select
              value={dependencyType}
              onChange={handleDependencyTypeChange}
              label="Dependency Type"
            >
              <MenuItem value="blocks">Blocks</MenuItem>
              <MenuItem value="is_blocked_by">Is Blocked By</MenuItem>
              <MenuItem value="relates_to">Relates To</MenuItem>
              <MenuItem value="duplicates">Duplicates</MenuItem>
              <MenuItem value="is_duplicated_by">Is Duplicated By</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            label="Search Tasks"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by title or task number"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Select Task</InputLabel>
            <Select
              value={selectedTaskId}
              onChange={handleTaskSelection}
              label="Select Task"
            >
              <MenuItem value="">
                <em>Select a task</em>
              </MenuItem>
              {filteredTasks.map((task) => (
                <MenuItem key={task._id} value={task._id}>
                  {task.taskNumber}: {task.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {dependencyType === 'is_blocked_by' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              This task will not be able to proceed until the selected task is completed.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleAddDependency}
            variant="contained"
            color="primary"
            disabled={loading || !selectedTaskId}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Dependency'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskDependenciesView;
