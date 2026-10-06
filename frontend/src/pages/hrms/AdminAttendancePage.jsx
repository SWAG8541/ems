import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createLeaveReminderNotification } from '../../redux/notification/notificationSlice';
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
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Tabs,
  Tab
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
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';


import apiClient from '../../api/apiClient';

const AdminAttendancePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tabValue, setTabValue] = useState(0);

  // Filters
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Summary stats
  const [summary, setSummary] = useState({
    present: 0,
    absent: 0,
    late: 0,
    earlyDeparture: 0,
    totalEmployees: 0
  });

  // Fetch attendance data on component mount and when date changes
  useEffect(() => {
    fetchAttendanceData();
  }, [selectedDate]);

  const fetchAttendanceData = async () => {
    setLoading(true);

    try {
      // Format date for API request
      const formattedDate = selectedDate.toISOString().split('T')[0];

      // Fetch data from API
      const [employeesResponse, departmentsResponse, attendanceResponse] = await Promise.all([
        apiClient.get('/employees'),
        apiClient.get('/departments'),
        apiClient.get(`/attendance?date=${formattedDate}`)
      ]);

      const employeesData = employeesResponse.data || [];
      const departmentsData = departmentsResponse.data || [];
      const attendanceData = attendanceResponse.data || [];

      setEmployees(employeesData);
      setDepartments(departmentsData);
      setAttendance(attendanceData);

      // Calculate summary
      const totalEmployees = employeesData.length;
      const present = attendanceData.filter(a => a.status === 'present').length;
      const absent = totalEmployees - present;
      const late = attendanceData.filter(a => a.lateArrival).length;
      const earlyDeparture = attendanceData.filter(a => a.earlyDeparture).length;

      setSummary({
        present,
        absent,
        late,
        earlyDeparture,
        totalEmployees
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setError('Failed to fetch attendance data');
      setEmployees([]);
      setDepartments([]);
      setAttendance([]);
      setSummary({
        present: 0,
        absent: 0,
        late: 0,
        earlyDeparture: 0,
        totalEmployees: 0
      });
      setLoading(false);
    }
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

  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Handle date change
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle department filter change
  const handleDepartmentFilterChange = (event) => {
    setDepartmentFilter(event.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  // Apply filters
  const applyFilters = async () => {
    setLoading(true);

    try {
      // Format date for API request
      const formattedDate = selectedDate.toISOString().split('T')[0];

      // Build query parameters
      const params = { date: formattedDate };

      if (departmentFilter !== 'all') {
        params.department = departmentFilter;
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      // Fetch filtered data from API
      const response = await apiClient.get('/attendance', { params });

      setAttendance(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error applying filters:', error);
      setError('Failed to apply filters');
      setAttendance([]);
      setLoading(false);
    }
  };

  // Reset filters
  const resetFilters = async () => {
    setDepartmentFilter('all');
    setStatusFilter('all');
    setSearchTerm('');

    // Fetch all attendance data again
    fetchAttendanceData();
  };

  // Filter attendance based on search term
  const filteredAttendance = attendance.filter(a =>
    a.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.department.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Export attendance data
  const exportAttendanceData = async () => {
    try {
      // Format date for API request
      const formattedDate = selectedDate.toISOString().split('T')[0];

      // Call API to generate export file
      const response = await apiClient.get(`/attendance/export?date=${formattedDate}`, {
        responseType: 'blob'
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-${formattedDate}.csv`);
      document.body.appendChild(link);
      link.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting attendance data:', error);
      setError('Failed to export attendance data');
    }
  };

  // Send leave reminder notifications to managers
  const sendLeaveReminders = async () => {
    try {
      // Only admin, HR, or managers can send reminders
      if (user?.role?.name === 'admin' || user?.role?.name === 'hr' || user?.role?.name === 'manager') {
        // Call API to send reminders
        const response = await apiClient.post('/leaves/send-reminders');

        // Dispatch notification
        dispatch(createLeaveReminderNotification({
          userId: user.id,
          pendingCount: response.data.pendingCount
        }));

        alert(`Reminder sent for ${response.data.pendingCount} pending leave requests`);
      }
    } catch (error) {
      console.error('Error sending leave reminders:', error);
      setError('Failed to send leave reminders');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Attendance Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AccessTimeIcon />}
            onClick={sendLeaveReminders}
            color="secondary"
          >
            Send Leave Reminders
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={exportAttendanceData}
          >
            Export Data
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Date Selector */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <SimpleDatePicker
              label="Select Date"
              value={selectedDate}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h6" component="div">
              Attendance for {formatDate(selectedDate?.toISOString().split('T')[0])}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Present
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {summary.present}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Out of {summary.totalEmployees} employees
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Absent
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                {summary.absent}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Out of {summary.totalEmployees} employees
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
                Employees arrived late
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Early Departures
              </Typography>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                {summary.earlyDeparture}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Employees left early
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Daily Attendance" icon={<CalendarTodayIcon />} iconPosition="start" />
          <Tab label="By Department" icon={<BusinessIcon />} iconPosition="start" />
          <Tab label="By Employee" icon={<PersonIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              placeholder="Search employees..."
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
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={departmentFilter}
                onChange={handleDepartmentFilterChange}
                label="Department"
              >
                <MenuItem value="all">All Departments</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="present">Present</MenuItem>
                <MenuItem value="absent">Absent</MenuItem>
                <MenuItem value="half-day">Half Day</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<FilterListIcon />}
                onClick={applyFilters}
                size="small"
              >
                Apply Filters
              </Button>
              <Button
                variant="outlined"
                onClick={resetFilters}
                size="small"
              >
                Reset
              </Button>
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
                <TableCell>Employee</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Clock In</TableCell>
                <TableCell>Clock Out</TableCell>
                <TableCell>Total Hours</TableCell>
                <TableCell>Actions</TableCell>
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
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="body2" fontWeight="medium">
                            {record.employeeName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{record.department}</TableCell>
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
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => alert(`View details for ${record.employeeName}`)}
                        >
                          Details
                        </Button>
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

export default AdminAttendancePage;
