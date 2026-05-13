const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { viewAllUserProfileCon,
        viewUserProfileCon,
        searchUserProfileCon,
        createUserProfileCon,
        updateUserProfileCon,
        suspendUserProfileCon
      } = require('../controllers/userProfilesController');

router.use(protect);
router.use(authorize('user_admin'));

router.get('/view',             viewAllUserProfileCon.viewAllUserProfile);    // view all profiles
router.get('/view/:roleID',     viewUserProfileCon.viewUserProfile);          // view single profile
router.get('/search',           searchUserProfileCon.searchUserProfile);      // search profiles
router.post('/',                createUserProfileCon.createUserProfile);      // create profile
router.put('/:roleID',          updateUserProfileCon.updateUserProfile);      // update profile
router.put('/:roleID/suspend',  suspendUserProfileCon.suspendUserProfile);    // suspend profile

module.exports = router;