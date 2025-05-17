const Role = require('../models/role.model');
const User = require('../models/user.model');

// Check if user has permission to access a resource
exports.hasPermission = (feature, action) => {
  return async (req, res, next) => {
    try {
      // Get user from request (set by auth middleware)
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      // Get user with populated role
      const user = await User.findById(req.user.id).populate('role');

      if (!user || !user.role) {
        return res.status(403).json({ message: 'Forbidden: No role assigned' });
      }

      // Find the feature in user's role permissions
      const featurePermission = user.role.permissions.find(p => p.feat === feature);

      // Check if user has the required action for this feature
      if (!featurePermission || !featurePermission.acts.includes(action)) {
        return res.status(403).json({
          message: `Forbidden: You don't have permission to ${action} ${feature}`
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({
        message: 'Error checking permissions',
        error: err.message
      });
    }
  };
};

// Check if user is an admin
exports.isAdmin = async (req, res, next) => {
  try {
    // Get user from request (set by auth middleware)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Get user with populated role
    const user = await User.findById(req.user.id).populate('role');

    if (!user || !user.role || user.role.name !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    next();
  } catch (err) {
    return res.status(500).json({
      message: 'Error checking admin status',
      error: err.message
    });
  }
};