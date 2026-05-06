const express = require('express');
const router = express.Router();

const {
  createFRACon,
  suspendFRACon,
  viewFRACon,
  incrementViewCon,
  checkViewCon,
  updateFRACon,
  searchFRACon,
  searchCompletedFRACon,
  dailyReportCon,
  weeklyReportCon,
  monthlyReportCon
} = require('../controllers/fraController');

router.post('/', createFRACon.createFRA);
router.patch('/:fraID/suspend', suspendFRACon.suspendFRA);
router.get('/', viewFRACon.viewFRA);
router.patch('/:fraID/view', incrementViewCon.incrementView);
router.get('/:fraID/views', checkViewCon.checkView);
router.put('/:fraID', updateFRACon.updateFRA);
router.get('/search/name', searchFRACon.searchFRA);
router.get('/search/completed', searchCompletedFRACon.searchCompletedFRA);
router.get('/report/daily', dailyReportCon.dailyReport);
router.get('/report/weekly', weeklyReportCon.weeklyReport);
router.get('/report/monthly', monthlyReportCon.monthlyReport);

module.exports = router;