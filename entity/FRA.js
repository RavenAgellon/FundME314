const mongoose = require('mongoose');

const fraSchema = new mongoose.Schema({
  fraName: { type: String, required: true, unique: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  targetAmount: { type: Number, required: true, min: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FRA', fraSchema);