import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import SimpleDatePicker from '../../components/SimpleDatePicker';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

// Mock data for initial development
const MOCK_ATTENDANCE = [
  {
    id: '1',
    date: '2023-06-01',
    clockIn: '09:05:00',
    clockOut: '18:10:00',
    totalHours: '09:05:00',
    status: 'present',
    lateArrival: true,
    earlyDeparture: false,
    breaks: [
      { type: 'lunch', start: '13:00:00', end: '14:00:00', duration: '01:00:00' }
    ],
    notes: 'Traffic delay in the morning'
  },
  {
    id: '2',
    date: '2023-06-02',
    clockIn: '08:55:00',
    clockOut: '18:00:00',
    totalHours: '09:05:00',
    status: 'present',
    lateArrival: false,
    earlyDeparture: false,
    breaks: [
      { type: 'lunch', start: '13:00:00', end: '14:00:00', duration: '01:00:00' }
    ],
    notes: ''
  },
  {
    id: '3',
    date: '2023-06-03',
    clockIn: '09:00:00',
    clockOut: '17:30:00',
    totalHours: '08:30:00',
    status: 'present',
    lateArrival: false,
    earlyDeparture: true,
    breaks: [
      { type: 'lunch', start: '13:00:00', end: '14:00:00', duration: '01:00:00' }
    ],
    notes: 'Left early for doctor appointment'
  },
  {
    id: '4',
    date: '2023-06-04',
    clockIn: null,
    clockOut: null,
    totalHours: '00:00:00',
    status: 'absent',
    lateArrival: false,
    earlyDeparture: false,
    breaks: [],
    notes: 'Sick leave'
  },
  {
    id: '5',
    date: '2023-06-05',
    clockIn: '09:00:00',
    clockOut: '18:00:00',
    totalHours: '09:00:00',
    status: 'present',
    lateArrival: false,
    earlyDeparture: false,
    breaks: [
      { type: 'lunch', start: '13:00:00', end: '14:00:00', duration: '01:00:00' },
      { type: 'tea', start: '16:00:00', end: '16:15:00', duration: '00:15:00' }
    ],
    notes: ''
  }
];

const AttendanceHistoryPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Summary stats
  const [summary, setSummary] = useState({
    present: 0,
    absent: 0,
    late: 0,
    earlyDeparture: 0,
    totalHours: 0
  });

  // Fetch attendance data on component mount
  useEffect(() => {
    // In a real app, you would fetch from API
    // For now, use mock data
    setTimeout(() => {
      setAttendance(MOCK_ATTENDANCE);

      // Calculate summary
      const present = MOCK_ATTENDANCE.filter(a => a.status === 'present').length;
      const absent = MOCK_ATTENDANCE.filter(a => a.status === 'absent').length;
      const late = MOCK_ATTENDANCE.filter(a => a.lateArrival).length;
      const earlyDeparture = MOCK_ATTENDANCE.filter(a => a.earlyDeparture).length;

      // Calculate total hours
      const totalHours = MOCK_ATTENDANCE.reduce((total, a) => {
        if (a.totalHours) {
          const [hours, minutes] = a.totalHours.split(':');
          return total + parseInt(hours) + parseInt(minutes) / 60;
        }
        return total;
      }, 0);

      setSummary({
        present,
        absent,
        late,
        earlyDeparture,
        totalHours: totalHours.toFixed(2)
      });

      setLoading(false);
    }, 1000);
  }, []);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Handle date filter
  const handleDateFilter = () => {
    // In a real app, you would fetch filtered data from API
    // For now, just filter the mock data
    if (!startDate && !endDate) return;

    setLoading(true);

    setTimeout(() => {
      const filtered = MOCK_ATTENDANCE.filter(a => {
        const date = new Date(a.date);

        if (startDate && endDate) {
          return date >= startDate && date <= endDate;
        } else if (startDate) {
          return date >= startDate;
        } else if (endDate) {
          return date <= endDate;
        }

        return true;
      });

      setAttendance(filtered);
      setLoading(false);
    }, 500);
  };

  // Reset filters
  const resetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSearchTerm('');

    setLoading(true);

    setTimeout(() => {
      setAttendance(MOCK_ATTENDANCE);
      setLoading(false);
    }, 500);
  };

  // Filter attendance based on search term
  const filteredAttendance = attendance.filter(a =>
    a.date.includes(searchTerm) ||
    (a.notes && a.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get status chip color
  const getStatusChipColor = (status) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'error';
      case 'half-day':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircleIcon fontSize="small" />;
      case 'absent':
        return <ErrorIcon fontSize="small" />;
      case 'half-day':
        return <WarningIcon fontSize="small" />;
      default:
        return null;
    }
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';

    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Attendance History
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Present Days
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {summary.present}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Out of {attendance.length} days
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Absent Days
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                {summary.absent}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Out of {attendance.length} days
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Late Arrivals
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                {summary.late}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Times you were late
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Hours
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {summary.totalHours}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hours worked
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              placeholder="Search by date or notes..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              size="small"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SimpleDatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              slotProps={{
                textField: {
                  fullWidth: true
                }
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SimpleDatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              slotProps={{
                textField: {
                  fullWidth: true
                }
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton color="primary" onClick={handleDateFilter}>
                <SearchIcon />
              </IconButton>
              <IconButton color="secondary" onClick={resetFilters}>
                <InfoIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Attendance Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Clock In</TableCell>
                <TableCell>Clock Out</TableCell>
                <TableCell>Total Hours</TableCell>
                <TableCell>Breaks</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Loading attendance data...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredAttendance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">
                      No attendance records found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAttendance
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((record) => (
                    <TableRow key={record.id} hover>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(record.status)}
                          label={record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          size="small"
                          color={getStatusChipColor(record.status)}
                        />
                        {record.lateArrival && (
                          <Chip
                            label="Late"
                            size="small"
                            color="warning"
                            sx={{ ml: 1 }}
                          />
                        )}
                        {record.earlyDeparture && (
                          <Chip
                            label="Early Out"
                            size="small"
                            color="info"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {record.clockIn ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                            {formatTime(record.clockIn)}
                          </Box>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {record.clockOut ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                            {formatTime(record.clockOut)}
                          </Box>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>{formatTime(record.totalHours)}</TableCell>
                      <TableCell>
                        {record.breaks.length > 0 ? (
                          record.breaks.map((breakItem, index) => (
                            <Chip
                              key={index}
                              label={`${breakItem.type}: ${formatTime(breakItem.duration)}`}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))
                        ) : 'No breaks'}
                      </TableCell>
                      <TableCell>{record.notes || 'No notes'}</TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAttendance.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default AttendanceHistoryPage;
