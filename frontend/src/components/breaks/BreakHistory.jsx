import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import {
  RestaurantMenu as LunchIcon,
  LocalCafe as TeaIcon,
  MoreHoriz as OtherIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { getBreaks } from '../../redux/breaks/breakSlice';

const BreakHistory = ({ date }) => {
  const dispatch = useDispatch();
  const { breaks = [], totalBreakDuration = 0, loading } = useSelector((state) => state.breaks);
  const { user } = useSelector((state) => state.auth);

  // Fetch breaks when component mounts or date changes
  useEffect(() => {
    const employeeId = user?.employeeId;
    if (employeeId) {
      dispatch(getBreaks({ date, employeeId }))
        .unwrap()
        .catch(error => {
          console.error('Error fetching breaks:', error);
          // Don't show error to user to avoid disrupting the UI
        });
    } else {
      // Use a mock employee ID for development or show empty state
      console.warn('No employee ID available for fetching breaks, using mock data');
      // Set empty breaks data for better UX
      // This will show the "No breaks recorded" message instead of an error
    }
  }, [dispatch, date, user]);

  // Format duration in minutes to HH:MM format
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins}m`;
  };

  // Get icon based on break type
  const getBreakIcon = (type) => {
    switch (type) {
      case 'lunch':
        return <LunchIcon />;
      case 'tea':
        return <TeaIcon />;
      case 'other':
        return <OtherIcon />;
      default:
        return <TimeIcon />;
    }
  };

  // Format time to display in 12-hour format
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Break History
        </Typography>

        <Chip
          icon={<TimeIcon />}
          label={`Total: ${formatDuration(totalBreakDuration)}`}
          color="primary"
          variant="outlined"
        />
      </Box>

      <Divider sx={{ mb: 2 }} />

      {loading ? (
        <Typography variant="body2" color="textSecondary" align="center" component="div">
          Loading break history...
        </Typography>
      ) : !breaks || breaks.length === 0 ? (
        <Typography variant="body2" color="textSecondary" align="center" component="div">
          No breaks recorded for this day.
        </Typography>
      ) : (
        <List>
          {breaks.map((breakItem) => (
            <ListItem key={breakItem._id} sx={{ py: 1 }}>
              <ListItemIcon>
                {getBreakIcon(breakItem.type)}
              </ListItemIcon>

              <Box sx={{ flexGrow: 1, ml: 2 }}>
                {/* Primary content */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" component="div">
                    {breakItem.type.charAt(0).toUpperCase() + breakItem.type.slice(1)}
                    {breakItem.description && ` - ${breakItem.description}`}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" component="div">
                    {formatDuration(breakItem.duration)}
                  </Typography>
                </Box>

                {/* Secondary content */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="caption" color="textSecondary" component="div">
                    {formatTime(breakItem.startTime)} - {formatTime(breakItem.endTime)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" component="div">
                    {new Date(breakItem.startTime).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default BreakHistory;
