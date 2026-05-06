const express = require('express');
const router = express.Router();
const {
  createFRACategoryCon,
  updateFRACategoryCon,
  viewFRACategoryCon,
  suspendFRACategoryCon,
  searchFRACategoryCon
} = require('../controllers/fraCategoryController');

router.post('/', createFRACategoryCon.createFRACategory);
router.put('/:catName', updateFRACategoryCon.updateFRACategory);
router.get('/search', searchFRACategoryCon.searchFRACategory);
router.get('/:catName', viewFRACategoryCon.viewFRACategory);
router.patch('/:catName/suspend', suspendFRACategoryCon.suspendFRACategory);

module.exports = router;