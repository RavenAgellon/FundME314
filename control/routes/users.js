const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  viewUserAccountCon,//
  searchUserAccountCon,//
  createUserAccountCon,//
  updateUserAccountCon,//
  suspendUserAccountCon,//
} = require('../controllers/usersController');

router.get('/', viewUserAccountCon.viewUserAccount);
router.get('/search', searchUserAccountCon.searchUserAccount);
router.post('/', createUserAccountCon.createUserAccount);
router.put('/:userID', updateUserAccountCon.updateUserAccount);
router.patch('/:userID/suspend', suspendUserAccountCon.suspendUserAccount);

module.exports = router;
