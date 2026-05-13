const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { viewAllUserAccountCon,
        viewUserAccountCon,
        searchUserAccountCon,
        createUserAccountCon,
        updateUserAccountCon,
        suspendUserAccountCon
      } = require('../controllers/usersController');

router.use(protect);
router.use(authorize('user_admin'));

router.get('/view',              viewAllUserAccountCon.viewAllUserAccount);   // #6 view all
router.get('/view/:userID',      viewUserAccountCon.viewUserAccount);         // view single
router.get('/search',            searchUserAccountCon.searchUserAccount);     // #9 search
router.post('/',                 createUserAccountCon.createUserAccount);     // #5 create
router.put('/:userID',           updateUserAccountCon.updateUserAccount);     // #7 update
router.put('/:userID/suspend',   suspendUserAccountCon.suspendUserAccount);   // #8 suspend

module.exports = router;