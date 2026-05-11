const User = require('../../entity/User');

class loginCon {
  static async login(req, res) {
    try {
      const username = req.body.username;
      const password = req.body.password;

      const user = await User.findOne({ username: username });

      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      if (user.suspended === true) {
        return res.status(403).json({ message: 'Your account has been suspended. Please contact an admin.' });
      }

      const passwordIsCorrect = (password === user.password);

      if (!passwordIsCorrect) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      const userInfo = {
        id: user._id,
        userID: user.userID,
        username: user.username,
        role: user.role,
        name: user.name
      };

      res.json({ user: userInfo });

    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
}

class logoutCon {
  static logout(req, res) {
    res.json({ message: 'Logged out successfully' });
  }
}

module.exports = { loginCon, logoutCon };