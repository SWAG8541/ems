import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Tabs,
  Tab,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Grid,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';

// Icons
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import MarkChatReadIcon from '@mui/icons-material/MarkChatRead';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';

// Redux actions
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../../redux/notification/notificationSlice';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { notifications, isLoading, isError, message } = useSelector(
    (state) => state.notification
  );

  const { user } = useSelector((state) => state.auth);

  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch notifications on component mount
  useEffect(() => {
    if (user?.id) {
      dispatch(getUserNotifications(user.id));
    }
  }, [dispatch, user]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.isRead) {
      dispatch(markAsRead(notification.id));
    }

    // Navigate based on notification type
    if (notification.type === 'leave_approved' || notification.type === 'leave_rejected') {
      navigate('/leaves');
    } else if (notification.type === 'attendance_anomaly') {
      navigate('/attendance');
    } else if (notification.type === 'leave_reminder') {
      // Check if user has permission to access leave approval page
      const userRole = user?.role?.name;
      if (userRole === 'admin' || userRole === 'hr' || userRole === 'manager') {
        navigate('/leaves/approval');
      } else {
        // If user doesn't have permission, just go to leaves page
        navigate('/leaves');
      }
    } else if (notification.type === 'system') {
      // For system notifications, just mark as read and don't navigate
      // You could navigate to a specific page if needed
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  // Handle delete notification
  const handleDeleteNotification = (event, notificationId) => {
    event.stopPropagation();
    dispatch(deleteNotification(notificationId));
  };

  // Filter notifications based on search term and selected tab
  const filteredNotifications = notifications.filter(notification => {
    // Filter by search term
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by tab
    let matchesTab = true;
    if (tabValue === 0) { // All
      matchesTab = true;
    } else if (tabValue === 1) { // Unread
      matchesTab = !notification.isRead;
    } else if (tabValue === 2) { // Leave
      matchesTab = notification.type === 'leave_approved' || notification.type === 'leave_rejected' || notification.type === 'leave_reminder';
    } else if (tabValue === 3) { // Attendance
      matchesTab = notification.type === 'attendance_anomaly';
    }

    return matchesSearch && matchesTab;
  });

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'leave_approved':
        return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      case 'leave_rejected':
        return <CancelIcon sx={{ color: 'error.main' }} />;
      case 'attendance_anomaly':
        return <WarningIcon sx={{ color: 'warning.main' }} />;
      case 'leave_reminder':
        return <AccessTimeIcon sx={{ color: 'info.main' }} />;
      case 'system':
        return <NotificationsActiveIcon sx={{ color: 'primary.main' }} />;
      default:
        return <NotificationsActiveIcon color="primary" />;
    }
  };

  // Get notification type label
  const getNotificationTypeLabel = (type) => {
    switch (type) {
      case 'leave_approved':
        return 'Leave Approved';
      case 'leave_rejected':
        return 'Leave Rejected';
      case 'attendance_anomaly':
        return 'Attendance Alert';
      case 'leave_reminder':
        return 'Leave Reminder';
      case 'system':
        return 'System Alert';
      default:
        return 'Notification';
    }
  };

  // Get notification type color
  const getNotificationTypeColor = (type) => {
    switch (type) {
      case 'leave_approved':
        return 'success';
      case 'leave_rejected':
        return 'error';
      case 'attendance_anomaly':
        return 'warning';
      case 'leave_reminder':
        return 'info';
      case 'system':
        return 'primary';
      default:
        return 'default';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Notifications
      </Typography>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="All Notifications" />
            <Tab
              label="Unread"
              icon={<Chip
                label={notifications.filter(n => !n.isRead).length}
                size="small"
                color="error"
                sx={{ ml: 1 }}
              />}
              iconPosition="end"
            />
            <Tab label="Leave" />
            <Tab label="Attendance" />
          </Tabs>
        </Box>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <TextField
            fullWidth
            placeholder="Search notifications..."
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
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllAsRead}
              disabled={!notifications.some(n => !n.isRead)}
            >
              Mark All as Read
            </Button>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setSearchTerm('')}
            >
              Clear Filters
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Paper>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : filteredNotifications.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <NotificationsOffIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No notifications found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Try a different search term' : 'You have no notifications at this time'}
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredNotifications.map((notification) => (
              <Box key={notification.id}>
                <ListItem
                  component="div"
                  button={true}
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                    py: 2,
                    cursor: 'pointer'
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: `${getNotificationTypeColor(notification.type)}.light` }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="subtitle1" fontWeight={notification.isRead ? 'normal' : 'bold'}>
                          {notification.title}
                        </Typography>
                        <Chip
                          label={getNotificationTypeLabel(notification.type)}
                          size="small"
                          color={getNotificationTypeColor(notification.type)}
                          sx={{ ml: 1 }}
                        />
                        {!notification.isRead && (
                          <Chip
                            label="New"
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{ mb: 1 }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(notification.createdAt)}
                        </Typography>
                      </>
                    }
                  />

                  <ListItemSecondaryAction>
                    <Tooltip title="Delete">
                      <IconButton
                        edge="end"
                        onClick={(e) => handleDeleteNotification(e, notification.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>

                    {!notification.isRead && (
                      <Tooltip title="Mark as read">
                        <IconButton
                          edge="end"
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(markAsRead(notification.id));
                          }}
                          sx={{ ml: 1 }}
                        >
                          <MarkChatReadIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </Box>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default NotificationsPage;
