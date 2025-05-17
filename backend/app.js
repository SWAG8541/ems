const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const permissionRoutes = require('./routes/permission.route');
const roleRoutes = require('./routes/role.route');
const contentRoutes = require('./routes/content.route');
const dashboardRoutes = require('./routes/dashboard.route');

// HRMS routes
const employeeRoutes = require('./routes/employee.route');
const departmentRoutes = require('./routes/department.route');
const designationRoutes = require('./routes/designation.route');
const leaveRoutes = require('./routes/leave.route');
const attendanceRoutes = require('./routes/attendance.route');
const notificationRoutes = require('./routes/notification.route');

// PMS routes
const projectRoutes = require('./routes/project.route');
const taskRoutes = require('./routes/task.route');
const timeEntryRoutes = require('./routes/timeEntry.route');

// Time tracking routes
const timeTrackingRoutes = require('./routes/timeTracking.route');
const breakRoutes = require('./routes/break.route');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// CMS routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// HRMS routes
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/designations', designationRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/notifications', notificationRoutes);

// PMS routes
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/time-entries', timeEntryRoutes);

// Time tracking routes
app.use('/api/time-tracking', timeTrackingRoutes);
app.use('/api/breaks', breakRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Enterprise Management System API',
    modules: [
      'CMS - Content Management System',
      'HRMS - Human Resource Management System',
      'PMS - Project Management System'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

module.exports = app;
