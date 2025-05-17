const User = require('../models/user.model');

// Create a new user with role assignment
exports.createUser = async (userData) => {
  // Check if email already exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error('Email already in use');
  }

  // Create new user
  const user = new User({
    name: userData.name,
    email: userData.email,
    password: userData.password,
    role: userData.role
  });

  // Save and return user with populated role
  const savedUser = await user.save();
  return await User.findById(savedUser._id).populate('role');
};

// Get all users with filtering and pagination
exports.getAllUsers = async (filters = {}) => {
  const query = {};

  // Apply filters if provided
  if (filters.name) {
    query.name = { $regex: filters.name, $options: 'i' };
  }

  if (filters.email) {
    query.email = { $regex: filters.email, $options: 'i' };
  }

  if (filters.role) {
    query.role = filters.role;
  }

  // Set up pagination
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const skip = (page - 1) * limit;

  // Get total count for pagination
  const total = await User.countDocuments(query);

  // Get users with pagination
  const users = await User.find(query)
    .populate('role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

// Get user by ID (with populated role)
exports.getUserById = async (userId) => {
  return await User.findById(userId).populate('role');
};

// Update user
exports.updateUser = async (userId, userData) => {
  return await User.findByIdAndUpdate(
    userId,
    userData,
    { new: true, runValidators: true }
  ).populate('role');
};

// Delete user
exports.deleteUser = async (userId) => {
  return await User.findByIdAndDelete(userId);
};

// Assign role to user
exports.assignRole = async (userId, roleId) => {
  return await User.findByIdAndUpdate(
    userId,
    { role: roleId },
    { new: true, runValidators: true }
  ).populate('role');
};