import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import userReducer from './user/userSlice';
import timeTrackingReducer from './timeTracking/timeTrackingSlice';
import breakReducer from './breaks/breakSlice';
import employeeReducer from './employee/employeeSlice';
import notificationReducer from './notification/notificationSlice';
import attendanceReducer from './attendance/attendanceSlice';
import projectReducer from './project/projectSlice';
import taskReducer from './task/taskSlice';

// Import other reducers as they are created

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    timeTracking: timeTrackingReducer,
    breaks: breakReducer,
    employee: employeeReducer,
    notification: notificationReducer,
    attendance: attendanceReducer,
    project: projectReducer,
    task: taskReducer,
    // Add other reducers here as they are created
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;