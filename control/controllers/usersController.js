const User = require('../../entity/User');

class viewUserAccountCon {
  static async viewUserAccount(req, res) {
    try {
      const sortedUsers = await User.find({}).select('-password').sort({ createdAt: -1 });
      res.json(sortedUsers);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
}

class searchUserAccountCon {
  static async searchUserAccount(req, res) {
    try {
      const searchTerm = req.query.search;

      if (!searchTerm) {
        return res.status(400).json({ message: 'Search query is required' });
      }

      const orConditions = [
        { username: { $regex: searchTerm, $options: 'i' } },
        { name: { $regex: searchTerm, $options: 'i' } },
        { role: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ];

      const numericID = Number(searchTerm);
      if (!isNaN(numericID)) {
        orConditions.push({ userID: numericID });
      }

      const searchCondition = { $or: orConditions };

      const matchingUsers = await User.find(searchCondition).select('-password').sort({ createdAt: -1 });

      res.json(matchingUsers);

    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
}

class createUserAccountCon {
  static async createUserAccount(req, res) {
    try {
      const username = req.body.username;
      const password = req.body.password;
      const role = req.body.role;
      const name = req.body.name;
      const email = req.body.email;
      const phoneNumber = req.body.phoneNumber;

      if (!username || !password || !role) {
        return res.status(400).json({ message: 'Username, password and role are required' });
      }

      const existingUser = await User.findOne({ username: username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      if (phoneNumber && phoneNumber !== '') {
        const phonePattern = /^\d{8}$/;
        const phoneIsValid = phonePattern.test(phoneNumber);
        if (!phoneIsValid) {
          return res.status(400).json({ message: 'Phone number must be exactly 8 digits' });
        }
      }

      const newUser = new User({
        username: username,
        password: password,
        role: role,
        name: name,
        email: email,
        phoneNumber: phoneNumber
      });

      await newUser.save();

      const savedUser = newUser.toObject();
      delete savedUser.password;
      res.status(201).json(savedUser);

    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
}

class updateUserAccountCon {
  static async updateUserAccount(req, res) {
    try {
      const userID = req.params.userID;

      const user = await User.findOne({ userID: userID });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (req.body.name !== undefined) {
        user.name = req.body.name;
      }
      if (req.body.email !== undefined) {
        user.email = req.body.email;
      }
      if (req.body.role !== undefined) {
        user.role = req.body.role;
      }
      if (req.body.password && req.body.password.trim() !== '') {
        user.password = req.body.password;
      }

      if (req.body.phoneNumber !== undefined && req.body.phoneNumber !== '') {
        const phonePattern = /^\d{8}$/;
        const phoneIsValid = phonePattern.test(req.body.phoneNumber);
        if (!phoneIsValid) {
          return res.status(400).json({ message: 'Phone number must be exactly 8 digits' });
        }
        user.phoneNumber = req.body.phoneNumber;
      } else if (req.body.phoneNumber === '') {
        user.phoneNumber = '';
      }

      await user.save();

      const updatedUser = user.toObject();
      delete updatedUser.password;
      res.json(updatedUser);

    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
}

class suspendUserAccountCon {
  static async suspendUserAccount(req, res) {
    try {
      const userID = req.params.userID;

      const user = await User.findOne({ userID: userID });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.suspended === true) {
        user.suspended = false;
      } else {
        user.suspended = true;
      }

      await user.save();

      const statusMessage = user.suspended ? 'suspended' : 'unsuspended';
      res.json({
        message: 'User ' + statusMessage,
        suspended: user.suspended
      });

    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
}

module.exports = {
  viewUserAccountCon,
  searchUserAccountCon,
  createUserAccountCon,
  updateUserAccountCon,
  suspendUserAccountCon
};