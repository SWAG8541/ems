import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import {
  RestaurantMenu as LunchIcon,
  LocalCafe as TeaIcon,
  Person as PersonalIcon,
  Group as MeetingIcon,
  MoreHoriz as OtherIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { startBreak, endBreak, getBreakStatus } from '../../redux/breaks/breakSlice';

const BreakMenu = () => {
  const dispatch = useDispatch();
  const { onBreak = false, breakStatus = null, loading = false, error = null } = useSelector((state) => state.breaks);
  const { user } = useSelector((state) => state.auth);

  const [anchorEl, setAnchorEl] = useState(null);
  const [otherDialogOpen, setOtherDialogOpen] = useState(false);
  const [otherDescription, setOtherDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [currentDuration, setCurrentDuration] = useState(0);

  // Fetch break status on component mount
  useEffect(() => {
    const employeeId = user?.employeeId;
    if (employeeId) {
      dispatch(getBreakStatus(employeeId))
        .unwrap()
        .catch(error => {
          console.error('Error fetching break status:', error);
          // Don't show error to user to avoid disrupting the UI
        });
    }
  }, [dispatch, user]);

  // Update timer when on break
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

  // Handle break menu open
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle break menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle break type selection
  const handleBreakTypeSelect = (type) => {
    handleMenuClose();

    if (type === 'other') {
      setOtherDialogOpen(true);
    } else {
      // Start break with selected type
      const employeeId = user?.employeeId;
      // Always dispatch, the service will handle missing employeeId
      dispatch(startBreak({ type, employeeId }));
      if (!employeeId) {
        console.warn('No employee ID available for starting break, using mock data');
      }
    }
  };

  // Handle other break description submit
  const handleOtherBreakSubmit = () => {
    if (!otherDescription.trim()) {
      setDescriptionError('Please enter a description for your break');
      return;
    }

    // Start break with 'other' type and description
    const employeeId = user?.employeeId;

    // Always dispatch, the service will handle missing employeeId
    dispatch(startBreak({
      type: 'other',
      description: otherDescription.trim(),
      employeeId
    }));

    // Close dialog and reset state
    setOtherDialogOpen(false);
    setOtherDescription('');
    setDescriptionError('');

    if (!employeeId) {
      console.warn('No employee ID available for starting break, using mock data');
    }
  };

  // Handle break end
  const handleBreakEnd = () => {
    const employeeId = user?.employeeId;
    // Always dispatch, the service will handle missing employeeId
    dispatch(endBreak(employeeId));
    if (!employeeId) {
      console.warn('No employee ID available for ending break, using mock data');
    }
  };

  // Format duration in minutes to HH:MM:SS format
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes * 60) % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Break Button */}
      {onBreak ? (
        // Break Out Button (when on break)
        <Button
          variant="contained"
          color="secondary"
          onClick={handleBreakEnd}
          disabled={loading}
          startIcon={<TimerIcon />}
          sx={{ ml: 1, minWidth: '200px' }}
        >
          {loading ?
            <CircularProgress size={24} color="inherit" />
           :
            `Break Out ${formatDuration(currentDuration)}`
          }
        </Button>
      ) : (
        // Break In Button (when not on break)
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleMenuOpen}
          disabled={loading}
          startIcon={<TimerIcon />}
          sx={{ ml: 1, minWidth: '200px' }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Break In'}
        </Button>
      )}

      {/* Break Type Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 'bold' }}>
          Break Type
        </Typography>

        <MenuItem onClick={() => handleBreakTypeSelect('lunch')}>
          <ListItemIcon>
            <LunchIcon />
          </ListItemIcon>
          <ListItemText primary="Lunch" />
        </MenuItem>

        <MenuItem onClick={() => handleBreakTypeSelect('tea')}>
          <ListItemIcon>
            <TeaIcon />
          </ListItemIcon>
          <ListItemText primary="Tea" />
        </MenuItem>

        <MenuItem onClick={() => handleBreakTypeSelect('personal')}>
          <ListItemIcon>
            <PersonalIcon />
          </ListItemIcon>
          <ListItemText primary="Personal" />
        </MenuItem>

        <MenuItem onClick={() => handleBreakTypeSelect('meeting')}>
          <ListItemIcon>
            <MeetingIcon />
          </ListItemIcon>
          <ListItemText primary="Meeting" />
        </MenuItem>

        <MenuItem onClick={() => handleBreakTypeSelect('other')}>
          <ListItemIcon>
            <OtherIcon />
          </ListItemIcon>
          <ListItemText primary="Other" />
        </MenuItem>
      </Menu>

      {/* Other Break Description Dialog */}
      <Dialog
        open={otherDialogOpen}
        onClose={() => setOtherDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Other Break</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              autoFocus
              label="Break Description"
              fullWidth
              value={otherDescription}
              onChange={(e) => setOtherDescription(e.target.value)}
              error={!!descriptionError}
              helperText={descriptionError}
              placeholder="Please describe the reason for your break"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOtherDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleOtherBreakSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Start Break'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Display error if any */}
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </>
  );
};

export default BreakMenu;
