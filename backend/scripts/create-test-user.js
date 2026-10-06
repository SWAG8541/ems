const mongoose = require('mongoose');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const Employee = require('../models/employee.model');
const Department = require('../models/department.model');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ems')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Check if admin role exists, create if not
      let adminRole = await Role.findOne({ name: 'Admin' });
      if (!adminRole) {
        adminRole = await Role.create({
          name: 'Admin',
          description: 'Administrator with full access',
          permissions: [
            { feat: 'user', acts: ['create', 'read', 'update', 'delete'] },
            { feat: 'role', acts: ['create', 'read', 'update', 'delete'] },
            { feat: 'content', acts: ['create', 'read', 'update', 'delete'] },
            { feat: 'employee', acts: ['create', 'read', 'update', 'delete'] },
            { feat: 'department', acts: ['create', 'read', 'update', 'delete'] },
            { feat: 'project', acts: ['create', 'read', 'update', 'delete'] },
            { feat: 'task', acts: ['create', 'read', 'update', 'delete'] },
            { feat: 'time_entry', acts: ['create', 'read', 'update', 'delete'] },
            { feat: 'attendance', acts: ['create', 'read', 'update', 'delete'] },
            { feat: 'leave', acts: ['create', 'read', 'update', 'delete'] }
          ]
        });
        console.log('Admin role created');
      }

      // Check if test user exists, create if not
      let testUser = await User.findOne({ email: 'test@example.com' });
      if (!testUser) {
        testUser = await User.create({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: adminRole._id
        });
        console.log('Test user created');
      }

      // Check if department exists, create if not
      let department = await Department.findOne({ name: 'IT Department' });
      if (!department) {
        department = await Department.create({
          name: 'IT Department',
          description: 'Information Technology Department',
          manager: null // Will update after employee creation
        });
        console.log('IT Department created');
      }

      // Check if employee exists, create if not
      let employee = await Employee.findOne({ user: testUser._id });
      if (!employee) {
        employee = await Employee.create({
          user: testUser._id,
          employeeId: 'EMP001',
          department: department._id,
          position: 'Software Developer',
          joinDate: new Date(),
          status: 'active',
          contactInfo: {
            address: '123 Test Street',
            phone: '555-1234',
            emergencyContact: {
              name: 'Emergency Contact',
              relationship: 'Family',
              phone: '555-5678'
            }
          },
          personalInfo: {
            dateOfBirth: new Date('1990-01-01'),
            gender: 'prefer_not_to_say',
            maritalStatus: 'single'
          },
          employmentDetails: {
            employmentType: 'full_time',
            workHoursPerWeek: 40,
            salary: {
              amount: 75000,
              currency: 'USD'
            }
          },
          leaveBalance: {
            annual: 20,
            sick: 10,
            casual: 5,
            compensatory: 0,
            unpaid: 0
          },
          attendanceSettings: {
            workStartTime: '09:00',
            workEndTime: '17:00',
            workDays: [1, 2, 3, 4, 5],
            lateThreshold: 15,
            earlyDepartureThreshold: 15
          }
        });
        console.log('Employee record created for test user');

        // Update department manager
        await Department.findByIdAndUpdate(department._id, { manager: employee._id });
        console.log('Department manager updated');
      }

      console.log('Test user setup complete!');
      console.log('Login with:');
      console.log('Email: test@example.com');
      console.log('Password: password123');
      console.log('Employee ID:', employee._id.toString());
      
    } catch (error) {
      console.error('Error setting up test user:', error);
    } finally {
      mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
