import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  ListItemSecondaryAction,
  Tooltip,
  CircularProgress
} from '@mui/material';

// Icons
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DeleteIcon from '@mui/icons-material/Delete';
import MarkChatReadIcon from '@mui/icons-material/MarkChatRead';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';

// Redux actions
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../../redux/notification/notificationSlice';

const NotificationMenu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { notifications, unreadCount, isLoading } = useSelector(
    (state) => state.notification
  );

  const { user } = useSelector((state) => state.auth);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Fetch notifications on component mount
  useEffect(() => {
    if (user) {
      dispatch(getUserNotifications(user.id));
      dispatch(getUnreadCount(user.id));

      // Set up polling for new notifications (every 30 seconds)
      const interval = setInterval(() => {
        dispatch(getUnreadCount(user.id));
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [dispatch, user]);

  // Handle menu open
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    // Fetch notifications when menu is opened
    if (user) {
      dispatch(getUserNotifications(user.id));
    }
  };

  // Handle menu close
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.read) {
      dispatch(markAsRead(notification._id));
    }

    // Navigate based on notification type
    if (notification.type === 'leave_approved' || notification.type === 'leave_rejected') {
      navigate('/leaves');
    } else if (notification.type === 'attendance_anomaly' || notification.type === 'attendance_late' || notification.type === 'attendance_early_departure') {
      navigate('/attendance');
    } else if (notification.type === 'leave_reminder' || notification.type === 'leave_request') {
      // Check if user has permission to access leave approval page
      const userRole = user?.role?.name;
      if (userRole === 'admin' || userRole === 'hr' || userRole === 'manager') {
        navigate('/leaves/approval');
      } else {
        // If user doesn't have permission, just go to leaves page
        navigate('/leaves');
      }
    } else if (notification.type === 'task_assigned' || notification.type === 'task_status_changed' || notification.type === 'task_completed') {
      // Navigate to the task if there's a relatedId
      if (notification.relatedId) {
        navigate(`/tasks/${notification.relatedId}`);
      } else {
        navigate('/tasks');
      }
    } else if (notification.type === 'break_too_long') {
      navigate('/attendance');
    } else if (notification.type === 'system') {
      // For system notifications, just mark as read and don't navigate
      // You could navigate to a specific page if needed
      // navigate('/notifications');
    }

    handleClose();
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

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'leave_approved':
        return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      case 'leave_rejected':
        return <CancelIcon sx={{ color: 'error.main' }} />;
      case 'attendance_anomaly':
      case 'attendance_late':
      case 'attendance_early_departure':
      case 'break_too_long':
        return <WarningIcon sx={{ color: 'warning.main' }} />;
      case 'leave_reminder':
      case 'leave_request':
        return <AccessTimeIcon sx={{ color: 'info.main' }} />;
      case 'task_assigned':
      case 'task_status_changed':
      case 'task_completed':
        return <NotificationsActiveIcon sx={{ color: 'primary.main' }} />;
      case 'system':
        return <NotificationsActiveIcon sx={{ color: 'primary.main' }} />;
      default:
        return <NotificationsActiveIcon color="primary" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          onClick={handleClick}
          size="large"
          aria-controls={open ? 'notifications-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          color="inherit"
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        id="notifications-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            width: 360,
            maxHeight: 500,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Tooltip title="Mark all as read">
              <IconButton size="small" onClick={handleMarkAllAsRead}>
                <DoneAllIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <NotificationsOffIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification._id}
                component="div"
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  bgcolor: notification.read ? 'transparent' : 'action.hover',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer'
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'background.paper' }}>
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Typography variant="subtitle2" noWrap component="span">
                      {notification.title}
                    </Typography>
                  }
                  secondary={
                    <Box component="span">
                      <Typography
                        variant="body2"
                        color="text.primary"
                        component="span"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 0.5
                        }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" component="span" display="block">
                        {formatDate(notification.createdAt)}
                      </Typography>
                    </Box>
                  }
                />

                <ListItemSecondaryAction>
                  <Tooltip title="Delete">
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={(e) => handleDeleteNotification(e, notification._id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {!notification.read && (
                    <Tooltip title="Mark as read">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(markAsRead(notification._id));
                        }}
                        sx={{ ml: 1 }}
                      >
                        <MarkChatReadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}

        <Divider />

        <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
          <Button
            size="small"
            onClick={() => {
              navigate('/notifications');
              handleClose();
            }}
          >
            View All Notifications
          </Button>
        </Box>
      </Menu>
    </>
  );
};

export default NotificationMenu;
