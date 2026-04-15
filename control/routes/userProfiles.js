const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { viewUserProfile, searchUserProfile, createUserProfile, updateUserProfile, suspendUserProfile } = require('../controllers/userProfilesController');

router.use(protect);
router.use(authorize('user_admin'));

router.get('/view', viewUserProfile);                    // view all
router.get('/search', searchUserProfile);                // search
router.post('/', createUserProfile);                     // create
router.put('/:roleID', updateUserProfile);               // update
router.put('/:roleID/suspend', suspendUserProfile);      // suspend

module.exports = router;