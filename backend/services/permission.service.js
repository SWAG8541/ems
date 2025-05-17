const Permission = require('../models/permission.model');

// Insert or update master permissions
exports.seedPermissions = async (masterPermissions) => {
  const results = [];

  for (const perm of masterPermissions) {
    const existing = await Permission.findOne({ feat: perm.feat });
    if (existing) {
      existing.label = perm.label;
      existing.acts = perm.acts;
      await existing.save();
      results.push({ type: 'updated', feat: perm.feat });
    } else {
      await Permission.create(perm);
      results.push({ type: 'created', feat: perm.feat });
    }
  }

  return results;
};

exports.getAllPermissions = async () => {
  return await Permission.find();
};
