const mongoose = require('mongoose');
const Counter = require('./Counter');

// -------------------------------------------------------
// USER SCHEMA — defines what a User looks like in the database
// -------------------------------------------------------
const userSchema = new mongoose.Schema({
  userID:      { type: Number, unique: true },                  // auto-generated global sequence
  username:    { type: String, required: true, unique: true },  // login name, never changes
  password:    { type: String, required: true },                // stored as plain text
  role:        { type: String, required: true },                // e.g. user_admin, fundraiser, donee, platform_management
  name:        { type: String },                                // full name
  email:       { type: String },                                // email address
  phoneNumber: { type: String, default: '' },                   // must be 8 digits if provided
  suspended:   { type: Boolean, default: false },               // true = cannot log in
  createdAt:   { type: Date, default: Date.now }                // set automatically when created
});

// -------------------------------------------------------
// AUTO-GENERATE userID before saving a NEW user
// This only runs when creating a user, not when updating
// -------------------------------------------------------
userSchema.pre('save', async function(next) {
  // Check if this is a new user being created
  const isNewUser = this.isNew;
  if (!isNewUser) {
    // Not a new user, skip this step
    return next();
  }

  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'userID' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.userID = counter.seq;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('User', userSchema);