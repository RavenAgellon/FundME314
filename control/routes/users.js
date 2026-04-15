const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { viewUserAccount, searchUserAccount, createUserAccount, updateUserAccount, suspendUserAccount } = require('../controllers/usersController');

router.use(protect);
router.use(authorize('user_admin'));

router.get('/view', viewUserAccount);            // #6 view all
router.get('/search', searchUserAccount);        // #9 search
router.post('/', createUserAccount);             // #5 create
router.put('/:userID', updateUserAccount);       // #7 update
router.put('/:userID/suspend', suspendUserAccount); // #8 suspend

module.exports = router;