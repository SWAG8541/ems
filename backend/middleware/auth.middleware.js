const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    // Get employee information if it exists
    const Employee = require('../models/employee.model');
    const employee = await Employee.findOne({ user: user._id });

    // Set user in request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      employeeId: employee ? employee._id : null
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized to access this route', error: err.message });
  }
};

// Check if user has required permissions
exports.authorize = (...requiredPermissions) => {
  return (req, res, next) => {
    // Get user from request (set by protect middleware)
    const { user } = req;

    if (!user || !user.role) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    // Check if user has required permissions
    const hasPermission = requiredPermissions.every(permission => {
      const [feat, act] = permission.split(':');

      // Find the feature in user's role permissions
      const featurePermission = user.role.permissions.find(p => p.feat === feat);

      // Check if user has the required action for this feature
      return featurePermission && featurePermission.acts.includes(act);
    });

    if (!hasPermission) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};