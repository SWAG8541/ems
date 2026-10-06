import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  getTaskById,
  updateTask,
  updateTaskStatus,
  addComment,
  addSubtask,
  updateSubtask,
  deleteSubtask
} from '../../redux/task/taskSlice';
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
  Alert,
  Checkbox,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Flag as FlagIcon,
  Comment as CommentIcon,
  Send as SendIcon,
  Add as AddIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon
} from '@mui/icons-material';
import SimpleDatePicker from '../../components/SimpleDatePicker';

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { task, loading, error } = useSelector((state) => state.task);

  const [editMode, setEditMode] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [subtaskText, setSubtaskText] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    assignee: '',
    dueDate: null,
    estimatedHours: 0
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch task data
  useEffect(() => {
    dispatch(getTaskById(id));
  }, [dispatch, id]);

  // Update form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        assignee: task.assignee?._id || task.assignee || '',
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        estimatedHours: task.estimatedHours || 0
      });
    }
  }, [task]);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
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
    setFormData({
      ...formData,
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

  // Toggle edit mode
  const toggleEditMode = () => {
    setEditMode(!editMode);
    setFormErrors({});
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!formData.assignee) {
      errors.assignee = 'Assignee is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save task changes
  const handleSaveChanges = async () => {
    if (!validateForm()) return;

    const taskData = {
      ...formData,
      dueDate: formData.dueDate ? formData.dueDate.toISOString() : null
    };

    try {
      await dispatch(updateTask({ id, taskData })).unwrap();
      setEditMode(false);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  // Update task status
  const handleStatusChange = async (newStatus) => {
    try {
      await dispatch(updateTaskStatus({ id, status: newStatus })).unwrap();
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  // Add comment
  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      const commentData = {
        text: commentText,
        user: user.id
      };

      await dispatch(addComment({ taskId: id, commentData })).unwrap();
      setCommentText('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  // Add subtask
  const handleAddSubtask = async () => {
    if (!subtaskText.trim()) return;

    try {
      const subtaskData = {
        title: subtaskText,
        completed: false
      };

      await dispatch(addSubtask({ taskId: id, subtaskData })).unwrap();
      setSubtaskText('');
    } catch (err) {
      console.error('Failed to add subtask:', err);
    }
  };

  // Toggle subtask completion
  const handleToggleSubtask = async (subtaskId, completed) => {
    try {
      const subtaskData = {
        completed: !completed
      };

      await dispatch(updateSubtask({ taskId: id, subtaskId, subtaskData })).unwrap();
    } catch (err) {
      console.error('Failed to update subtask:', err);
    }
  };

  // Delete subtask
  const handleDeleteSubtask = async (subtaskId) => {
    try {
      await dispatch(deleteSubtask({ taskId: id, subtaskId })).unwrap();
    } catch (err) {
      console.error('Failed to delete subtask:', err);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format date and time for display
  const formatDateTime = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  // Get status label
  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  // Calculate completion percentage
  const calculateCompletionPercentage = () => {
    if (!task || !task.subtasks || task.subtasks.length === 0) {
      return task?.status === 'completed' ? 100 : 0;
    }

    const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
    return Math.round((completedSubtasks / task.subtasks.length) * 100);
  };

  if (loading && !task) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={Link}
          to="/tasks"
          sx={{ mt: 2 }}
        >
          Back to Tasks
        </Button>
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
          to={task?.project?._id ? `/projects/${task.project._id}/tasks` : '/tasks'}
          sx={{ mr: 2 }}
        >
          Back to Tasks
        </Button>

        <Box>
          {!editMode ? (
            <>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={toggleEditMode}
                sx={{ mr: 1 }}
              >
                Edit
              </Button>

              {task?.status !== 'completed' && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleStatusChange('completed')}
                >
                  Mark Complete
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                onClick={toggleEditMode}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveChanges}
              >
                Save Changes
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Task Details */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            {editMode ? (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Task Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
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
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    error={!!formErrors.description}
                    helperText={formErrors.description}
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
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
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="blocked">Blocked</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
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
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <SimpleDatePicker
                    label="Due Date"
                    value={formData.dueDate}
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
                  <TextField
                    fullWidth
                    label="Estimated Hours"
                    name="estimatedHours"
                    type="number"
                    value={formData.estimatedHours}
                    onChange={handleChange}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
              </Grid>
            ) : task ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h4" component="h1" gutterBottom>
                    {task.title}
                  </Typography>
                  <Box>
                    <Chip
                      label={getStatusLabel(task.status)}
                      color={getStatusColor(task.status)}
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      color={getPriorityColor(task.priority)}
                    />
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Typography variant="body1" paragraph>
                  {task.description}
                </Typography>

                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Project
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {task.project?.name || 'Not assigned to a project'}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Assignee
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body1">
                        {task.assignee?.user?.name || 'Unassigned'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Due Date
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body1">
                        {formatDate(task.dueDate)}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Estimated Hours
                    </Typography>
                    <Typography variant="body1">
                      {task.estimatedHours || 0} hours
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Completion
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={calculateCompletionPercentage()}
                          color={calculateCompletionPercentage() === 100 ? 'success' : 'primary'}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {calculateCompletionPercentage()}%
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </>
            ) : (
              <Typography>Task not found</Typography>
            )}
          </Paper>

          {/* Subtasks */}
          {task && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Subtasks
              </Typography>

              <Box sx={{ display: 'flex', mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add a subtask..."
                  value={subtaskText}
                  onChange={(e) => setSubtaskText(e.target.value)}
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddSubtask}
                  disabled={!subtaskText.trim()}
                >
                  Add
                </Button>
              </Box>

              <List>
                {task.subtasks && task.subtasks.length > 0 ? (
                  task.subtasks.map((subtask) => (
                    <ListItem
                      key={subtask._id}
                      dense
                      divider
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteSubtask(subtask._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={subtask.completed}
                          onChange={() => handleToggleSubtask(subtask._id, subtask.completed)}
                          icon={<CheckBoxOutlineBlankIcon />}
                          checkedIcon={<CheckBoxIcon />}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={subtask.title}
                        primaryTypographyProps={{
                          style: {
                            textDecoration: subtask.completed ? 'line-through' : 'none',
                            color: subtask.completed ? 'text.secondary' : 'text.primary'
                          }
                        }}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    No subtasks yet. Add one to break down this task.
                  </Typography>
                )}
              </List>
            </Paper>
          )}
        </Grid>

        {/* Comments */}
        <Grid size={{ xs: 12, md: 4 }}>
          {task && (
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Comments
              </Typography>

              <Box sx={{ display: 'flex', mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                >
                  <SendIcon />
                </Button>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                {task.comments && task.comments.length > 0 ? (
                  task.comments.map((comment, index) => (
                    <Card key={comment._id || index} sx={{ mb: 2 }}>
                      <CardContent sx={{ py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                            {comment.user?.name?.charAt(0) || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {comment.user?.name || 'Unknown User'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDateTime(comment.date)}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2">{comment.text}</Typography>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    No comments yet. Be the first to comment!
                  </Typography>
                )}
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskDetailPage;
