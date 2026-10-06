import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createAttendanceAnomalyNotification } from '../../redux/notification/notificationSlice';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';

// Icons
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import TimerIcon from '@mui/icons-material/Timer';
import TimerOffIcon from '@mui/icons-material/TimerOff';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

// Mock data for initial development
const MOCK_ATTENDANCE = {
  date: new Date().toISOString().split('T')[0],
  clockIn: null,
  clockOut: null,
  status: 'not_started',
  breaks: [],
  currentBreak: null,
  totalHours: '00:00:00',
  notes: ''
};

const AttendanceClockPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [attendance, setAttendance] = useState(MOCK_ATTENDANCE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [breakElapsedTime, setBreakElapsedTime] = useState('00:00:00');

  // Dialog states
  const [openClockInDialog, setOpenClockInDialog] = useState(false);
  const [openClockOutDialog, setOpenClockOutDialog] = useState(false);
  const [openBreakDialog, setOpenBreakDialog] = useState(false);

  // Form states
  const [clockInReason, setClockInReason] = useState('');
  const [clockInGoals, setClockInGoals] = useState('');
  const [clockOutSummary, setClockOutSummary] = useState('');
  const [clockOutTasks, setClockOutTasks] = useState('');
  const [breakType, setBreakType] = useState('lunch');
  const [breakReason, setBreakReason] = useState('');

  // Timer refs
  const timerRef = useRef(null);
  const breakTimerRef = useRef(null);

  // Fetch attendance data on component mount
  useEffect(() => {
    // In a real app, you would fetch from API
    // For now, use mock data
    setTimeout(() => {
      // Check if there's already an attendance record for today
      // For demo, let's assume sometimes there is, sometimes there isn't
      const hasExistingRecord = Math.random() > 0.5;

      if (hasExistingRecord) {
        // Simulate an existing record
        const mockExistingRecord = {
          date: new Date().toISOString().split('T')[0],
          clockIn: '09:00:00',
          clockOut: null,
          status: 'in_progress',
          breaks: [
            {
              type: 'lunch',
              start: '12:00:00',
              end: '13:00:00',
              duration: '01:00:00',
              reason: 'Lunch break'
            }
          ],
          currentBreak: null,
          totalHours: '03:00:00',
          notes: 'Working on the new project'
        };

        setAttendance(mockExistingRecord);

        // Start the timer if the user is clocked in but not on break
        if (mockExistingRecord.status === 'in_progress' && !mockExistingRecord.currentBreak) {
          startTimer();
        }

        // Start the break timer if the user is on break
        if (mockExistingRecord.currentBreak) {
          startBreakTimer();
        }
      }

      setLoading(false);
    }, 1000);

    // Update current time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timeInterval);
      if (timerRef.current) clearInterval(timerRef.current);
      if (breakTimerRef.current) clearInterval(breakTimerRef.current);
    };
  }, []);

  // Start the main timer
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    // Calculate initial elapsed time if already clocked in
    if (attendance.clockIn) {
      const clockInTime = new Date();
      clockInTime.setHours(...attendance.clockIn.split(':').map(Number));

      let totalElapsedMs = new Date() - clockInTime;

      // Subtract break durations
      attendance.breaks.forEach(breakItem => {
        if (breakItem.start && breakItem.end) {
          const breakStart = new Date();
          breakStart.setHours(...breakItem.start.split(':').map(Number));

          const breakEnd = new Date();
          breakEnd.setHours(...breakItem.end.split(':').map(Number));

          totalElapsedMs -= (breakEnd - breakStart);
        }
      });

      // Format elapsed time
      setElapsedTime(formatDuration(totalElapsedMs));
    }

    // Update elapsed time every second
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => {
        const [hours, minutes, seconds] = prev.split(':').map(Number);

        let totalSeconds = hours * 3600 + minutes * 60 + seconds + 1;
        const newHours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        const newMinutes = Math.floor(totalSeconds / 60);
        const newSeconds = totalSeconds % 60;

        return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`;
      });
    }, 1000);
  };

  // Start the break timer
  const startBreakTimer = () => {
    if (breakTimerRef.current) clearInterval(breakTimerRef.current);

    // Calculate initial break elapsed time if already on break
    if (attendance.currentBreak && attendance.currentBreak.start) {
      const breakStartTime = new Date();
      breakStartTime.setHours(...attendance.currentBreak.start.split(':').map(Number));

      const totalElapsedMs = new Date() - breakStartTime;

      // Format elapsed time
      setBreakElapsedTime(formatDuration(totalElapsedMs));
    }

    // Update break elapsed time every second
    breakTimerRef.current = setInterval(() => {
      setBreakElapsedTime(prev => {
        const [hours, minutes, seconds] = prev.split(':').map(Number);

        let totalSeconds = hours * 3600 + minutes * 60 + seconds + 1;
        const newHours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        const newMinutes = Math.floor(totalSeconds / 60);
        const newSeconds = totalSeconds % 60;

        return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`;
      });
    }, 1000);
  };

  // Format duration from milliseconds to HH:MM:SS
  const formatDuration = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format time as HH:MM:SS
  const formatTime = (date) => {
    return date.toTimeString().split(' ')[0];
  };

  // Handle clock in
  const handleClockIn = () => {
    setOpenClockInDialog(true);
  };

  // Submit clock in
  const submitClockIn = () => {
    // Validate form
    if (!clockInGoals.trim()) {
      alert('Please set your goals for today');
      return;
    }

    const now = new Date();
    const clockInTime = formatTime(now);

    // Check if late arrival (after 9:00 AM)
    const isLate = now.getHours() >= 9 && now.getMinutes() > 0;

    // In a real app, you would submit to API
    // For now, just update the local state
    const updatedAttendance = {
      ...attendance,
      clockIn: clockInTime,
      status: 'in_progress',
      notes: clockInGoals,
      lateArrival: isLate
    };

    setAttendance(updatedAttendance);

    // Start the timer
    startTimer();

    // Close the dialog
    setOpenClockInDialog(false);

    // Send notification if late
    if (isLate) {
      dispatch(createAttendanceAnomalyNotification({
        userId: user?.id,
        attendanceData: {
          ...updatedAttendance,
          id: Date.now().toString() // Generate a mock ID
        },
        anomalyType: 'late'
      }));
    }

    // Reset form
    setClockInReason('');
    setClockInGoals('');
  };

  // Handle clock out
  const handleClockOut = () => {
    setOpenClockOutDialog(true);
  };

  // Submit clock out
  const submitClockOut = () => {
    // Validate form
    if (!clockOutSummary.trim()) {
      alert('Please provide a summary of your day');
      return;
    }

    const now = new Date();
    const clockOutTime = formatTime(now);

    // Check if early departure (before 5:00 PM)
    const isEarly = now.getHours() < 17;

    // Calculate total hours
    const clockInTime = new Date();
    clockInTime.setHours(...attendance.clockIn.split(':').map(Number));

    let totalElapsedMs = now - clockInTime;

    // Subtract break durations
    attendance.breaks.forEach(breakItem => {
      if (breakItem.start && breakItem.end) {
        const breakStart = new Date();
        breakStart.setHours(...breakItem.start.split(':').map(Number));

        const breakEnd = new Date();
        breakEnd.setHours(...breakItem.end.split(':').map(Number));

        totalElapsedMs -= (breakEnd - breakStart);
      }
    });

    const totalHours = formatDuration(totalElapsedMs);

    // In a real app, you would submit to API
    // For now, just update the local state
    const updatedAttendance = {
      ...attendance,
      clockOut: clockOutTime,
      status: 'completed',
      totalHours,
      earlyDeparture: isEarly,
      notes: `${attendance.notes}\n\nEnd of day summary: ${clockOutSummary}\n\nTasks completed: ${clockOutTasks}`
    };

    setAttendance(updatedAttendance);

    // Stop the timer
    if (timerRef.current) clearInterval(timerRef.current);

    // Close the dialog
    setOpenClockOutDialog(false);

    // Send notification if early departure
    if (isEarly) {
      dispatch(createAttendanceAnomalyNotification({
        userId: user?.id,
        attendanceData: {
          ...updatedAttendance,
          id: Date.now().toString() // Generate a mock ID
        },
        anomalyType: 'early'
      }));
    }

    // Reset form
    setClockOutSummary('');
    setClockOutTasks('');
  };

  // Handle start break
  const handleStartBreak = () => {
    setOpenBreakDialog(true);
  };

  // Submit start break
  const submitStartBreak = () => {
    // Validate form
    if (breakType === 'other' && !breakReason.trim()) {
      alert('Please provide a reason for your break');
      return;
    }

    const now = new Date();
    const breakStartTime = formatTime(now);

    // In a real app, you would submit to API
    // For now, just update the local state
    setAttendance({
      ...attendance,
      currentBreak: {
        type: breakType,
        start: breakStartTime,
        reason: breakType === 'other' ? breakReason : `${breakType.charAt(0).toUpperCase() + breakType.slice(1)} break`
      }
    });

    // Stop the main timer
    if (timerRef.current) clearInterval(timerRef.current);

    // Start the break timer
    startBreakTimer();

    // Close the dialog
    setOpenBreakDialog(false);

    // Reset form
    setBreakType('lunch');
    setBreakReason('');
  };

  // Handle end break
  const handleEndBreak = () => {
    const now = new Date();
    const breakEndTime = formatTime(now);

    // Calculate break duration
    const breakStartTime = new Date();
    breakStartTime.setHours(...attendance.currentBreak.start.split(':').map(Number));

    const breakDurationMs = now - breakStartTime;
    const breakDuration = formatDuration(breakDurationMs);

    // In a real app, you would submit to API
    // For now, just update the local state
    const completedBreak = {
      ...attendance.currentBreak,
      end: breakEndTime,
      duration: breakDuration
    };

    setAttendance({
      ...attendance,
      breaks: [...attendance.breaks, completedBreak],
      currentBreak: null
    });

    // Stop the break timer
    if (breakTimerRef.current) clearInterval(breakTimerRef.current);
    setBreakElapsedTime('00:00:00');

    // Restart the main timer
    startTimer();
  };

  // Get break type icon
  const getBreakTypeIcon = (type) => {
    switch (type) {
      case 'lunch':
        return <RestaurantIcon />;
      case 'tea':
        return <FreeBreakfastIcon />;
      case 'other':
      default:
        return <MoreHorizIcon />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Attendance Tracker
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Current Date and Time */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>
                {formatDate(attendance.date)}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {currentTime.toLocaleTimeString()}
              </Typography>
            </Paper>
          </Grid>

          {/* Attendance Status Card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" component="div">
                    Today's Attendance
                  </Typography>
                  <Chip
                    label={
                      attendance.status === 'not_started' ? 'Not Started' :
                      attendance.status === 'in_progress' ? 'In Progress' :
                      attendance.status === 'completed' ? 'Completed' : 'Unknown'
                    }
                    color={
                      attendance.status === 'not_started' ? 'default' :
                      attendance.status === 'in_progress' ? 'primary' :
                      attendance.status === 'completed' ? 'success' : 'default'
                    }
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Clock In
                    </Typography>
                    <Typography variant="h6">
                      {attendance.clockIn || 'Not clocked in'}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Clock Out
                    </Typography>
                    <Typography variant="h6">
                      {attendance.clockOut || 'Not clocked out'}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Working Hours
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {attendance.status === 'completed' ? attendance.totalHours : elapsedTime}
                    </Typography>
                  </Grid>

                  {attendance.notes && (
                    <>
                      <Grid size={{ xs: 12 }}>
                        <Divider sx={{ my: 1 }} />
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <Typography variant="body2" color="text.secondary">
                          Today's Goals/Notes
                        </Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                          {attendance.notes}
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                {attendance.status === 'not_started' && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PlayArrowIcon />}
                    onClick={handleClockIn}
                    fullWidth
                  >
                    Clock In
                  </Button>
                )}

                {attendance.status === 'in_progress' && (
                  <>
                    {attendance.currentBreak ? (
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<TimerOffIcon />}
                        onClick={handleEndBreak}
                        fullWidth
                      >
                        End Break ({breakElapsedTime})
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outlined"
                          color="secondary"
                          startIcon={<TimerIcon />}
                          onClick={handleStartBreak}
                        >
                          Take a Break
                        </Button>

                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<StopIcon />}
                          onClick={handleClockOut}
                        >
                          Clock Out
                        </Button>
                      </>
                    )}
                  </>
                )}

                {attendance.status === 'completed' && (
                  <Button
                    variant="outlined"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    disabled
                    fullWidth
                  >
                    Completed for Today
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>

          {/* Breaks Card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                  Breaks
                </Typography>

                {attendance.currentBreak && (
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'secondary.light', borderRadius: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Current Break
                    </Typography>

                    <Grid container spacing={2} alignItems="center">
                      <Grid>
                        {getBreakTypeIcon(attendance.currentBreak.type)}
                      </Grid>

                      <Grid xs>
                        <Typography variant="body1">
                          {attendance.currentBreak.type.charAt(0).toUpperCase() + attendance.currentBreak.type.slice(1)} Break
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Started at {attendance.currentBreak.start}
                        </Typography>
                        {attendance.currentBreak.reason && (
                          <Typography variant="body2" color="text.secondary">
                            Reason: {attendance.currentBreak.reason}
                          </Typography>
                        )}
                      </Grid>

                      <Grid>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                          {breakElapsedTime}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                <Typography variant="subtitle1" gutterBottom>
                  Break History
                </Typography>

                {attendance.breaks.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No breaks taken today
                  </Typography>
                ) : (
                  <Box>
                    {attendance.breaks.map((breakItem, index) => (
                      <Box key={index} sx={{ mb: 2, p: 1, borderBottom: '1px solid #eee' }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid>
                            {getBreakTypeIcon(breakItem.type)}
                          </Grid>

                          <Grid xs>
                            <Typography variant="body1">
                              {breakItem.type.charAt(0).toUpperCase() + breakItem.type.slice(1)} Break
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {breakItem.start} - {breakItem.end}
                            </Typography>
                            {breakItem.reason && (
                              <Typography variant="body2" color="text.secondary">
                                Reason: {breakItem.reason}
                              </Typography>
                            )}
                          </Grid>

                          <Grid>
                            <Chip
                              label={breakItem.duration}
                              size="small"
                              color="secondary"
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Clock In Dialog */}
      <Dialog open={openClockInDialog} onClose={() => setOpenClockInDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Clock In
          <IconButton
            aria-label="close"
            onClick={() => setOpenClockInDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" gutterBottom>
                Current Time: {formatTime(new Date())}
              </Typography>

              {new Date().getHours() >= 9 && new Date().getMinutes() > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  You are clocking in after 9:00 AM. Please provide a reason.
                </Alert>
              )}
            </Grid>

            {new Date().getHours() >= 9 && new Date().getMinutes() > 0 && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Reason for Late Arrival"
                  value={clockInReason}
                  onChange={(e) => setClockInReason(e.target.value)}
                  required
                />
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Goals for Today"
                value={clockInGoals}
                onChange={(e) => setClockInGoals(e.target.value)}
                multiline
                rows={4}
                required
                helperText="Please set your goals or tasks for today"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenClockInDialog(false)}>Cancel</Button>
          <Button
            onClick={submitClockIn}
            variant="contained"
            color="primary"
            startIcon={<PlayArrowIcon />}
          >
            Clock In
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clock Out Dialog */}
      <Dialog open={openClockOutDialog} onClose={() => setOpenClockOutDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Clock Out
          <IconButton
            aria-label="close"
            onClick={() => setOpenClockOutDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" gutterBottom>
                Current Time: {formatTime(new Date())}
              </Typography>

              {new Date().getHours() < 17 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  You are clocking out before 5:00 PM.
                </Alert>
              )}
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Summary of Your Day"
                value={clockOutSummary}
                onChange={(e) => setClockOutSummary(e.target.value)}
                multiline
                rows={3}
                required
                helperText="Please provide a summary of what you accomplished today"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Tasks Completed"
                value={clockOutTasks}
                onChange={(e) => setClockOutTasks(e.target.value)}
                multiline
                rows={3}
                helperText="List the tasks you completed today"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenClockOutDialog(false)}>Cancel</Button>
          <Button
            onClick={submitClockOut}
            variant="contained"
            color="primary"
            startIcon={<StopIcon />}
          >
            Clock Out
          </Button>
        </DialogActions>
      </Dialog>

      {/* Break Dialog */}
      <Dialog open={openBreakDialog} onClose={() => setOpenBreakDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Take a Break
          <IconButton
            aria-label="close"
            onClick={() => setOpenBreakDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" gutterBottom>
                Current Time: {formatTime(new Date())}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Break Type</InputLabel>
                <Select
                  value={breakType}
                  onChange={(e) => setBreakType(e.target.value)}
                  label="Break Type"
                >
                  <MenuItem value="lunch">Lunch Break</MenuItem>
                  <MenuItem value="tea">Tea Break</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {breakType === 'other' && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Reason for Break"
                  value={breakReason}
                  onChange={(e) => setBreakReason(e.target.value)}
                  required
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenBreakDialog(false)}>Cancel</Button>
          <Button
            onClick={submitStartBreak}
            variant="contained"
            color="secondary"
            startIcon={<TimerIcon />}
          >
            Start Break
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendanceClockPage;
