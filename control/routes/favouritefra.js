const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  saveFRA,
  removeFRA,
  viewFavouriteFRA,
  searchFavouriteFRA,
  getFavouriteCounts,
} = require('../controllers/favouriteFRAController');

router.use(protect);

// -------------------------------------------------------
// VIEW HOW MANY TIMES EACH FRA IS SAVED
// Allow BOTH fundraiser and donee (safe + avoids auth bugs)
// -------------------------------------------------------
router.get('/counts', authorize('fundraiser', 'donee'), getFavouriteCounts);

// -------------------------------------------------------
// DONEE ROUTES
// -------------------------------------------------------
router.get('/view', authorize('donee'), viewFavouriteFRA);     // view all saved FRAs
router.get('/search', authorize('donee'), searchFavouriteFRA); // search saved FRAs
router.post('/:fraID', authorize('donee'), saveFRA);           // save an FRA
router.delete('/:fraID', authorize('donee'), removeFRA);       // remove FRA

module.exports = router;