const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { viewAllUserAccount, 
        viewUserAccount, 
        searchUserAccount, 
        createUserAccount, 
        updateUserAccount, 
        suspendUserAccount 
      } = require('../controllers/usersController');

router.use(protect);
router.use(authorize('user_admin'));

router.get('/view',          viewAllUserAccount);            // #6 view all users
router.get('/view/:userID',  viewUserAccount);               // view single user details
router.get('/search',        searchUserAccount);             // #9 search users
router.post('/',             createUserAccount);             // #5 create user
router.put('/:userID',       updateUserAccount);             // #7 update user
router.put('/:userID/suspend', suspendUserAccount);          // #8 suspend user

module.exports = router;