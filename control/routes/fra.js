const express = require('express');
const router = express.Router();

const {
  createFRACon,//
  suspendFRACon,//
  FRViewFRACon,//
  DoneeViewFRACon,//
  incrementViewCon,//not a user story, but needed for view count
  ViewAllCompletedFRACon,//Not part of userstory, used for dashboard
  ViewAllFRACon,//Not part of userstory, used for dashboard
  checkViewCon,//
  updateFRACon,//
  FRSearchFRACon,//
  DoneeSearchFRACon,//
  FRSearchCompletedFRACon,//
  DoneeSearchCompletedFRACon,//
  FRViewCompletedFRACon,//
  DoneeViewCompletedFRACon,//
  dailyReportCon,//
  weeklyReportCon,//
  monthlyReportCon//
} = require('../controllers/fraController');

router.post('/', createFRACon.createFRA);
router.patch('/:fraID/suspend', suspendFRACon.suspendFRA);
router.get('/fundraiser/view', FRViewFRACon.viewFRA);
router.get('/donee/view', DoneeViewFRACon.viewFRA);
router.patch('/:fraID/view', incrementViewCon.incrementView);
router.get('/:fraID/views', checkViewCon.checkView);
router.put('/:fraID', updateFRACon.updateFRA);
router.get('/fundraiser/search', FRSearchFRACon.searchFRA);
router.get('/donee/search', DoneeSearchFRACon.searchFRA);
router.get('/fundraiser/completed', FRSearchCompletedFRACon.searchCompletedFRA);
router.get('/donee/completed', DoneeSearchCompletedFRACon.searchCompletedFRA);
router.get('/donee/completed/view', DoneeViewCompletedFRACon.ViewCompletedFRA);
router.get('/fundraiser/completed/view', FRViewCompletedFRACon.ViewCompletedFRA);
router.get('/report/daily', dailyReportCon.dailyReport);
router.get('/report/weekly', weeklyReportCon.weeklyReport);
router.get('/report/monthly', monthlyReportCon.monthlyReport);
router.get('/fundraiser/all', ViewAllFRACon.viewAllFRA);
router.get('/donee/all', ViewAllFRACon.viewAllFRA);

module.exports = router;