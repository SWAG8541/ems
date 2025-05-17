// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Return mock statistics for now
    res.json({
      userCount: 10,
      roleCount: 5,
      contentCount: 15,
      employeeCount: 25,
      projectCount: 8,
      taskCount: 30,
      leaveCount: 5
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Error getting dashboard statistics' });
  }
};
