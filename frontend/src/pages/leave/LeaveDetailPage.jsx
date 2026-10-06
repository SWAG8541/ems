import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import CommentIcon from '@mui/icons-material/Comment';
import SendIcon from '@mui/icons-material/Send';

// Services
import leaveService from '../../api/leaveService';

const LeaveDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dialog states
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  
  // Form states
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [newComment, setNewComment] = useState('');
  
  // Fetch leave data
  useEffect(() => {
    const fetchLeave = async () => {
      try {
        setLoading(true);
        const leaveData = await leaveService.getLeaveById(id);
        setLeave(leaveData);
        setError(null);
      } catch (err) {
        console.error('Error fetching leave details:', err);
        setError('Failed to load leave details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeave();
  }, [id]);
  
  // Check if user can approve/reject
  const canApprove = () => {
    if (!user || !leave) return false;
    
    // Admin can approve any leave
    if (user.role?.name === 'admin') return true;
    
    // Manager can approve leaves for their team members
    if (user.role?.name === 'manager' && leave.employee?.manager?._id === user.employeeId) return true;
    
    // HR can approve leaves
    if (user.role?.name === 'hr') return true;
    
    return false;
  };
  
  // Check if user can cancel
  const canCancel = () => {
    if (!user || !leave) return false;
    
    // User can cancel their own pending leave
    if (leave.employee?.user?._id === user.id && leave.status === 'pending') return true;
    
    return false;
  };
  
  // Open approve dialog
  const handleOpenApproveDialog = () => {
    setApprovalComment('');
    setApproveDialogOpen(true);
  };
  
  // Close approve dialog
  const handleCloseApproveDialog = () => {
    setApproveDialogOpen(false);
    setApprovalComment('');
  };
  
  // Open reject dialog
  const handleOpenRejectDialog = () => {
    setRejectionReason('');
    setRejectDialogOpen(true);
  };
  
  // Close reject dialog
  const handleCloseRejectDialog = () => {
    setRejectDialogOpen(false);
    setRejectionReason('');
  };
  
  // Open cancel dialog
  const handleOpenCancelDialog = () => {
    setCancelReason('');
    setCancelDialogOpen(true);
  };
  
  // Close cancel dialog
  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
    setCancelReason('');
  };
  
  // Open comment dialog
  const handleOpenCommentDialog = () => {
    setNewComment('');
    setCommentDialogOpen(true);
  };
  
  // Close comment dialog
  const handleCloseCommentDialog = () => {
    setCommentDialogOpen(false);
    setNewComment('');
  };
  
  // Approve leave
  const handleApproveLeave = async () => {
    try {
      setLoading(true);
      const updatedLeave = await leaveService.approveLeave(id, approvalComment);
      setLeave(updatedLeave);
      handleCloseApproveDialog();
      setError(null);
    } catch (err) {
      console.error('Error approving leave:', err);
      setError('Failed to approve leave. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Reject leave
  const handleRejectLeave = async () => {
    if (!rejectionReason.trim()) return;
    
    try {
      setLoading(true);
      const updatedLeave = await leaveService.rejectLeave(id, rejectionReason);
      setLeave(updatedLeave);
      handleCloseRejectDialog();
      setError(null);
    } catch (err) {
      console.error('Error rejecting leave:', err);
      setError('Failed to reject leave. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Cancel leave
  const handleCancelLeave = async () => {
    try {
      setLoading(true);
      const updatedLeave = await leaveService.cancelLeave(id, cancelReason);
      setLeave(updatedLeave);
      handleCloseCancelDialog();
      setError(null);
    } catch (err) {
      console.error('Error cancelling leave:', err);
      setError('Failed to cancel leave. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Add comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      setLoading(true);
      const updatedLeave = await leaveService.addComment(id, { text: newComment });
      setLeave(updatedLeave);
      handleCloseCommentDialog();
      setError(null);
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format date and time for display
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
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
  
  // Get status chip color
  const getStatusChipColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };
  
  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };
  
  // Get random color based on user name for avatar
  const getAvatarColor = (name) => {
    if (!name) return '#1976d2';
    const colors = [
      '#1976d2', '#388e3c', '#d32f2f', '#7b1fa2', '#c2185b',
      '#0288d1', '#303f9f', '#689f38', '#fbc02d', '#ef6c00'
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };
  
  if (loading && !leave) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
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
          to="/leaves"
        >
          Back to Leaves
        </Button>
        <Typography variant="h4" component="h1">
          Leave Request Details
        </Typography>
        <Box>
          {canApprove() && leave?.status === 'pending' && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={handleOpenApproveDialog}
                sx={{ mr: 1 }}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<CancelIcon />}
                onClick={handleOpenRejectDialog}
              >
                Reject
              </Button>
            </>
          )}
          
          {canCancel() && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<CloseIcon />}
              onClick={handleOpenCancelDialog}
              sx={{ ml: 1 }}
            >
              Cancel Request
            </Button>
          )}
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {leave && (
        <Grid container spacing={3}>
          {/* Leave Details */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" gutterBottom>
                  Leave Details
                </Typography>
                <Chip
                  label={leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                  color={getStatusChipColor(leave.status)}
                />
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Leave Type
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EventNoteIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">
                      {getLeaveTypeLabel(leave.leaveType)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Employee
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">
                      {leave.employee?.user?.name || 'Unknown Employee'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Start Date
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarTodayIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">
                      {formatDate(leave.startDate)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    End Date
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarTodayIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">
                      {formatDate(leave.endDate)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Total Days
                  </Typography>
                  <Typography variant="body1">
                    {leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'}
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Applied On
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">
                      {formatDateTime(leave.createdAt)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Reason
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body1">
                      {leave.reason}
                    </Typography>
                  </Paper>
                </Grid>
                
                {leave.status !== 'pending' && (
                  <>
                    <Grid size={{ xs: 12 }}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Status Information
                      </Typography>
                    </Grid>
                    
                    {leave.approvedBy && (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          {leave.status === 'approved' ? 'Approved By' : 'Rejected By'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="body1">
                            {leave.approvedBy?.user?.name || 'Unknown'}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {leave.approvalDate && (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          {leave.status === 'approved' ? 'Approved On' : 'Rejected On'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="body1">
                            {formatDateTime(leave.approvalDate)}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {leave.statusHistory && leave.statusHistory.length > 0 && (
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Status History
                        </Typography>
                        <List>
                          {leave.statusHistory.map((history, index) => (
                            <ListItem key={index} divider={index < leave.statusHistory.length - 1}>
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: getStatusChipColor(history.status) }}>
                                  {history.status === 'approved' ? <CheckCircleIcon /> : 
                                   history.status === 'rejected' ? <CancelIcon /> : 
                                   history.status === 'cancelled' ? <CloseIcon /> : 
                                   <AccessTimeIcon />}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={`Status changed to ${history.status.charAt(0).toUpperCase() + history.status.slice(1)}`}
                                secondary={
                                  <>
                                    {history.updatedBy?.user?.name && `By: ${history.updatedBy.user.name}`}
                                    {history.updatedAt && ` | ${formatDateTime(history.updatedAt)}`}
                                    {history.comments && (
                                      <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                                        {history.comments}
                                      </Typography>
                                    )}
                                  </>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    )}
                  </>
                )}
              </Grid>
            </Paper>
            
            {/* Emergency Contact */}
            {leave.emergencyContact && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Emergency Contact
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Name
                    </Typography>
                    <Typography variant="body1">
                      {leave.emergencyContact.name || 'Not provided'}
                    </Typography>
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Phone
                    </Typography>
                    <Typography variant="body1">
                      {leave.emergencyContact.phone || 'Not provided'}
                    </Typography>
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Relationship
                    </Typography>
                    <Typography variant="body1">
                      {leave.emergencyContact.relationship || 'Not provided'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            )}
            
            {/* Work Handover */}
            {(leave.handoverNotes || leave.workCoveredBy) && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Work Handover
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  {leave.workCoveredBy && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Work Covered By
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body1">
                          {leave.workCoveredBy.user?.name || leave.workCoveredBy.employeeId || 'Not specified'}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  
                  {leave.handoverNotes && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Handover Notes
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="body1">
                          {leave.handoverNotes}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            )}
          </Grid>
          
          {/* Comments Section */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" gutterBottom>
                  Comments
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<CommentIcon />}
                  onClick={handleOpenCommentDialog}
                >
                  Add Comment
                </Button>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              {leave.comments && leave.comments.length > 0 ? (
                <List>
                  {leave.comments.map((comment, index) => (
                    <ListItem key={index} divider={index < leave.comments.length - 1}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: getAvatarColor(comment.user?.name) }}>
                          {getUserInitials(comment.user?.name)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={comment.user?.name || 'Unknown User'}
                        secondary={
                          <>
                            <Typography variant="caption" component="span">
                              {formatDateTime(comment.date)}
                            </Typography>
                            <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                              {comment.text}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 3 }}>
                  No comments yet
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Approve Dialog */}
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
      
      {/* Reject Dialog */}
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
      
      {/* Cancel Dialog */}
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
            fullWidth
            label="Reason for Cancellation (Optional)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            multiline
            rows={3}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog}>No</Button>
          <Button
            onClick={handleCancelLeave}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Yes, Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Comment Dialog */}
      <Dialog
        open={commentDialogOpen}
        onClose={handleCloseCommentDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Comment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            multiline
            rows={3}
            sx={{ mt: 2 }}
            required
            error={commentDialogOpen && !newComment.trim()}
            helperText={commentDialogOpen && !newComment.trim() ? 'Comment is required' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCommentDialog}>Cancel</Button>
          <Button
            onClick={handleAddComment}
            variant="contained"
            color="primary"
            disabled={loading || !newComment.trim()}
            endIcon={<SendIcon />}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Comment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveDetailPage;
