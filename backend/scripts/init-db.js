const mongoose = require('mongoose');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const Permission = require('../models/permission.model');
const Employee = require('../models/employee.model');
const Department = require('../models/department.model');
const Project = require('../models/project.model');
const Task = require('../models/task.model');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ems')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

// Initialize database with admin user and roles
const initDB = async () => {
  try {
    // Create admin role with all permissions
    const adminRole = await Role.findOneAndUpdate(
      { name: 'admin' },
      {
        name: 'admin',
        permissions: [
          // CMS permissions
          { feat: 'user', acts: ['create', 'read', 'update', 'delete'] },
          { feat: 'role', acts: ['create', 'read', 'update', 'delete'] },
          { feat: 'permission', acts: ['create', 'read', 'update', 'delete'] },
          { feat: 'content', acts: ['create', 'read', 'update', 'delete'] },

          // HRMS permissions
          { feat: 'employee', acts: ['create', 'read', 'update', 'delete', 'import', 'export'] },
          { feat: 'department', acts: ['create', 'read', 'update', 'delete'] },
          { feat: 'leave', acts: ['create', 'read', 'update', 'delete', 'approve', 'reject'] },
          { feat: 'attendance', acts: ['create', 'read', 'update', 'delete', 'approve'] },
          { feat: 'performance', acts: ['create', 'read', 'update', 'delete', 'approve', 'self_review', 'manager_review'] },

          // PMS permissions
          { feat: 'project', acts: ['create', 'read', 'update', 'delete', 'manage_team', 'view_reports'] },
          { feat: 'task', acts: ['create', 'read', 'update', 'delete', 'assign', 'change_status'] },
          { feat: 'time_entry', acts: ['create', 'read', 'update', 'delete', 'approve', 'report'] },

          // System permissions
          { feat: 'settings', acts: ['read', 'update'] },
          { feat: 'reports', acts: ['generate', 'read', 'export'] },
          { feat: 'notifications', acts: ['create', 'read', 'update', 'delete'] }
        ]
      },
      { upsert: true, new: true }
    );

    // Create editor role with limited permissions
    const editorRole = await Role.findOneAndUpdate(
      { name: 'editor' },
      {
        name: 'editor',
        permissions: [
          { feat: 'content', acts: ['create', 'read', 'update'] },
          { feat: 'user', acts: ['read'] },
          { feat: 'role', acts: ['read'] }
        ]
      },
      { upsert: true, new: true }
    );

    // Create viewer role with read-only permissions
    const viewerRole = await Role.findOneAndUpdate(
      { name: 'viewer' },
      {
        name: 'viewer',
        permissions: [
          { feat: 'content', acts: ['read'] },
          { feat: 'user', acts: ['read'] }
        ]
      },
      { upsert: true, new: true }
    );

    // Create HR Manager role
    const hrManagerRole = await Role.findOneAndUpdate(
      { name: 'hr_manager' },
      {
        name: 'hr_manager',
        permissions: [
          // CMS permissions
          { feat: 'content', acts: ['read'] },
          { feat: 'user', acts: ['read'] },

          // HRMS permissions
          { feat: 'employee', acts: ['create', 'read', 'update', 'delete', 'import', 'export'] },
          { feat: 'department', acts: ['create', 'read', 'update', 'delete'] },
          { feat: 'leave', acts: ['create', 'read', 'update', 'delete', 'approve', 'reject'] },
          { feat: 'attendance', acts: ['create', 'read', 'update', 'delete', 'approve'] },
          { feat: 'performance', acts: ['create', 'read', 'update', 'delete', 'approve', 'manager_review'] },

          // Limited PMS permissions
          { feat: 'project', acts: ['read'] },
          { feat: 'task', acts: ['read'] },

          // Reports
          { feat: 'reports', acts: ['generate', 'read', 'export'] }
        ]
      },
      { upsert: true, new: true }
    );

    // Create Project Manager role
    const projectManagerRole = await Role.findOneAndUpdate(
      { name: 'project_manager' },
      {
        name: 'project_manager',
        permissions: [
          // CMS permissions
          { feat: 'content', acts: ['read'] },
          { feat: 'user', acts: ['read'] },

          // Limited HRMS permissions
          { feat: 'employee', acts: ['read'] },
          { feat: 'department', acts: ['read'] },
          { feat: 'leave', acts: ['read', 'approve', 'reject'] },
          { feat: 'attendance', acts: ['read'] },

          // PMS permissions
          { feat: 'project', acts: ['create', 'read', 'update', 'delete', 'manage_team', 'view_reports'] },
          { feat: 'task', acts: ['create', 'read', 'update', 'delete', 'assign', 'change_status'] },
          { feat: 'time_entry', acts: ['create', 'read', 'update', 'approve', 'report'] },

          // Reports
          { feat: 'reports', acts: ['generate', 'read', 'export'] }
        ]
      },
      { upsert: true, new: true }
    );

    // Create Employee role
    const employeeRole = await Role.findOneAndUpdate(
      { name: 'employee' },
      {
        name: 'employee',
        permissions: [
          // CMS permissions
          { feat: 'content', acts: ['read'] },

          // Limited HRMS permissions
          { feat: 'employee', acts: ['read'] },
          { feat: 'department', acts: ['read'] },
          { feat: 'leave', acts: ['create', 'read'] },
          { feat: 'attendance', acts: ['read'] },
          { feat: 'performance', acts: ['read', 'self_review'] },

          // Limited PMS permissions
          { feat: 'project', acts: ['read'] },
          { feat: 'task', acts: ['read', 'update'] },
          { feat: 'time_entry', acts: ['create', 'read', 'update'] }
        ]
      },
      { upsert: true, new: true }
    );

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@example.com' });

    if (!adminExists) {
      const adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: adminRole._id
      });
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }

    // Only create admin user, no other users

    // No departments, employees, projects, or tasks will be created
    // The admin user will create these as needed

    console.log('Database initialized successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
};

// Run the initialization
initDB();
