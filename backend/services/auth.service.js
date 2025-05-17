const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (userData) => {
  const user = new User({
    name: userData.name,
    email: userData.email,
    password: userData.password
  });

  return await user.save();
};

// Login user
exports.login = async (email, password) => {
  // Find user by email and include password for verification
  const user = await User.findOne({ email }).select('+password').populate('role');

  if (!user) {
    return { success: false, message: 'Invalid credentials' };
  }

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return { success: false, message: 'Invalid credentials' };
  }

  // Get employee information if it exists
  const Employee = require('../models/employee.model');
  const employee = await Employee.findOne({ user: user._id });

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return {
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: employee ? employee._id : null
    }
  };
};

// Get user profile
exports.getProfile = async (userId) => {
  const user = await User.findById(userId).populate('role');

  if (!user) return null;

  // Get employee information if it exists
  const Employee = require('../models/employee.model');
  const employee = await Employee.findOne({ user: userId });

  // Create a user object with employee information
  const userWithEmployee = {
    ...user.toObject(),
    employeeId: employee ? employee._id : null
  };

  return userWithEmployee;
};
