import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  CalendarToday as CalendarTodayIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Event as EventIcon,
  EventBusy as EventBusyIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import SimpleDatePicker from '../../components/SimpleDatePicker';
import leaveService from '../../api/leaveService';

const LeaveManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({
    annual: 0,
    sick: 0,
    casual: 0,
    compensatory: 0,
    unpaid: 0
  });
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    leaveType: 'annual',
    startDate: new Date(),
    endDate: new Date(),
    reason: '',
    isHalfDay: false,
    halfDayPortion: 'first_half',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    handoverNotes: '',
    workCoveredBy: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [viewLeaveDialogOpen, setViewLeaveDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [employees, setEmployees] = useState([]);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch leave requests
        const myLeaves = await leaveService.getLeavesByEmployee(user.employeeId);
        setLeaveRequests(myLeaves);

        // Fetch leave balance
        const stats = await leaveService.getLeaveStatisticsByEmployee(user.employeeId);
        if (stats && stats.leaveBalance) {
          setLeaveBalance(stats.leaveBalance);
        }

        // Fetch employees for work coverage
        const employeesData = await leaveService.getEmployeesByDepartment(user.departmentId);
        setEmployees(employeesData || []);

        setError(null);
      } catch (err) {
        setError('Failed to fetch leave data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.employeeId]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Open leave request dialog
  const handleOpenLeaveDialog = () => {
    setLeaveDialogOpen(true);
  };

  // Close leave request dialog
  const handleCloseLeaveDialog = () => {
    setLeaveDialogOpen(false);
    setLeaveFormData({
      leaveType: 'annual',
      startDate: new Date(),
      endDate: new Date(),
      reason: '',
      isHalfDay: false,
      halfDayPortion: 'first_half',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      },
      handoverNotes: '',
      workCoveredBy: ''
    });
    setFormErrors({});
  };

  // Handle leave form change
  const handleLeaveFormChange = (event) => {
    const { name, value, checked, type } = event.target;

    if (name.startsWith('emergencyContact.')) {
      const contactField = name.split('.')[1];
      setLeaveFormData({
        ...leaveFormData,
        emergencyContact: {
          ...leaveFormData.emergencyContact,
          [contactField]: value
        }
      });
    } else {
      setLeaveFormData({
        ...leaveFormData,
        [name]: type === 'checkbox' ? checked : value
      });
    }

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  // Handle date change
  const handleDateChange = (field, date) => {
    setLeaveFormData({
      ...leaveFormData,
      [field]: date
    });

    // Clear error for this field if it exists
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: null
      });
    }
  };

  // Calculate business days between two dates
  const calculateBusinessDays = (startDate, endDate) => {
    let count = 0;
    const curDate = new Date(startDate.getTime());
    while (curDate <= endDate) {
      const dayOfWeek = curDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
      curDate.setDate(curDate.getDate() + 1);
    }
    return count;
  };

  // Submit leave request
  const handleSubmitLeave = async () => {
    // Validate form
    const errors = {};

    if (!leaveFormData.reason.trim()) {
      errors.reason = 'Reason is required';
    }

    if (leaveFormData.startDate > leaveFormData.endDate) {
      errors.endDate = 'End date must be after start date';
    }

    // Check leave balance
    const businessDays = calculateBusinessDays(leaveFormData.startDate, leaveFormData.endDate);
    const daysToDeduct = leaveFormData.isHalfDay ? 0.5 : businessDays;

    if (leaveFormData.leaveType !== 'unpaid' &&
        leaveFormData.leaveType !== 'work_from_home' &&
        daysToDeduct > leaveBalance[leaveFormData.leaveType]) {
      errors.leaveType = `Insufficient ${leaveFormData.leaveType} leave balance`;
    }

    // Validate emergency contact for leaves longer than 3 days
    if (businessDays > 3) {
      if (!leaveFormData.emergencyContact.name) {
        errors['emergencyContact.name'] = 'Emergency contact name is required for long leaves';
      }
      if (!leaveFormData.emergencyContact.phone) {
        errors['emergencyContact.phone'] = 'Emergency contact phone is required for long leaves';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Prepare leave data
    const leaveData = {
      ...leaveFormData,
      employee: user.employeeId,
      totalDays: daysToDeduct
    };

    try {
      setLoading(true);
      const response = await leaveService.createLeave(leaveData);

      // Add new leave to state
      setLeaveRequests([response, ...leaveRequests]);

      // Close dialog
      handleCloseLeaveDialog();

      // Show success message
      setError(null);
    } catch (err) {
      setError('Failed to submit leave request. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // View leave details
  const handleViewLeave = (leave) => {
    setSelectedLeave(leave);
    setViewLeaveDialogOpen(true);
  };

  // Close view leave dialog
  const handleCloseViewLeaveDialog = () => {
    setViewLeaveDialogOpen(false);
    setSelectedLeave(null);
  };

  // Open cancel leave dialog
  const handleOpenCancelDialog = (leave) => {
    setSelectedLeave(leave);
    setCancelDialogOpen(true);
  };

  // Close cancel leave dialog
  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
    setSelectedLeave(null);
    setCancelReason('');
  };

  // Cancel leave request
  const handleCancelLeave = async () => {
    if (!selectedLeave) return;

    try {
      setLoading(true);
      await leaveService.cancelLeave(selectedLeave._id, cancelReason);

      // Update leave status in state
      const updatedLeaves = leaveRequests.map(leave =>
        leave._id === selectedLeave._id
          ? { ...leave, status: 'cancelled' }
          : leave
      );

      setLeaveRequests(updatedLeaves);
      handleCloseCancelDialog();
    } catch (err) {
      setError('Failed to cancel leave request. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Get leave type label
  const getLeaveTypeLabel = (type) => {
    const types = {
      annual: 'Annual Leave',
      sick: 'Sick Leave',
      maternity: 'Maternity Leave',
      paternity: 'Paternity Leave',
      bereavement: 'Bereavement Leave',
      unpaid: 'Unpaid Leave',
      casual: 'Casual Leave',
      compensatory: 'Compensatory Leave',
      work_from_home: 'Work From Home',
      other: 'Other Leave'
    };
    return types[type] || type;
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      cancelled: 'default'
    };
    return colors[status] || 'default';
  };

  // Filter leave requests based on tab
  const filteredLeaveRequests = leaveRequests.filter(leave => {
    if (tabValue === 0) {
      // Upcoming and pending leaves
      return ['pending', 'approved'].includes(leave.status) &&
             new Date(leave.endDate) >= new Date();
    } else if (tabValue === 1) {
      // Past leaves
      return new Date(leave.endDate) < new Date();
    } else {
      // All leaves
      return true;
    }
  });

  // DataGrid columns
  const columns = [
    {
      field: 'leaveType',
      headerName: 'Type',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={getLeaveTypeLabel(params.value)}
          size="small"
          color="primary"
          variant="outlined"
        />
      )
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      width: 120,
      valueFormatter: (params) => formatDate(params.value)
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      width: 120,
      valueFormatter: (params) => formatDate(params.value)
    },
    {
      field: 'totalDays',
      headerName: 'Days',
      width: 80,
      valueFormatter: (params) => params.value === 0.5 ? '½ day' : params.value
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
          size="small"
          color={getStatusColor(params.value)}
        />
      )
    },
    {
      field: 'reason',
      headerName: 'Reason',
      width: 200,
      flex: 1
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => handleViewLeave(params.row)}>
              <EventIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {params.row.status === 'pending' && (
            <Tooltip title="Cancel Request">
              <IconButton size="small" onClick={() => handleOpenCancelDialog(params.row)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Leave Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenLeaveDialog}
        >
          Request Leave
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Leave Balance Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Annual Leave
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h4" component="div">
                  {leaveBalance.annual}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  days available
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sick Leave
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventIcon sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="h4" component="div">
                  {leaveBalance.sick}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  days available
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Casual Leave
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h4" component="div">
                  {leaveBalance.casual}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  days available
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Leave Requests */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Upcoming & Pending" />
          <Tab label="Past Leaves" />
          <Tab label="All Leaves" />
        </Tabs>
      </Box>

      <Paper sx={{ height: 400, width: '100%' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={filteredLeaveRequests}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            getRowId={(row) => row._id}
            disableSelectionOnClick
          />
        )}
      </Paper>

      {/* Leave Request Dialog */}
      <Dialog
        open={leaveDialogOpen}
        onClose={handleCloseLeaveDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Request Leave</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formErrors.leaveType}>
                <InputLabel>Leave Type</InputLabel>
                <Select
                  name="leaveType"
                  value={leaveFormData.leaveType}
                  onChange={handleLeaveFormChange}
                  label="Leave Type"
                >
                  <MenuItem value="annual">Annual Leave</MenuItem>
                  <MenuItem value="sick">Sick Leave</MenuItem>
                  <MenuItem value="casual">Casual Leave</MenuItem>
                  <MenuItem value="compensatory">Compensatory Leave</MenuItem>
                  <MenuItem value="work_from_home">Work From Home</MenuItem>
                  <MenuItem value="unpaid">Unpaid Leave</MenuItem>
                  <MenuItem value="other">Other Leave</MenuItem>
                </Select>
                {formErrors.leaveType && (
                  <FormHelperText>{formErrors.leaveType}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="isHalfDay"
                    checked={leaveFormData.isHalfDay}
                    onChange={handleLeaveFormChange}
                  />
                }
                label="Half Day"
              />
              {leaveFormData.isHalfDay && (
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Half Day Portion</InputLabel>
                  <Select
                    name="halfDayPortion"
                    value={leaveFormData.halfDayPortion}
                    onChange={handleLeaveFormChange}
                    label="Half Day Portion"
                  >
                    <MenuItem value="first_half">First Half (Morning)</MenuItem>
                    <MenuItem value="second_half">Second Half (Afternoon)</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <SimpleDatePicker
                label="Start Date"
                value={leaveFormData.startDate}
                onChange={(date) => handleDateChange('startDate', date)}
                error={!!formErrors.startDate}
                helperText={formErrors.startDate}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <SimpleDatePicker
                label="End Date"
                value={leaveFormData.endDate}
                onChange={(date) => handleDateChange('endDate', date)}
                error={!!formErrors.endDate}
                helperText={formErrors.endDate}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="reason"
                label="Reason for Leave"
                value={leaveFormData.reason}
                onChange={handleLeaveFormChange}
                fullWidth
                multiline
                rows={3}
                error={!!formErrors.reason}
                helperText={formErrors.reason}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Emergency Contact Information
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                name="emergencyContact.name"
                label="Contact Name"
                value={leaveFormData.emergencyContact.name}
                onChange={handleLeaveFormChange}
                fullWidth
                error={!!formErrors['emergencyContact.name']}
                helperText={formErrors['emergencyContact.name']}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                name="emergencyContact.phone"
                label="Contact Phone"
                value={leaveFormData.emergencyContact.phone}
                onChange={handleLeaveFormChange}
                fullWidth
                error={!!formErrors['emergencyContact.phone']}
                helperText={formErrors['emergencyContact.phone']}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                name="emergencyContact.relationship"
                label="Relationship"
                value={leaveFormData.emergencyContact.relationship}
                onChange={handleLeaveFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="handoverNotes"
                label="Handover Notes"
                value={leaveFormData.handoverNotes}
                onChange={handleLeaveFormChange}
                fullWidth
                multiline
                rows={3}
                placeholder="Please provide any handover information for your team"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Work Covered By</InputLabel>
                <Select
                  name="workCoveredBy"
                  value={leaveFormData.workCoveredBy}
                  onChange={handleLeaveFormChange}
                  label="Work Covered By"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {employees.map((employee) => (
                    <MenuItem key={employee._id} value={employee._id}>
                      {employee.firstName} {employee.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLeaveDialog}>Cancel</Button>
          <Button
            onClick={handleSubmitLeave}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Leave Dialog */}
      {selectedLeave && (
        <Dialog
          open={viewLeaveDialogOpen}
          onClose={handleCloseViewLeaveDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Leave Request Details</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Leave Type</Typography>
                <Typography variant="body1">
                  {getLeaveTypeLabel(selectedLeave.leaveType)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Status</Typography>
                <Chip
                  label={selectedLeave.status.charAt(0).toUpperCase() + selectedLeave.status.slice(1)}
                  color={getStatusColor(selectedLeave.status)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Start Date</Typography>
                <Typography variant="body1">
                  {formatDate(selectedLeave.startDate)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">End Date</Typography>
                <Typography variant="body1">
                  {formatDate(selectedLeave.endDate)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Total Days</Typography>
                <Typography variant="body1">
                  {selectedLeave.totalDays === 0.5 ? '½ day' : selectedLeave.totalDays}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Half Day</Typography>
                <Typography variant="body1">
                  {selectedLeave.isHalfDay ? (
                    selectedLeave.halfDayPortion === 'first_half' ? 'Morning' : 'Afternoon'
                  ) : 'No'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Reason</Typography>
                <Typography variant="body1">
                  {selectedLeave.reason}
                </Typography>
              </Grid>
              {selectedLeave.emergencyContact && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Emergency Contact</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Typography variant="body1">
                      {selectedLeave.emergencyContact.name || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1">
                      {selectedLeave.emergencyContact.phone || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">Relationship</Typography>
                    <Typography variant="body1">
                      {selectedLeave.emergencyContact.relationship || 'N/A'}
                    </Typography>
                  </Grid>
                </>
              )}
              {selectedLeave.handoverNotes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Handover Notes</Typography>
                  <Typography variant="body1">
                    {selectedLeave.handoverNotes}
                  </Typography>
                </Grid>
              )}
              {selectedLeave.statusHistory && selectedLeave.statusHistory.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Status History</Typography>
                  {selectedLeave.statusHistory.map((history, index) => (
                    <Box key={index} sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <Chip
                        label={history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                        color={getStatusColor(history.status)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {new Date(history.updatedAt).toLocaleString()} - {history.comments || 'No comments'}
                      </Typography>
                    </Box>
                  ))}
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseViewLeaveDialog}>Close</Button>
            {selectedLeave.status === 'pending' && (
              <Button
                onClick={() => {
                  handleCloseViewLeaveDialog();
                  handleOpenCancelDialog(selectedLeave);
                }}
                color="error"
              >
                Cancel Request
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}

      {/* Cancel Leave Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCloseCancelDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cancel Leave Request</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to cancel this leave request?
          </Typography>
          <TextField
            label="Reason for Cancellation"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            fullWidth
            multiline
            rows={3}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog}>No, Keep Request</Button>
          <Button
            onClick={handleCancelLeave}
            variant="contained"
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Yes, Cancel Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveManagementPage;
