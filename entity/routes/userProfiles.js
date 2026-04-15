const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('user_admin'));

// viewUserProfile — GET /api/user-profiles
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { roleName: { $regex: search, $options: 'i' } },
          { roleID: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }
    const profiles = await UserProfile.find(query).sort({ createdAt: 1 });
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// createUserProfile — POST /api/user-profiles
router.post('/', async (req, res) => {
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
});

// updateUserProfile — PUT /api/user-profiles/:roleID
router.put('/:roleID', async (req, res) => {
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
});

// suspendUserProfile — PUT /api/user-profiles/:roleID/suspend
// Also suspends/unsuspends all user accounts with that role
router.put('/:roleID/suspend', async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ roleID: req.params.roleID });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    profile.suspended = !profile.suspended;
    await profile.save();

    // Cascade: update all users with this role
    await User.updateMany(
      { role: profile.roleName },
      { suspended: profile.suspended }
    );

    const affectedCount = await User.countDocuments({ role: profile.roleName });

    res.json({
      message: `Profile ${profile.suspended ? 'suspended' : 'unsuspended'}. ${affectedCount} user(s) affected.`,
      suspended: profile.suspended,
      affectedUsers: affectedCount
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;