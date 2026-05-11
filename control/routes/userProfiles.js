const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  viewUserProfileCon,//
  searchUserProfileCon,//
  createUserProfileCon,//
  updateUserProfileCon,//
  suspendUserProfileCon,//
} = require('../controllers/userProfilesController');

router.get('/', viewUserProfileCon.viewUserProfile);
router.get('/search', searchUserProfileCon.searchUserProfile);
router.post('/', createUserProfileCon.createUserProfile);
router.put('/:roleID', updateUserProfileCon.updateUserProfile);
router.patch('/:roleID/suspend', suspendUserProfileCon.suspendUserProfile);

module.exports = router;
