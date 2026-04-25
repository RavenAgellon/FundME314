const mongoose = require('mongoose');

const fraCategorySchema = new mongoose.Schema({
  catName: { type: String, required: true, unique: true, trim: true },
  fraIDs: [{ type: Number }],
  description: { type: String, default: '' },
  suspended: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FRACategory', fraCategorySchema);