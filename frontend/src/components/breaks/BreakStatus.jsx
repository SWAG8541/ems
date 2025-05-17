import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider
} from '@mui/material';
import {
  RestaurantMenu as LunchIcon,
  LocalCafe as TeaIcon,
  MoreHoriz as OtherIcon,
  Timer as TimerIcon
} from '@mui/icons-material';

const BreakStatus = () => {
  const { onBreak = false, breakStatus = null } = useSelector((state) => state.breaks);
  const [currentDuration, setCurrentDuration] = useState(0);

  // Update current duration every second when on break
  useEffect(() => {
    let interval;

    if (onBreak && breakStatus) {
      // Initialize with the current duration from the server
      setCurrentDuration(breakStatus.currentDuration || 0);

      // Update every second
      interval = setInterval(() => {
        setCurrentDuration(prev => prev + 1/60); // Add 1 second (1/60 of a minute)
      }, 1000);
    } else {
      setCurrentDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [onBreak, breakStatus]);

  // Format duration in minutes to HH:MM format
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes * 60) % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
        return <TimerIcon />;
    }
  };

  // If not on break, don't render anything
  if (!onBreak || !breakStatus) {
    return null;
  }

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" align="center" gutterBottom>
        Currently On Break
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Chip
          icon={getBreakIcon(breakStatus.type)}
          label={breakStatus.type.charAt(0).toUpperCase() + breakStatus.type.slice(1)}
          color="secondary"
        />
      </Box>

      {breakStatus.description && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary">
            Description:
          </Typography>
          <Typography variant="body2">
            {breakStatus.description}
          </Typography>
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="subtitle2" color="textSecondary">
            Started At:
          </Typography>
          <Typography variant="body2">
            {new Date(breakStatus.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2" color="textSecondary">
            Duration:
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {formatDuration(currentDuration)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default BreakStatus;
