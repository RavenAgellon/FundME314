const User = require('../../entity/User');

// -------------------------------------------------------
// VIEW ALL USER ACCOUNTS — User story #6
// -------------------------------------------------------
class viewAllUserAccountCon {
  static async viewAllUserAccount(req, res) {
    try {
      // Step 1: Get all users from the database, newest first
      const sortedUsers = await User.find({}).select('-password').sort({ createdAt: -1 });

      // Step 2: Send the list back to the browser
      res.json(sortedUsers);

    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
}

// -------------------------------------------------------
// VIEW SINGLE USER ACCOUNT — view one user by their userID
// -------------------------------------------------------
class viewUserAccountCon {
  static async viewUserAccount(req, res) {
    try {
      // Step 1: Get the userID from the URL and convert to integer
      const userID = parseInt(req.params.userID);

      // Step 2: Check that the userID is a valid number
      if (isNaN(userID)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Step 3: Find the user in the database (exclude password)
      const user = await User.findOne({ userID: userID }).select('-password');

      // Step 4: If user not found, return an error
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Step 5: Send the user details back to the browser
      res.json(user);

    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
}

// -------------------------------------------------------
// SEARCH USER ACCOUNTS — User story #9
// -------------------------------------------------------
class searchUserAccountCon {
  static async searchUserAccount(req, res) {
    try {
      // Step 1: Get the search term from the URL
      const searchTerm = req.query.search;

      // Step 2: Make sure a search term was provided
      if (!searchTerm) {
        return res.status(400).json({ message: 'Search query is required' });
      }

      // Step 3: Build the search condition
      const orConditions = [
        { username: { $regex: searchTerm, $options: 'i' } },
        { name:     { $regex: searchTerm, $options: 'i' } },
        { role:     { $regex: searchTerm, $options: 'i' } },
        { email:    { $regex: searchTerm, $options: 'i' } }
      ];

      // If the search term is a number, also search by userID
      const numericID = Number(searchTerm);
      if (!isNaN(numericID)) {
        orConditions.push({ userID: numericID });
      }

      const searchCondition = { $or: orConditions };

      // Step 4: Search the database
      const matchingUsers = await User.find(searchCondition).select('-password').sort({ createdAt: -1 });

      // Step 5: Send the results back to the browser
      res.json(matchingUsers);

    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
}

// -------------------------------------------------------
// CREATE USER ACCOUNT — User story #5
// -------------------------------------------------------
class createUserAccountCon {
  static async createUserAccount(req, res) {
    try {
      // Step 1: Read the fields from the request body
      const username    = req.body.username;
      const password    = req.body.password;
      const role        = req.body.role;
      const name        = req.body.name;
      const email       = req.body.email;
      const phoneNumber = req.body.phoneNumber;

      // Step 2: Check that required fields are not empty
      if (!username || !password || !role) {
        return res.status(400).json({ message: 'Username, password and role are required' });
      }

      // Step 3: Check if the username is already taken
      const existingUser = await User.findOne({ username: username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // Step 4: Validate phone number if provided
      if (phoneNumber && phoneNumber !== '') {
        const phonePattern = /^\d{8}$/;
        const phoneIsValid = phonePattern.test(phoneNumber);
        if (!phoneIsValid) {
          return res.status(400).json({ message: 'Phone number must be exactly 8 digits' });
        }
      }

      // Step 5: Create and save the new user
      const newUser = new User({
        username:    username,
        password:    password,
        role:        role,
        name:        name,
        email:       email,
        phoneNumber: phoneNumber
      });

      await newUser.save();

      // Step 6: Return the saved user without the password
      const savedUser = newUser.toObject();
      delete savedUser.password;
      res.status(201).json(savedUser);

    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
}

// -------------------------------------------------------
// UPDATE USER ACCOUNT — User story #7
// -------------------------------------------------------
class updateUserAccountCon {
  static async updateUserAccount(req, res) {
    try {
      // Step 1: Get the userID from the URL
      const userID = req.params.userID;

      // Step 2: Find the user in the database
      const user = await User.findOne({ userID: userID });

      // Step 3: If user not found, return an error
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Step 4: Update each field if a new value was provided
      // Note: username and createdAt are NOT updated — they are permanent
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

      // Step 5: Validate and update phone number if provided
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

      // Step 6: Save the updated user
      await user.save();

      // Step 7: Return the updated user without the password
      const updatedUser = user.toObject();
      delete updatedUser.password;
      res.json(updatedUser);

    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
}

// -------------------------------------------------------
// SUSPEND USER ACCOUNT — User story #8
// -------------------------------------------------------
class suspendUserAccountCon {
  static async suspendUserAccount(req, res) {
    try {
      // Step 1: Get the userID from the URL
      const userID = req.params.userID;

      // Step 2: Find the user in the database
      const user = await User.findOne({ userID: userID });

      // Step 3: If user not found, return an error
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Step 4: Toggle the suspended status
      if (user.suspended === true) {
        user.suspended = false;
      } else {
        user.suspended = true;
      }

      // Step 5: Save the change
      await user.save();

      // Step 6: Send back the result
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
  viewAllUserAccountCon,
  viewUserAccountCon,
  searchUserAccountCon,
  createUserAccountCon,
  updateUserAccountCon,
  suspendUserAccountCon
};