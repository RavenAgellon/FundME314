const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  saveFRACon,
  removeFRACon,
  viewFavouriteFRACon,
  searchFavouriteFRACon,
  getFavouriteCountsCon,
} = require('../controllers/favouriteFRAController');

router.use(protect);

// VIEW HOW MANY TIMES EACH FRA IS SAVED
router.get('/counts', authorize('fundraiser', 'donee'), getFavouriteCountsCon.getFavouriteCounts);

// DONEE ROUTES
router.get('/view', authorize('donee'), viewFavouriteFRACon.viewFavouriteFRA);
router.get('/search', authorize('donee'), searchFavouriteFRACon.searchFavouriteFRA);
router.post('/:fraID', authorize('donee'), saveFRACon.saveFRA);
router.delete('/:fraID', authorize('donee'), removeFRACon.removeFRA);

module.exports = router;