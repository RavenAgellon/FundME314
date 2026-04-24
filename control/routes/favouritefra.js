const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { saveFRA, removeFRA, viewFavouriteFRA, searchFavouriteFRA } = require('../controllers/favouriteFRAController');

router.use(protect);
router.use(authorize('donee'));

router.get('/view', viewFavouriteFRA);           // view all saved FRAs
router.get('/search', searchFavouriteFRA);       // search saved FRAs
router.post('/:fraID', saveFRA);                 // save an FRA to favourites
router.delete('/:fraID', removeFRA);             // remove an FRA from favourites

module.exports = router;