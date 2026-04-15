const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// All routes below require login + user_admin role
router.use(protect);
router.use(authorize('user_admin'));

// #6 GET /api/users — view all users (with optional search #9)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
          { userID: { $regex: search, $options: 'i' } },
          { role: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// #5 POST /api/users — create a new user
router.post('/', async (req, res) => {
  try {
    const { username, password, role, name, email, phoneNumber } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Username, password and role are required' });
    }

    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: 'Username already exists' });

    // Validate phone number if provided (must be exactly 8 digits)
    if (phoneNumber !== undefined && phoneNumber !== '') {
      if (!/^\d{8}$/.test(phoneNumber)) {
        return res.status(400).json({ message: 'Phone number must be exactly 8 digits' });
      }
    }

    const user = new User({ username, password, role, name, email, phoneNumber });
    await user.save();

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// #7 PUT /api/users/:userID — update a user
router.put('/:userID', async (req, res) => {
  try {
    const { name, email, role, password, phoneNumber } = req.body;

    const user = await User.findOne({ userID: req.params.userID });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // username and createdAt are non-updateable — intentionally excluded
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (password && password.trim() !== '') user.password = password;

    // Validate phone number — must be exactly 8 digits if provided
    if (phoneNumber !== undefined && phoneNumber !== '') {
      if (!/^\d{8}$/.test(phoneNumber)) {
        return res.status(400).json({ message: 'Phone number must be exactly 8 digits' });
      }
      user.phoneNumber = phoneNumber;
    } else if (phoneNumber === '') {
      user.phoneNumber = '';
    }

    await user.save();

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// #8 PUT /api/users/:userID/suspend — suspend or unsuspend a user
router.put('/:userID/suspend', async (req, res) => {
  try {
    const user = await User.findOne({ userID: req.params.userID });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.suspended = !user.suspended;
    await user.save();

    res.json({ message: `User ${user.suspended ? 'suspended' : 'unsuspended'}`, suspended: user.suspended });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;