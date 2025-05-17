import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from '../../api/notificationService';

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
};

// Get user notifications
export const getUserNotifications = createAsyncThunk(
  'notifications/getUserNotifications',
  async (userId, thunkAPI) => {
    try {
      return await notificationService.getUserNotifications(userId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get unread count
export const getUnreadCount = createAsyncThunk(
  'notifications/getUnreadCount',
  async (userId, thunkAPI) => {
    try {
      return await notificationService.getUnreadCount(userId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Mark notification as read
export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, thunkAPI) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      return response.notificationId || notificationId;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Mark all notifications as read
export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, thunkAPI) => {
    try {
      await notificationService.markAllAsRead();
      return true;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete notification
export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId, thunkAPI) => {
    try {
      const response = await notificationService.deleteNotification(notificationId);
      return response.notificationId || notificationId;
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create a notification (for testing)
export const createNotification = createAsyncThunk(
  'notifications/createNotification',
  async (notificationData, thunkAPI) => {
    try {
      return await notificationService.createNotification(notificationData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create a leave approval notification
export const createLeaveApprovalNotification = createAsyncThunk(
  'notifications/createLeaveApprovalNotification',
  async ({ userId, leaveData, isApproved, reason }, thunkAPI) => {
    try {
      return await notificationService.createLeaveApprovalNotification(
        userId, leaveData, isApproved, reason
      );
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create an attendance anomaly notification
export const createAttendanceAnomalyNotification = createAsyncThunk(
  'notifications/createAttendanceAnomalyNotification',
  async ({ userId, attendanceData, anomalyType }, thunkAPI) => {
    try {
      return await notificationService.createAttendanceAnomalyNotification(
        userId, attendanceData, anomalyType
      );
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create a leave reminder notification
export const createLeaveReminderNotification = createAsyncThunk(
  'notifications/createLeaveReminderNotification',
  async ({ userId, pendingCount }, thunkAPI) => {
    try {
      return await notificationService.createLeaveReminderNotification(
        userId, pendingCount
      );
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Notification slice
export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    addNotification: (state, action) => {
      // Add a new notification from socket
      state.notifications = [action.payload, ...state.notifications];
      if (!action.payload.isRead && !action.payload.read) {
        state.unreadCount += 1;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Get user notifications
      .addCase(getUserNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.notifications = action.payload;
      })
      .addCase(getUserNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Get unread count
      .addCase(getUnreadCount.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.unreadCount = action.payload;
      })
      .addCase(getUnreadCount.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Mark notification as read
      .addCase(markAsRead.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        // Update the notification in the state
        const index = state.notifications.findIndex(n =>
          (n.id === action.payload) || (n._id === action.payload)
        );
        if (index !== -1) {
          // Create a new array with the updated notification
          state.notifications = state.notifications.map((notification, i) =>
            i === index ? { ...notification, isRead: true, read: true } : notification
          );
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Mark all notifications as read
      .addCase(markAllAsRead.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;

        // Update all notifications in the state
        state.notifications = state.notifications.map(notification => ({
          ...notification,
          isRead: true,
          read: true
        }));
        state.unreadCount = 0;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Delete notification
      .addCase(deleteNotification.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        // Remove the notification from the state
        const index = state.notifications.findIndex(n =>
          (n.id === action.payload) || (n._id === action.payload)
        );
        if (index !== -1) {
          const wasUnread = !state.notifications[index].isRead && !state.notifications[index].read;

          // Create a new array without the deleted notification
          state.notifications = state.notifications.filter(n =>
            (n.id !== action.payload) && (n._id !== action.payload)
          );

          if (wasUnread) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Create notification (and all specific notification types)
      .addCase(createNotification.fulfilled, (state, action) => {
        state.notifications = [action.payload, ...state.notifications];
        if (!action.payload.isRead && !action.payload.read) {
          state.unreadCount += 1;
        }
      })
      .addCase(createLeaveApprovalNotification.fulfilled, (state, action) => {
        state.notifications = [action.payload, ...state.notifications];
        if (!action.payload.isRead && !action.payload.read) {
          state.unreadCount += 1;
        }
      })
      .addCase(createAttendanceAnomalyNotification.fulfilled, (state, action) => {
        state.notifications = [action.payload, ...state.notifications];
        if (!action.payload.isRead && !action.payload.read) {
          state.unreadCount += 1;
        }
      })
      .addCase(createLeaveReminderNotification.fulfilled, (state, action) => {
        state.notifications = [action.payload, ...state.notifications];
        if (!action.payload.isRead && !action.payload.read) {
          state.unreadCount += 1;
        }
      });
  }
});

export const { reset, addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
