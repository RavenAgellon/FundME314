const UserProfile = require('../../entity/UserProfile');
const User = require('../../entity/User');

class viewUserProfileCon {
  static async viewUserProfile(req, res) {
    try {
      const allProfiles = await UserProfile.find({}).sort({ createdAt: 1 });
      res.json(allProfiles);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
}

class searchUserProfileCon {
  static async searchUserProfile(req, res) {
    try {
      const searchTerm = req.query.search;

      if (!searchTerm) {
        return res.status(400).json({ message: 'Search query is required' });
      }

      const searchCondition = {
        $or: [
          { roleName: { $regex: searchTerm, $options: 'i' } },
          { roleID: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } }
        ]
      };

      const matchingProfiles = await UserProfile.find(searchCondition).sort({ createdAt: 1 });
      res.json(matchingProfiles);

    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
}

class createUserProfileCon {
  static async createUserProfile(req, res) {
    try {
      const roleName = req.body.roleName;
      const description = req.body.description;

      if (!roleName) {
        return res.status(400).json({ message: 'Role name is required' });
      }

      const existingProfile = await UserProfile.findOne({ roleName: roleName });
      if (existingProfile) {
        return res.status(400).json({ message: 'A profile with this role name already exists' });
      }

      const newProfile = new UserProfile({
        roleName: roleName,
        description: description
      });

      await newProfile.save();

      res.status(201).json(newProfile);

    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
}

class updateUserProfileCon {
  static async updateUserProfile(req, res) {
    try {
      const roleID = req.params.roleID;

      const profile = await UserProfile.findOne({ roleID: roleID });

      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      if (req.body.roleName !== undefined) {
        profile.roleName = req.body.roleName;
      }
      if (req.body.description !== undefined) {
        profile.description = req.body.description;
      }

      await profile.save();

      res.json(profile);

    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
}

class suspendUserProfileCon {
  static async suspendUserProfile(req, res) {
    try {
      const roleID = req.params.roleID;

      const profile = await UserProfile.findOne({ roleID: roleID });

      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      if (profile.suspended === true) {
        profile.suspended = false;
      } else {
        profile.suspended = true;
      }

      await profile.save();

      await User.updateMany(
        { role: profile.roleName },
        { suspended: profile.suspended }
      );

      const affectedCount = await User.countDocuments({ role: profile.roleName });

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
}

module.exports = {
  viewUserProfileCon,
  searchUserProfileCon,
  createUserProfileCon,
  updateUserProfileCon,
  suspendUserProfileCon
};