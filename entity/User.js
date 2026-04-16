const mongoose = require('mongoose');

// -------------------------------------------------------
// USER SCHEMA — defines what a User looks like in the database
// -------------------------------------------------------
const userSchema = new mongoose.Schema({
  userID:      { type: String, unique: true },                  // auto-generated e.g. UA-0001
  username:    { type: String, required: true, unique: true },  // login name, never changes
  password:    { type: String, required: true },                // stored as plain text
  role:        { type: String, required: true },                // e.g. user_admin, fundraiser
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

  // Choose a 2-letter prefix based on the user's role
  const prefixMap = {
    user_admin:          'UA',
    fundraiser:          'FR',
    donee:               'DN',
    platform_management: 'PM'
  };

  // Get prefix for this role, default to 'US' if role is custom
  const prefix = prefixMap[this.role] || 'US';

  // Count how many users with this role already exist
  const existingCount = await mongoose.model('User').countDocuments({ role: this.role });

  // Generate the next number, padded to 4 digits (e.g. 1 → 0001)
  const nextNumber = existingCount + 1;
  const paddedNumber = String(nextNumber).padStart(4, '0');

  // Combine prefix and number to form the userID
  this.userID = prefix + '-' + paddedNumber;

  // Move on to the next step
  next();
});

module.exports = mongoose.model('User', userSchema);