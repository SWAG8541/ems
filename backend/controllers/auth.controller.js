const AuthService = require('../services/auth.service');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    const user = await AuthService.register(req.body);
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    if (err.code === 11000) { // Duplicate key error
      return res.status(400).json({ message: 'Email already in use' });
    }
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const result = await AuthService.login(email, password);
    if (!result.success) {
      return res.status(401).json({ message: result.message });
    }

    res.status(200).json({
      message: 'Login successful',
      token: result.token,
      user: result.user
    });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    // req.user is set by the auth middleware
    const user = await AuthService.getProfile(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
};