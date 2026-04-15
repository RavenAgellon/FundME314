const jwt = require('jsonwebtoken');
const User = require('../../entity/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fundbridge_secret_key';

// #10, #17, #24, #40 — Login
async function login(req, res) {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid username or password' });

    if (user.suspended) return res.status(403).json({ message: 'Your account has been suspended. Please contact an admin.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid username or password' });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, userID: user.userID },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: { id: user._id, userID: user.userID, username: user.username, role: user.role, name: user.name }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// #11, #18, #25, #41 — Logout
function logout(req, res) {
  res.json({ message: 'Logged out successfully' });
}

// Get current logged in user
async function getMe(req, res) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = { login, logout, getMe };