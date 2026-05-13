const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { viewAllUserProfile,
        viewUserProfile,
        searchUserProfile,
        createUserProfile,
        updateUserProfile,
        suspendUserProfile
      } = require('../controllers/userProfilesController');

router.use(protect);
router.use(authorize('user_admin'));

router.get('/view',             viewAllUserProfile);          // view all profiles
router.get('/view/:roleID',     viewUserProfile);             // view single profile details
router.get('/search',           searchUserProfile);           // search profiles
router.post('/',                createUserProfile);           // create profile
router.put('/:roleID',          updateUserProfile);           // update profile
router.put('/:roleID/suspend',  suspendUserProfile);          // suspend profile

module.exports = router;