const User = require('../../entity/User');

// -------------------------------------------------------
// VIEW ALL USER ACCOUNTS — User story #6
// -------------------------------------------------------
async function viewUserAccount(req, res) {
  try {
    // Step 1: Get all users from the database
    const allUsers = await User.find({});

    // Step 2: Remove the password field from each user for security
    const usersWithoutPassword = await User.find({}).select('-password');

    // Step 3: Sort by newest first
    const sortedUsers = await User.find({}).select('-password').sort({ createdAt: -1 });

    // Step 4: Send the list back to the browser
    res.json(sortedUsers);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// -------------------------------------------------------
// SEARCH USER ACCOUNTS — User story #9
// -------------------------------------------------------
async function searchUserAccount(req, res) {
  try {
    // Step 1: Get the search term from the URL
    // Example URL: /api/users/search?search=john
    const searchTerm = req.query.search;

    // Step 2: Make sure a search term was provided
    if (!searchTerm) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Step 3: Build the search condition
    // $or means match ANY of these fields
    // $regex means search for the term anywhere in the text
    // $options: 'i' means case insensitive (john = John = JOHN)
    const orConditions = [
      { username: { $regex: searchTerm, $options: 'i' } },
      { name:     { $regex: searchTerm, $options: 'i' } },
      { role:     { $regex: searchTerm, $options: 'i' } },
      { email:    { $regex: searchTerm, $options: 'i' } }
    ];

    const numericID = Number(searchTerm);
    if (!isNaN(numericID)) {
      orConditions.push({ userID: numericID });
    }

    const searchCondition = { $or: orConditions };

    // Step 4: Search the database using the condition
    const matchingUsers = await User.find(searchCondition).select('-password').sort({ createdAt: -1 });

    // Step 5: Send the results back to the browser
    res.json(matchingUsers);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// -------------------------------------------------------
// CREATE USER ACCOUNT — User story #5
// -------------------------------------------------------
async function createUserAccount(req, res) {
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

    // Step 4: Validate phone number if one was provided
    // It must be exactly 8 digits (e.g. 91234567)
    if (phoneNumber && phoneNumber !== '') {
      const phonePattern = /^\d{8}$/;
      const phoneIsValid = phonePattern.test(phoneNumber);
      if (!phoneIsValid) {
        return res.status(400).json({ message: 'Phone number must be exactly 8 digits' });
      }
    }

    // Step 5: Create a new user object
    const newUser = new User({
      username:    username,
      password:    password,   // will be hashed automatically by entity/User.js
      role:        role,
      name:        name,
      email:       email,
      phoneNumber: phoneNumber
    });

    // Step 6: Save the new user to the database
    await newUser.save();

    // Step 7: Return the saved user without the password
    const savedUser = newUser.toObject();
    delete savedUser.password;
    res.status(201).json(savedUser);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// -------------------------------------------------------
// UPDATE USER ACCOUNT — User story #7
// -------------------------------------------------------
async function updateUserAccount(req, res) {
  try {
    // Step 1: Get the userID from the URL
    // Example URL: /api/users/UA-0001
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
      user.password = req.body.password;  // will be hashed automatically by entity/User.js
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
      // If empty string was sent, clear the phone number
      user.phoneNumber = '';
    }

    // Step 6: Save the updated user to the database
    await user.save();

    // Step 7: Return the updated user without the password
    const updatedUser = user.toObject();
    delete updatedUser.password;
    res.json(updatedUser);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// -------------------------------------------------------
// SUSPEND USER ACCOUNT — User story #8
// -------------------------------------------------------
async function suspendUserAccount(req, res) {
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
    // If currently suspended → unsuspend
    // If currently active → suspend
    if (user.suspended === true) {
      user.suspended = false;
    } else {
      user.suspended = true;
    }

    // Step 5: Save the change to the database
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

module.exports = { viewUserAccount, searchUserAccount, createUserAccount, updateUserAccount, suspendUserAccount };