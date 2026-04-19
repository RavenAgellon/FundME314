const express = require('express');
const router = express.Router();
const {
  createFRA,
  suspendFRA,
  viewFRA,
  updateFRA,
  searchFRA,
  searchCompletedFRA
} = require('../controllers/fraController');

router.post('/', createFRA);
router.get('/search', searchFRA);
router.get('/completed', searchCompletedFRA);
router.get('/:fraID', viewFRA);
router.put('/:fraID', updateFRA);
router.patch('/:fraID/suspend', suspendFRA);

module.exports = router;