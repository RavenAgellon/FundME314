const UserProfile = require('../../entity/UserProfile');
const User = require('../../entity/User');

// -------------------------------------------------------
// VIEW ALL USER PROFILES (ROLES)
// -------------------------------------------------------
async function viewUserProfile(req, res) {
  try {
    // Step 1: Get all profiles from the database, sorted by creation date
    const allProfiles = await UserProfile.find({}).sort({ createdAt: 1 });

    // Step 2: Send the list back to the browser
    res.json(allProfiles);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// -------------------------------------------------------
// SEARCH USER PROFILES (ROLES)
// -------------------------------------------------------
async function searchUserProfile(req, res) {
  try {
    // Step 1: Get the search term from the URL
    // Example URL: /api/user-profiles/search?search=admin
    const searchTerm = req.query.search;

    // Step 2: Make sure a search term was provided
    if (!searchTerm) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Step 3: Build the search condition
    // Searches across role name, role ID and description
    const searchCondition = {
      $or: [
        { roleName:    { $regex: searchTerm, $options: 'i' } },
        { roleID:      { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    // Step 4: Search the database using the condition
    const matchingProfiles = await UserProfile.find(searchCondition).sort({ createdAt: 1 });

    // Step 5: Send the results back to the browser
    res.json(matchingProfiles);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// -------------------------------------------------------
// CREATE USER PROFILE (ROLE)
// -------------------------------------------------------
async function createUserProfile(req, res) {
  try {
    // Step 1: Read the fields from the request body
    const roleName    = req.body.roleName;
    const description = req.body.description;

    // Step 2: Check that role name is not empty
    if (!roleName) {
      return res.status(400).json({ message: 'Role name is required' });
    }

    // Step 3: Check if a profile with this role name already exists
    const existingProfile = await UserProfile.findOne({ roleName: roleName });
    if (existingProfile) {
      return res.status(400).json({ message: 'A profile with this role name already exists' });
    }

    // Step 4: Create a new profile object
    const newProfile = new UserProfile({
      roleName:    roleName,
      description: description
    });

    // Step 5: Save the new profile to the database
    await newProfile.save();

    // Step 6: Send the saved profile back to the browser
    res.status(201).json(newProfile);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// -------------------------------------------------------
// UPDATE USER PROFILE (ROLE)
// -------------------------------------------------------
async function updateUserProfile(req, res) {
  try {
    // Step 1: Get the roleID from the URL
    // Example URL: /api/user-profiles/ROLE-001
    const roleID = req.params.roleID;

    // Step 2: Find the profile in the database
    const profile = await UserProfile.findOne({ roleID: roleID });

    // Step 3: If profile not found, return an error
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Step 4: Update each field if a new value was provided
    if (req.body.roleName !== undefined) {
      profile.roleName = req.body.roleName;
    }
    if (req.body.description !== undefined) {
      profile.description = req.body.description;
    }

    // Step 5: Save the updated profile to the database
    await profile.save();

    // Step 6: Send the updated profile back to the browser
    res.json(profile);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// -------------------------------------------------------
// SUSPEND USER PROFILE (ROLE)
// When a profile is suspended, ALL users with that role are also suspended
// -------------------------------------------------------
async function suspendUserProfile(req, res) {
  try {
    // Step 1: Get the roleID from the URL
    const roleID = req.params.roleID;

    // Step 2: Find the profile in the database
    const profile = await UserProfile.findOne({ roleID: roleID });

    // Step 3: If profile not found, return an error
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Step 4: Toggle the suspended status of the profile
    if (profile.suspended === true) {
      profile.suspended = false;
    } else {
      profile.suspended = true;
    }

    // Step 5: Save the profile change
    await profile.save();

    // Step 6: Apply the same suspended status to ALL users with this role
    // This is called a cascade — one action affects many records
    await User.updateMany(
      { role: profile.roleName },       // find all users with this role
      { suspended: profile.suspended }  // set their suspended status to match
    );

    // Step 7: Count how many users were affected
    const affectedCount = await User.countDocuments({ role: profile.roleName });

    // Step 8: Send the result back to the browser
    const statusMessage = profile.suspended ? 'suspended' : 'unsuspended';
    res.json({
      message: 'Profile ' + statusMessage + '. ' + affectedCount + ' user(s) affected.',
      suspended: profile.suspended,
      affectedUsers: affectedCount
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = { viewUserProfile, searchUserProfile, createUserProfile, updateUserProfile, suspendUserProfile };