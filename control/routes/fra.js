const express = require('express');
const router = express.Router();
const {
  createFRA,
  suspendFRA,
  unsuspendFRA,
  viewFRA,
  incrementView,
  updateFRA,
  searchFRA,
  searchCompletedFRA,
  dailyReport,
  weeklyReport,
  monthlyReport,
  checkView
} = require('../controllers/fraController');

router.get('/', viewFRA);
router.post('/', createFRA);
router.get('/search', searchFRA);
router.get('/completed', searchCompletedFRA);
router.patch('/:fraID/view', incrementView);
router.get('/view/:fraID', checkView);
router.put('/:fraID', updateFRA);
router.patch('/:fraID/suspend', suspendFRA);
router.patch('/:fraID/unsuspend', unsuspendFRA);
router.get('/report/daily', dailyReport);
router.get('/report/weekly', weeklyReport);
router.get('/report/monthly', monthlyReport);

module.exports = router;