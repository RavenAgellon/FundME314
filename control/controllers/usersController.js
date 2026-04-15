const User = require('../../entity/User');

// #6 — View all users (no search)
async function viewUserAccount(req, res) {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// #9 — Search user accounts
async function searchUserAccount(req, res) {
  try {
    const { search } = req.query;
    if (!search) return res.status(400).json({ message: 'Search query is required' });

    const users = await User.find({
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { userID: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }).select('-password').sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// #5 — Create a new user account
async function createUserAccount(req, res) {
  try {
    const { username, password, role, name, email, phoneNumber } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Username, password and role are required' });
    }

    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: 'Username already exists' });

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
}

// #7 — Update a user account
async function updateUserAccount(req, res) {
  try {
    const { name, email, role, password, phoneNumber } = req.body;

    const user = await User.findOne({ userID: req.params.userID });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (password && password.trim() !== '') user.password = password;

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
}

// #8 — Suspend or unsuspend a user account
async function suspendUserAccount(req, res) {
  try {
    const user = await User.findOne({ userID: req.params.userID });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.suspended = !user.suspended;
    await user.save();

    res.json({ message: `User ${user.suspended ? 'suspended' : 'unsuspended'}`, suspended: user.suspended });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = { viewUserAccount, searchUserAccount, createUserAccount, updateUserAccount, suspendUserAccount };