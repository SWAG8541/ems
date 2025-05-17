import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getClockStatus, getTimeEntries, clockIn, clockOut, addTimeEntry, deleteTimeEntry } from '../../redux/timeTracking/timeTrackingSlice';
import { getBreakStatus, getBreaks } from '../../redux/breaks/breakSlice';
import projectService from '../../api/projectService';
import taskService from '../../api/taskService';
import BreakMenu from '../../components/breaks/BreakMenu';
import BreakStatus from '../../components/breaks/BreakStatus';
import BreakHistory from '../../components/breaks/BreakHistory';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip
} from '@mui/material';

// Icons
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WorkIcon from '@mui/icons-material/Work';
import AddIcon from '@mui/icons-material/Add';
import TimerIcon from '@mui/icons-material/Timer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';



const TimeTrackingPage = () => {
  const [clockStatus, setClockStatus] = useState(null);
  const [timeEntries, setTimeEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualEntryDialogOpen, setManualEntryDialogOpen] = useState(false);
  const [newTimeEntry, setNewTimeEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    project: '',
    task: '',
    description: '',
    startTime: '09:00',
    endTime: '17:00',
    billable: true
  });

  // Ensure newTimeEntry is never undefined
  useEffect(() => {
    if (!newTimeEntry) {
      setNewTimeEntry({
        date: new Date().toISOString().split('T')[0],
        project: '',
        task: '',
        description: '',
        startTime: '09:00',
        endTime: '17:00',
        billable: true
      });
    }
  }, [newTimeEntry]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [timer, setTimer] = useState(null);
  const [currentDuration, setCurrentDuration] = useState(0);

  // Daily goal dialog
  const [dailyGoalDialogOpen, setDailyGoalDialogOpen] = useState(false);
  const [dailyGoal, setDailyGoal] = useState('');
  const [lateReason, setLateReason] = useState('');
  const [dailyGoalError, setDailyGoalError] = useState('');
  const [lateReasonError, setLateReasonError] = useState('');

  // Status report dialog
  const [statusReportDialogOpen, setStatusReportDialogOpen] = useState(false);
  const [statusReport, setStatusReport] = useState('');
  const [earlyReason, setEarlyReason] = useState('');
  const [statusReportError, setStatusReportError] = useState('');
  const [earlyReasonError, setEarlyReasonError] = useState('');

  // Get data from Redux store
  const { clockStatus: reduxClockStatus, timeEntries: reduxTimeEntries, loading: reduxLoading, error: reduxError } = useSelector((state) => state.timeTracking);
  const { user } = useSelector((state) => state.auth);
  const { onBreak } = useSelector((state) => state.breaks);
  const dispatch = useDispatch();

  // Fetch data
  useEffect(() => {
    setLoading(true);
    // Get employee ID from user
    const employeeId = user?.employeeId;

    // Fetch clock status with employee ID
    dispatch(getClockStatus(employeeId))
      .unwrap()
      .catch((error) => {
        setError('Failed to fetch clock status. Please try again.');
      });

    // Fetch time entries with employee ID
    dispatch(getTimeEntries({ employeeId, params: { date: selectedDate } }))
      .unwrap()
      .catch((error) => {
        setError('Failed to fetch time entries. Please try again.');
      });

    // Fetch break status with employee ID
    dispatch(getBreakStatus(employeeId))
      .unwrap()
      .catch((error) => {
        // Don't set error for break status to avoid disrupting the main functionality
      });

    // Fetch breaks for the selected date with employee ID
    dispatch(getBreaks({ date: selectedDate, employeeId }))
      .unwrap()
      .catch((error) => {
        // Don't set error for breaks to avoid disrupting the main functionality
      });

    // Fetch projects and tasks from API
    const fetchProjectsAndTasks = async () => {
      try {
        const projectsData = await projectService.getAllProjects();
        setProjects(projectsData);

        const tasksData = await taskService.getAllTasks();
        setTasks(tasksData);
      } catch (err) {
        setError('Failed to fetch projects or tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectsAndTasks();
  }, [dispatch, selectedDate, user]);

  // Update local state when Redux state changes
  useEffect(() => {
    if (reduxClockStatus) {
      setClockStatus(reduxClockStatus);
    }
    if (reduxTimeEntries) {
      setTimeEntries(reduxTimeEntries);
    }
    if (reduxError) {
      setError(reduxError);
    }
    if (!reduxLoading) {
      setLoading(false);
    }
  }, [reduxClockStatus, reduxTimeEntries, reduxLoading, reduxError]);

  // Update timer for clocked in status
  useEffect(() => {
    if (clockStatus && clockStatus.status === 'clocked_in') {
      setCurrentDuration(clockStatus.currentDuration);

      // Update duration every minute
      const interval = setInterval(() => {
        // Only increment duration if not on break
        if (!onBreak) {
          setCurrentDuration(prev => prev + (1/60)); // Add 1 minute in hours
        }
      }, 60000);

      setTimer(interval);

      return () => clearInterval(interval);
    } else if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
  }, [clockStatus, onBreak]);

  // Filter tasks based on selected project
  useEffect(() => {
    if (newTimeEntry.project) {
      setFilteredTasks(tasks.filter(task => task.projectId === newTimeEntry.project));
    } else {
      setFilteredTasks([]);
    }
  }, [newTimeEntry.project, tasks]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle date change
  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  // Handle clock in
  const handleClockIn = () => {
    // Open dialog to get daily goal
    setDailyGoalDialogOpen(true);
  };

  // Submit clock in with daily goal
  const handleClockInSubmit = () => {
    if (!dailyGoal.trim()) {
      setDailyGoalError('Please enter your daily goal');
      return;
    }

    // Check if late clock in
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const isLate = (currentHour > 10 || (currentHour === 10 && currentMinutes >= 15));

    if (isLate && !lateReason.trim()) {
      setLateReasonError('Please provide a reason for late clock in');
      return;
    }

    // Prepare clock in data
    const clockInData = {
      dailyGoal: dailyGoal.trim(), // Ensure dailyGoal is trimmed
      lateReason: isLate ? lateReason.trim() : '',
      location: {
        latitude: null,
        longitude: null,
        address: 'Working from office'
      },
      device: navigator.userAgent,
      employeeId: user?.employeeId // Include employee ID
    };

    // Call the API to clock in
    setLoading(true);
    setError(null); // Clear any previous errors
    dispatch(clockIn(clockInData))
      .unwrap()
      .then((result) => {
        setCurrentDuration(0);
        setDailyGoalDialogOpen(false);
        setDailyGoal('');
        setLateReason('');
        setDailyGoalError('');
        setLateReasonError('');
      })
      .catch((error) => {
        setError(typeof error === 'string' ? error : 'Failed to clock in. Please try again.');
        // Keep the dialog open if there's an error
        setDailyGoalDialogOpen(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Handle clock out
  const handleClockOut = () => {
    // Open dialog to get status report
    setStatusReportDialogOpen(true);
  };

  // Submit clock out with status report
  const handleClockOutSubmit = () => {
    if (!statusReport.trim()) {
      setStatusReportError('Please enter your status report');
      return;
    }

    // Check if early clock out
    const standardHours = 8; // Default to 8 hours, should be fetched from employee settings
    const isEarly = currentDuration < standardHours;

    if (isEarly && !earlyReason.trim()) {
      setEarlyReasonError('Please provide a reason for early clock out');
      return;
    }

    // Prepare clock out data
    const clockOutData = {
      statusReport: statusReport.trim(), // Ensure statusReport is trimmed and not empty
      earlyReason: isEarly ? earlyReason.trim() : '',
      location: {
        latitude: null,
        longitude: null,
        address: 'Working from office'
      },
      device: navigator.userAgent,
      employeeId: user?.employeeId // Include employee ID
    };

    // Call the API to clock out
    setLoading(true);
    dispatch(clockOut(clockOutData))
      .unwrap()
      .then((result) => {
        // After successful clock out, add a time entry if needed
        if (clockStatus && clockStatus.clockInTime) {
          const timeEntryData = {
            date: new Date(),
            description: `${clockStatus.dailyGoal} - ${statusReport}`,
            startTime: clockStatus.clockInTime,
            endTime: new Date(),
            duration: currentDuration * 60, // Convert hours to minutes
            billable: true,
            employee: user?.employeeId // Include employee ID
          };

          // Add time entry to the database
          dispatch(addTimeEntry(timeEntryData));
        }

        setStatusReportDialogOpen(false);
        setStatusReport('');
        setEarlyReason('');
        setStatusReportError('');
        setEarlyReasonError('');
      })
      .catch((error) => {
        setError(typeof error === 'string' ? error : 'Failed to clock out. Please try again.');
        // Keep the dialog open if there's an error
        setStatusReportDialogOpen(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Open manual time entry dialog
  const handleOpenManualEntryDialog = () => {
    setManualEntryDialogOpen(true);
  };

  // Close manual time entry dialog
  const handleCloseManualEntryDialog = () => {
    setManualEntryDialogOpen(false);
    // Reset form
    setNewTimeEntry({
      date: new Date().toISOString().split('T')[0],
      project: '',
      task: '',
      description: '',
      startTime: '09:00',
      endTime: '17:00',
      billable: true
    });
    // Clear any errors
    setError(null);
  };

  // Handle manual time entry form change
  const handleTimeEntryChange = (event) => {
    const { name, value, checked, type } = event.target;

    // Special handling for billable field
    if (name === 'billable') {
      setNewTimeEntry({
        ...newTimeEntry,
        billable: value === 'true' || value === true
      });
      return;
    }

    setNewTimeEntry({
      ...newTimeEntry,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Submit manual time entry
  const handleSubmitTimeEntry = () => {
    // Validate form
    if (!newTimeEntry.description.trim()) {
      setError('Description is required');
      return;
    }

    if (!newTimeEntry.startTime || !newTimeEntry.endTime) {
      setError('Start time and end time are required');
      return;
    }

    // Calculate duration in minutes
    const startParts = newTimeEntry.startTime.split(':');
    const endParts = newTimeEntry.endTime.split(':');
    const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
    const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
    const durationMinutes = endMinutes - startMinutes;

    if (durationMinutes <= 0) {
      setError('End time must be after start time');
      return;
    }

    // Create start and end time Date objects
    const startDate = new Date(newTimeEntry.date);
    startDate.setHours(parseInt(startParts[0]), parseInt(startParts[1]));

    const endDate = new Date(newTimeEntry.date);
    endDate.setHours(parseInt(endParts[0]), parseInt(endParts[1]));

    // Find project and task objects if IDs are provided
    const projectObj = newTimeEntry.project ?
      projects.find(p => p.id === newTimeEntry.project) || { id: newTimeEntry.project } :
      null;

    const taskObj = newTimeEntry.task ?
      tasks.find(t => t.id === newTimeEntry.task) || { id: newTimeEntry.task } :
      null;

    // Prepare time entry data for API
    const timeEntryData = {
      date: new Date(newTimeEntry.date),
      project: projectObj,
      task: taskObj,
      description: newTimeEntry.description.trim(),
      startTime: startDate,
      endTime: endDate,
      duration: durationMinutes,
      billable: newTimeEntry.billable,
      employee: user?.employeeId // Include employee ID using the 'employee' field
    };

    // Call the API to add time entry
    setLoading(true);
    dispatch(addTimeEntry(timeEntryData))
      .unwrap()
      .then(() => {
        // Close dialog and reset form
        handleCloseManualEntryDialog();
        setError(null);

        // Refresh time entries
        dispatch(getTimeEntries({ employeeId: user?.employeeId, params: { date: selectedDate } }));
      })
      .catch((error) => {
        setError(typeof error === 'string' ? error : 'Failed to add time entry. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Format duration for display
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Format time for display
  const formatTime = (date) => {
    if (!date) return 'N/A';
    // Check if date is a valid Date object
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      // Try to convert to Date if it's a timestamp or string
      try {
        date = new Date(date);
        if (isNaN(date.getTime())) return 'Invalid Date';
      } catch (e) {
        return 'Invalid Date';
      }
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    // Check if date is a valid Date object
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      // Try to convert to Date if it's a timestamp or string
      try {
        date = new Date(date);
        if (isNaN(date.getTime())) return 'Invalid Date';
      } catch (e) {
        return 'Invalid Date';
      }
    }
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Filter time entries by selected date
  const filteredTimeEntries = (timeEntries || []).filter(entry => {
    if (!entry || !entry.date) return false;

    // Convert entry.date to Date object if it's a string
    let entryDate;
    try {
      entryDate = entry.date instanceof Date ? entry.date : new Date(entry.date);
      if (isNaN(entryDate.getTime())) return false; // Invalid date
    } catch (e) {
      return false;
    }

    if (tabValue === 0) {
      // Today's entries
      return entryDate.toDateString() === new Date().toDateString();
    } else if (tabValue === 1) {
      // Week's entries
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(today);
      weekEnd.setDate(weekStart.getDate() + 6);

      return entryDate >= weekStart && entryDate <= weekEnd;
    } else {
      // Custom date
      return entryDate.toISOString().split('T')[0] === selectedDate;
    }
  });

  // Calculate total hours for filtered entries
  const totalHours = filteredTimeEntries.reduce((total, entry) => total + (entry.duration || 0), 0) / 60;
  const billableHours = filteredTimeEntries.filter(entry => entry.billable).reduce((total, entry) => total + (entry.duration || 0), 0) / 60;

  return (
    <Box sx={{ p: 3 }}>
      {/* Debug User Info and Break Status removed */}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Time Tracking
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenManualEntryDialog}
        >
          Add Time Entry
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Clock In/Out Card */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Attendance Tracking
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : !clockStatus ? (
                <Alert severity="info">
                  Unable to retrieve clock status. Please try again.
                </Alert>
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTimeIcon sx={{ mr: 1 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body1" component="span" sx={{ mr: 1 }}>
                        Status:
                      </Typography>
                      <Chip
                        label={clockStatus.status === 'clocked_in' ?
                               (onBreak ? 'On Break' : 'Clocked In') :
                               clockStatus.status === 'clocked_out' ? 'Clocked Out' :
                               'Not Clocked In'}
                        color={clockStatus.status === 'clocked_in' ?
                               (onBreak ? 'secondary' : 'success') :
                               clockStatus.status === 'clocked_out' ? 'secondary' :
                               'default'}
                        size="small"
                        sx={{ fontWeight: onBreak ? 'bold' : 'normal' }}
                      />
                    </Box>
                  </Box>

                  {clockStatus.status === 'clocked_in' && (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CalendarTodayIcon sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          Clock In Time: {formatTime(clockStatus.clockInTime)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TimerIcon sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          Duration: {Math.floor(currentDuration)}h {Math.round((currentDuration % 1) * 60)}m
                        </Typography>
                      </Box>
                      {clockStatus.isLate && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Chip
                            label="Late Clock In"
                            color="warning"
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Reason: {clockStatus.lateReason}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ mb: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1, border: '1px dashed' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Today's Goal:
                        </Typography>
                        <Typography variant="body2">
                          {clockStatus.dailyGoal}
                        </Typography>
                      </Box>
                    </>
                  )}

                  {clockStatus.status === 'clocked_out' && (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CalendarTodayIcon sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          Clock In: {formatTime(clockStatus.clockInTime)} |
                          Clock Out: {formatTime(clockStatus.clockOutTime)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <WorkIcon sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          Work Hours: {clockStatus.workHours.toFixed(2)}h |
                          Overtime: {clockStatus.overtime.toFixed(2)}h
                        </Typography>
                      </Box>
                      {clockStatus.isEarly && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Chip
                            label="Early Departure"
                            color="warning"
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Reason: {clockStatus.earlyReason}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ mb: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1, border: '1px dashed' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Today's Goal:
                        </Typography>
                        <Typography variant="body2">
                          {clockStatus.dailyGoal}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1, border: '1px dashed' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Status Report:
                        </Typography>
                        <Typography variant="body2">
                          {clockStatus.statusReport}
                        </Typography>
                      </Box>
                    </>
                  )}
                </>
              )}
            </CardContent>
            <Divider />
            <CardActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
              {clockStatus?.status === 'clocked_in' ? (
                <>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<StopIcon />}
                    onClick={handleClockOut}
                    disabled={loading}
                    sx={{ flexGrow: 1, mr: 1 }}
                  >
                    Clock Out
                  </Button>

                  {/* Break Menu Component */}
                  <BreakMenu />
                </>
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleClockIn}
                  disabled={loading || clockStatus?.status === 'clocked_out'}
                >
                  Clock In
                </Button>
              )}
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Time Summary
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label="Today" />
                  <Tab label="This Week" />
                  <Tab label="Custom" />
                </Tabs>
              </Box>

              {tabValue === 2 && (
                <Box sx={{ mb: 2 }}>
                  <TextField
                    type="date"
                    label="Select Date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              )}

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <AccessTimeIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Total Hours"
                      secondary={`${totalHours.toFixed(2)} hours`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Billable Hours"
                      secondary={`${billableHours.toFixed(2)} hours (${totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0}%)`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <ScheduleIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Entries"
                      secondary={`${filteredTimeEntries.length} time entries`}
                    />
                  </ListItem>
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Time Entries Table */}
      <Paper sx={{ mt: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Task</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Billable</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Loading time entries...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredTimeEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">
                      No time entries found for the selected period.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTimeEntries
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((entry, index) => (
                    <TableRow key={entry._id || entry.id || `entry-${index}`} hover>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>
                        {entry.project ? (
                          <Chip
                            label={entry.project.name}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            No project
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.task ? (
                          <Typography variant="body2">
                            {entry.task.title}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            No task
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell>
                        {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                      </TableCell>
                      <TableCell>{formatDuration(entry.duration)}</TableCell>
                      <TableCell>
                        {entry.billable ? (
                          <Chip
                            label="Billable"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        ) : (
                          <Chip
                            label="Non-billable"
                            size="small"
                            color="default"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTimeEntries.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Break History Component */}
      <BreakHistory date={selectedDate} />

      {/* Daily Goal Dialog */}
      <Dialog
        open={dailyGoalDialogOpen}
        onClose={() => setDailyGoalDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Clock In</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Today's Goal"
              fullWidth
              multiline
              rows={3}
              value={dailyGoal}
              onChange={(e) => setDailyGoal(e.target.value)}
              error={!!dailyGoalError}
              helperText={dailyGoalError}
              placeholder="What do you plan to accomplish today?"
              required
            />
          </Box>

          {/* Show late reason field if it's after 10:15 AM */}
          {new Date().getHours() > 10 || (new Date().getHours() === 10 && new Date().getMinutes() >= 15) ? (
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Reason for Late Clock In"
                fullWidth
                multiline
                rows={2}
                value={lateReason}
                onChange={(e) => setLateReason(e.target.value)}
                error={!!lateReasonError}
                helperText={lateReasonError}
                placeholder="Please provide a reason for clocking in late"
                required
              />
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDailyGoalDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleClockInSubmit}
            variant="contained"
            color="success"
          >
            Clock In
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Report Dialog */}
      <Dialog
        open={statusReportDialogOpen}
        onClose={() => setStatusReportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Clock Out</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Status Report"
              fullWidth
              multiline
              rows={3}
              value={statusReport}
              onChange={(e) => setStatusReport(e.target.value)}
              error={!!statusReportError}
              helperText={statusReportError}
              placeholder="What did you accomplish today?"
              required
            />
          </Box>

          {/* Show early departure reason field if less than 8 hours worked */}
          {currentDuration < 8 ? (
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Reason for Early Departure"
                fullWidth
                multiline
                rows={2}
                value={earlyReason}
                onChange={(e) => setEarlyReason(e.target.value)}
                error={!!earlyReasonError}
                helperText={earlyReasonError}
                placeholder="Please provide a reason for clocking out early"
                required
              />
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusReportDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleClockOutSubmit}
            variant="contained"
            color="error"
          >
            Clock Out
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manual Time Entry Dialog */}
      <Dialog
        open={manualEntryDialogOpen}
        onClose={handleCloseManualEntryDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Time Entry</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="date"
                label="Date"
                type="date"
                value={newTimeEntry.date}
                onChange={handleTimeEntryChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                name="project"
                label="Project"
                value={newTimeEntry.project}
                onChange={handleTimeEntryChange}
                fullWidth
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name} ({project.code})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                name="task"
                label="Task"
                value={newTimeEntry.task}
                onChange={handleTimeEntryChange}
                fullWidth
                disabled={!newTimeEntry.project}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {filteredTasks.map((task) => (
                  <MenuItem key={task.id} value={task.id}>
                    {task.title} ({task.taskNumber})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={newTimeEntry.description}
                onChange={handleTimeEntryChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="startTime"
                label="Start Time"
                type="time"
                value={newTimeEntry.startTime}
                onChange={handleTimeEntryChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="endTime"
                label="End Time"
                type="time"
                value={newTimeEntry.endTime}
                onChange={handleTimeEntryChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                name="billable"
                label="Billable"
                value={newTimeEntry.billable ? "true" : "false"}
                onChange={(e) => setNewTimeEntry({
                  ...newTimeEntry,
                  billable: e.target.value === "true"
                })}
                fullWidth
              >
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseManualEntryDialog}>Cancel</Button>
          <Button
            onClick={handleSubmitTimeEntry}
            variant="contained"
            color="primary"
            disabled={!newTimeEntry.date || !newTimeEntry.startTime || !newTimeEntry.endTime}
          >
            Add Entry
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimeTrackingPage;
