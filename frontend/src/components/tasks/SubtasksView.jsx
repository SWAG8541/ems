import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
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
  LinearProgress,
  Tooltip,
  Divider
} from '@mui/material';

// Icons
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import SimpleDatePicker from '../../components/SimpleDatePicker';

import taskService from '../../api/taskService';

const SubtasksView = ({ task, employees, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [currentSubtask, setCurrentSubtask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    assignedTo: '',
    dueDate: null
  });

  // Calculate subtask completion percentage
  const calculateProgress = () => {
    if (!task.subtasks || task.subtasks.length === 0) return 0;

    const completedSubtasks = task.subtasks.filter(subtask => subtask.status === 'done').length;
    return Math.round((completedSubtasks / task.subtasks.length) * 100);
  };

  // Handle opening the add subtask dialog
  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      assignedTo: '',
      dueDate: null
    });
    setOpenDialog(true);
  };

  // Handle opening the edit subtask dialog
  const handleOpenEditDialog = (subtask) => {
    setDialogMode('edit');
    setCurrentSubtask(subtask);
    setFormData({
      title: subtask.title,
      description: subtask.description || '',
      status: subtask.status || 'todo',
      assignedTo: subtask.assignedTo?._id || '',
      dueDate: subtask.dueDate ? new Date(subtask.dueDate) : null
    });
    setOpenDialog(true);
  };

  // Handle closing the dialog
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
  };

  // Handle date change
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      dueDate: date
    });
  };

  // Add subtask
  const handleAddSubtask = async () => {
    if (!formData.title) {
      setError('Title is required');
      return;
    }

    try {
      setLoading(true);
      const updatedTask = await taskService.addSubtask(task._id, formData);

      if (onUpdate) {
        onUpdate(updatedTask);
      }

      handleCloseDialog();
    } catch (err) {
      console.error('Error adding subtask:', err);
      setError('Failed to add subtask');
    } finally {
      setLoading(false);
    }
  };

  // Update subtask
  const handleUpdateSubtask = async () => {
    if (!formData.title) {
      setError('Title is required');
      return;
    }

    try {
      setLoading(true);
      const updatedTask = await taskService.updateSubtask(
        task._id,
        currentSubtask._id,
        formData
      );

      if (onUpdate) {
        onUpdate(updatedTask);
      }

      handleCloseDialog();
    } catch (err) {
      console.error('Error updating subtask:', err);
      setError('Failed to update subtask');
    } finally {
      setLoading(false);
    }
  };

  // Delete subtask
  const handleDeleteSubtask = async (subtaskId) => {
    if (!window.confirm('Are you sure you want to delete this subtask?')) {
      return;
    }

    try {
      setLoading(true);
      const updatedTask = await taskService.deleteSubtask(task._id, subtaskId);

      if (onUpdate) {
        onUpdate(updatedTask);
      }
    } catch (err) {
      console.error('Error deleting subtask:', err);
      setError('Failed to delete subtask');
    } finally {
      setLoading(false);
    }
  };

  // Toggle subtask status
  const handleToggleStatus = async (subtask) => {
    const newStatus = subtask.status === 'done' ? 'todo' : 'done';

    try {
      setLoading(true);
      const updatedTask = await taskService.updateSubtask(
        task._id,
        subtask._id,
        { status: newStatus }
      );

      if (onUpdate) {
        onUpdate(updatedTask);
      }
    } catch (err) {
      console.error('Error updating subtask status:', err);
      setError('Failed to update subtask status');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'todo':
        return <HourglassEmptyIcon fontSize="small" />;
      case 'in_progress':
        return <PlayArrowIcon fontSize="small" />;
      case 'done':
        return <CheckCircleIcon fontSize="small" />;
      default:
        return <HourglassEmptyIcon fontSize="small" />;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Subtasks ({task.subtasks?.length || 0})
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Add Subtask
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Progress bar */}
      {task.subtasks && task.subtasks.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {calculateProgress()}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={calculateProgress()}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Box>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {(!task.subtasks || task.subtasks.length === 0) ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No subtasks defined for this task.
        </Typography>
      ) : (
        <List dense>
          {task.subtasks.map((subtask) => (
            <ListItem
              key={subtask._id}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                bgcolor: subtask.status === 'done' ? 'success.light' : 'background.paper'
              }}
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={subtask.status === 'done'}
                  onChange={() => handleToggleStatus(subtask)}
                  icon={<HourglassEmptyIcon />}
                  checkedIcon={<CheckCircleIcon color="success" />}
                />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 'medium',
                      textDecoration: subtask.status === 'done' ? 'line-through' : 'none'
                    }}
                  >
                    {subtask.title}
                  </Typography>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    {subtask.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {subtask.description}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {subtask.dueDate && (
                        <Chip
                          size="small"
                          icon={<CalendarTodayIcon fontSize="small" />}
                          label={formatDate(subtask.dueDate)}
                          variant="outlined"
                        />
                      )}
                      {subtask.assignedTo && (
                        <Chip
                          size="small"
                          icon={<PersonIcon fontSize="small" />}
                          label={subtask.assignedTo.user?.name || subtask.assignedTo.name || 'Assigned'}
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => handleOpenEditDialog(subtask)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => handleDeleteSubtask(subtask._id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {/* Subtask Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Add Subtask' : 'Edit Subtask'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
          />

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
              <MenuItem value="done">Done</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Assigned To</InputLabel>
            <Select
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              label="Assigned To"
            >
              <MenuItem value="">Unassigned</MenuItem>
              {employees.map(employee => (
                <MenuItem key={employee._id || employee.id} value={employee._id || employee.id}>
                  {employee.user?.name || employee.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ mt: 2 }}>
            <SimpleDatePicker
              label="Due Date"
              value={formData.dueDate}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={dialogMode === 'create' ? handleAddSubtask : handleUpdateSubtask}
            variant="contained"
            color="primary"
            disabled={loading || !formData.title}
          >
            {loading ? <CircularProgress size={24} /> : (dialogMode === 'create' ? 'Add' : 'Save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubtasksView;
