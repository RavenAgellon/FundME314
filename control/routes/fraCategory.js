const express = require('express');
const router = express.Router();
const {
  createFRACategory,
  updateFRACategory,
  viewFRACategory,
  suspendFRACategory,
  unsuspendFRACategory,
  searchFRACategory
} = require('../controllers/fraCategoryController');

router.post('/', createFRACategory);
router.put('/:catName', updateFRACategory);
router.get('/search', searchFRACategory);
router.get('/:catName', viewFRACategory);
router.patch('/:catName/suspend', suspendFRACategory);
router.patch('/:catName/unsuspend', unsuspendFRACategory); // Added route for unsuspending a category

module.exports = router;