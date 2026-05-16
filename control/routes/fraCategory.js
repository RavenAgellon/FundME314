const express = require('express');
const router = express.Router();
const {
  createFRACategoryCon,//
  updateFRACategoryCon,//
  viewAllFRACategoryCon,//
  viewFRACategoryCon,//
  suspendFRACategoryCon,//
  searchFRACategoryCon//
} = require('../controllers/fraCategoryController');

router.post('/', createFRACategoryCon.createFRACategory);
router.put('/:catName', updateFRACategoryCon.updateFRACategory);
router.get('/search', searchFRACategoryCon.searchFRACategory);
router.get('/', viewAllFRACategoryCon.viewAllFRACategory);
router.get('/:catName', viewFRACategoryCon.viewFRACategory);
router.patch('/:catName/suspend', suspendFRACategoryCon.suspendFRACategory);

module.exports = router;