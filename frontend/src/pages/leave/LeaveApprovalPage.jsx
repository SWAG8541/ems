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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Tooltip,
  Divider,
  Card,
  CardContent,
  CardActions
} from '@mui/material';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CommentIcon from '@mui/icons-material/Comment';
import CloseIcon from '@mui/icons-material/Close';

// Services
import leaveService from '../../api/leaveService';
import employeeService from '../../api/employeeService';

const LeaveApprovalPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Fetch pending leave requests on component mount
  useEffect(() => {
    const fetchPendingLeaves = async () => {
      try {
        setLoading(true);
        
        // Get current employee ID
        const employeeResponse = await employeeService.getEmployeeByUserId(user.id);
        const employeeId = employeeResponse._id;
        
        // Fetch pending leave requests for approval
        const pendingLeavesResponse = await leaveService.getPendingLeavesForApproval(employeeId);
        setPendingLeaves(pendingLeavesResponse || []);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching pending leaves:', err);
        setError('Failed to load pending leave requests. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPendingLeaves();
  }, [user.id]);
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Open view leave dialog
  const handleViewLeave = (leave) => {
    setSelectedLeave(leave);
    setViewDialogOpen(true);
  };
  
  // Close view leave dialog
  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedLeave(null);
  };
  
  // Open approve leave dialog
  const handleOpenApproveDialog = (leave) => {
    setSelectedLeave(leave);
    setApprovalComment('');
    setApproveDialogOpen(true);
  };
  
  // Close approve leave dialog
  const handleCloseApproveDialog = () => {
    setApproveDialogOpen(false);
    setSelectedLeave(null);
    setApprovalComment('');
  };
  
  // Open reject leave dialog
  const handleOpenRejectDialog = (leave) => {
    setSelectedLeave(leave);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };
  
  // Close reject leave dialog
  const handleCloseRejectDialog = () => {
    setRejectDialogOpen(false);
    setSelectedLeave(null);
    setRejectionReason('');
  };
  
  // Approve leave request
  const handleApproveLeave = async () => {
    if (!selectedLeave) return;
    
    try {
      setLoading(true);
      
      // Approve leave request
      await leaveService.approveLeave(selectedLeave._id, approvalComment);
      
      // Update local state
      setPendingLeaves(pendingLeaves.filter(leave => leave._id !== selectedLeave._id));
      
      // Close dialog
      handleCloseApproveDialog();
      setError(null);
    } catch (err) {
      console.error('Error approving leave request:', err);
      setError('Failed to approve leave request. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Reject leave request
  const handleRejectLeave = async () => {
    if (!selectedLeave || !rejectionReason.trim()) return;
    
    try {
      setLoading(true);
      
      // Reject leave request
      await leaveService.rejectLeave(selectedLeave._id, rejectionReason);
      
      // Update local state
      setPendingLeaves(pendingLeaves.filter(leave => leave._id !== selectedLeave._id));
      
      // Close dialog
      handleCloseRejectDialog();
      setError(null);
    } catch (err) {
      console.error('Error rejecting leave request:', err);
      setError('Failed to reject leave request. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get leave type label
  const getLeaveTypeLabel = (type) => {
    switch (type) {
      case 'annual': return 'Annual Leave';
      case 'sick': return 'Sick Leave';
      case 'casual': return 'Casual Leave';
      case 'compensatory': return 'Compensatory Leave';
      case 'work_from_home': return 'Work From Home';
      case 'unpaid': return 'Unpaid Leave';
      case 'maternity': return 'Maternity Leave';
      case 'paternity': return 'Paternity Leave';
      case 'bereavement': return 'Bereavement Leave';
      default: return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };
  
  // Get leave type icon
  const getLeaveTypeIcon = (type) => {
    switch (type) {
      case 'annual': return <EventNoteIcon />;
      case 'sick': return <EventNoteIcon />;
      case 'work_from_home': return <EventNoteIcon />;
      default: return <EventNoteIcon />;
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Leave Approval
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Requests
              </Typography>
              <Typography variant="h3" color="primary">
                {pendingLeaves.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Pending Leave Requests Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Leave Type</TableCell>
                <TableCell>Date Range</TableCell>
                <TableCell>Days</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Applied On</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Loading pending leave requests...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : pendingLeaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">
                      No pending leave requests found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                pendingLeaves
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((leave) => (
                    <TableRow key={leave._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="body2">
                            {leave.employee?.user?.name || 'Unknown Employee'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getLeaveTypeIcon(leave.leaveType)}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {getLeaveTypeLabel(leave.leaveType)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      </TableCell>
                      <TableCell>{leave.totalDays}</TableCell>
                      <TableCell>{leave.reason}</TableCell>
                      <TableCell>{formatDate(leave.createdAt)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewLeave(leave)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Approve">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleOpenApproveDialog(leave)}
                          >
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenRejectDialog(leave)}
                          >
                            <CancelIcon fontSize="small" />
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
          count={pendingLeaves.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* View Leave Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Leave Request Details
          <IconButton
            aria-label="close"
            onClick={handleCloseViewDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedLeave && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Employee
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedLeave.employee?.user?.name || 'Unknown Employee'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {selectedLeave.employee?.position || 'Position not specified'}
                </Typography>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Department
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedLeave.employee?.department?.name || 'Department not specified'}
                </Typography>
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Leave Type
                </Typography>
                <Chip
                  label={getLeaveTypeLabel(selectedLeave.leaveType)}
                  color="primary"
                  variant="outlined"
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Total Days
                </Typography>
                <Typography variant="body1">
                  {selectedLeave.totalDays}
                </Typography>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Start Date
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    {formatDate(selectedLeave.startDate)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" gutterBottom>
                  End Date
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    {formatDate(selectedLeave.endDate)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Reason
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body1">
                    {selectedLeave.reason}
                  </Typography>
                </Paper>
              </Grid>
              
              {selectedLeave.emergencyContact && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Emergency Contact
                    </Typography>
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Name
                    </Typography>
                    <Typography variant="body1">
                      {selectedLeave.emergencyContact.name || 'Not provided'}
                    </Typography>
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Phone
                    </Typography>
                    <Typography variant="body1">
                      {selectedLeave.emergencyContact.phone || 'Not provided'}
                    </Typography>
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Relationship
                    </Typography>
                    <Typography variant="body1">
                      {selectedLeave.emergencyContact.relationship || 'Not provided'}
                    </Typography>
                  </Grid>
                </>
              )}
              
              {selectedLeave.handoverNotes && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Work Handover
                    </Typography>
                  </Grid>
                  
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Handover Notes
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="body1">
                        {selectedLeave.handoverNotes}
                      </Typography>
                    </Paper>
                  </Grid>
                </>
              )}
              
              {selectedLeave.workCoveredBy && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Work Covered By
                  </Typography>
                  <Typography variant="body1">
                    {selectedLeave.workCoveredBy.user?.name || selectedLeave.workCoveredBy.employeeId || 'Not specified'}
                  </Typography>
                </Grid>
              )}
              
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Application Details
                </Typography>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Applied On
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    {formatDate(selectedLeave.createdAt)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={() => {
              handleCloseViewDialog();
              handleOpenApproveDialog(selectedLeave);
            }}
          >
            Approve
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<CancelIcon />}
            onClick={() => {
              handleCloseViewDialog();
              handleOpenRejectDialog(selectedLeave);
            }}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Approve Leave Dialog */}
      <Dialog
        open={approveDialogOpen}
        onClose={handleCloseApproveDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve Leave Request</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to approve this leave request?
          </Typography>
          <TextField
            fullWidth
            label="Comments (Optional)"
            value={approvalComment}
            onChange={(e) => setApprovalComment(e.target.value)}
            multiline
            rows={3}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApproveDialog}>Cancel</Button>
          <Button
            onClick={handleApproveLeave}
            variant="contained"
            color="success"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Reject Leave Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={handleCloseRejectDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Leave Request</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to reject this leave request?
          </Typography>
          <TextField
            fullWidth
            label="Reason for Rejection"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            multiline
            rows={3}
            sx={{ mt: 2 }}
            required
            error={rejectDialogOpen && !rejectionReason.trim()}
            helperText={rejectDialogOpen && !rejectionReason.trim() ? 'Reason is required' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRejectDialog}>Cancel</Button>
          <Button
            onClick={handleRejectLeave}
            variant="contained"
            color="error"
            disabled={loading || !rejectionReason.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveApprovalPage;
