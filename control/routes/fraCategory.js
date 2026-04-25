const express = require('express');
const router = express.Router();
const {
  createFRACategory,
  updateFRACategory,
  viewFRACategory,
  suspendFRACategory,
  searchFRACategory
} = require('../controllers/fraCategoryController');

router.post('/', createFRACategory);
router.put('/:catName', updateFRACategory);
router.get('/search', searchFRACategory);
router.get('/:catName', viewFRACategory);
router.patch('/:catName/suspend', suspendFRACategory);

module.exports = router;