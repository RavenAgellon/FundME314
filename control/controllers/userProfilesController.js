const UserProfile = require('../../entity/UserProfile');
const User = require('../../entity/User');

// viewUserProfile — get all profiles (no search)
async function viewUserProfile(req, res) {
  try {
    const profiles = await UserProfile.find({}).sort({ createdAt: 1 });
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// searchUserProfile — search profiles by name, ID or description
async function searchUserProfile(req, res) {
  try {
    const { search } = req.query;
    if (!search) return res.status(400).json({ message: 'Search query is required' });

    const profiles = await UserProfile.find({
      $or: [
        { roleName: { $regex: search, $options: 'i' } },
        { roleID: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }).sort({ createdAt: 1 });

    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// createUserProfile — create a new role profile
async function createUserProfile(req, res) {
  try {
    const { roleName, description } = req.body;
    if (!roleName) return res.status(400).json({ message: 'Role name is required' });

    const existing = await UserProfile.findOne({ roleName });
    if (existing) return res.status(400).json({ message: 'A profile with this role name already exists' });

    const profile = new UserProfile({ roleName, description });
    await profile.save();
    res.status(201).json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// updateUserProfile — update role name or description
async function updateUserProfile(req, res) {
  try {
    const { roleName, description } = req.body;
    const profile = await UserProfile.findOne({ roleID: req.params.roleID });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    if (roleName !== undefined) profile.roleName = roleName;
    if (description !== undefined) profile.description = description;
    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// suspendUserProfile — toggle suspension + cascade to all users with that role
async function suspendUserProfile(req, res) {
  try {
    const profile = await UserProfile.findOne({ roleID: req.params.roleID });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    profile.suspended = !profile.suspended;
    await profile.save();

    await User.updateMany({ role: profile.roleName }, { suspended: profile.suspended });
    const affectedCount = await User.countDocuments({ role: profile.roleName });

    res.json({
      message: `Profile ${profile.suspended ? 'suspended' : 'unsuspended'}. ${affectedCount} user(s) affected.`,
      suspended: profile.suspended,
      affectedUsers: affectedCount
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = { viewUserProfile, searchUserProfile, createUserProfile, updateUserProfile, suspendUserProfile };