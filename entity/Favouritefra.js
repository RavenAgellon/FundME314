const mongoose = require('mongoose');

// -------------------------------------------------------
// FAVOURITE FRA SCHEMA — links a donee to a saved FRA
// -------------------------------------------------------
const favouriteFRASchema = new mongoose.Schema({
  doneeID: { type: Number, required: true }, // the userID of the donee who saved the FRA
  fraID:   { type: Number, required: true }, // the fraID of the saved FRA
  savedAt: { type: Date, default: Date.now } // when it was saved
});

module.exports = mongoose.model('FavouriteFRA', favouriteFRASchema);