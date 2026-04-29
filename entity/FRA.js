const mongoose = require('mongoose');
const Counter = require('./Counter');

const fraSchema = new mongoose.Schema({
  fraID: { type: Number, unique: true },
  fraName: { type: String, required: true, unique: true, trim: true },
  category: { type: String, default: '' }, //added category field
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  description: { type: String, default: '' },
  targetAmount: { type: Number, required: true, min: 0 },
  suspended: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Auto-generate integer fraID before saving
fraSchema.pre('save', async function (next) {
  if (!this.isNew) return next();

  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'fraID' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.fraID = counter.seq;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('FRA', fraSchema);