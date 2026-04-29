const express = require('express');
const router = express.Router();
const {
  createFRA,
  suspendFRA,
  viewFRA,
  updateFRA,
  searchFRA,
  searchCompletedFRA,
  dailyReport,
  weeklyReport,
  monthlyReport
} = require('../controllers/fraController');

router.post('/', createFRA);
router.get('/search', searchFRA);
router.get('/completed', searchCompletedFRA);
router.get('/', viewFRA);
router.put('/:fraID', updateFRA);
router.patch('/:fraID/suspend', suspendFRA);
router.get('/report/daily', dailyReport);
router.get('/report/weekly', weeklyReport);
router.get('/report/monthly', monthlyReport);

module.exports = router;