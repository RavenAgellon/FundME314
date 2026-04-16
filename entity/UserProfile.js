const mongoose = require('mongoose');

// -------------------------------------------------------
// USER PROFILE SCHEMA — defines what a Role looks like in the database
// A UserProfile represents a role type (e.g. fundraiser, donee)
// -------------------------------------------------------
const userProfileSchema = new mongoose.Schema({
  roleID:      { type: String, unique: true },       // auto-generated e.g. ROLE-001
  roleName:    { type: String, required: true, unique: true }, // name of the role
  description: { type: String, default: '' },        // what this role can do
  suspended:   { type: Boolean, default: false },    // true = all users with this role are suspended
  createdAt:   { type: Date, default: Date.now }     // set automatically when created
});

// -------------------------------------------------------
// AUTO-GENERATE roleID before saving a NEW profile
// This only runs when creating a profile, not when updating
// -------------------------------------------------------
userProfileSchema.pre('save', async function(next) {
  // Check if this is a new profile being created
  const isNewProfile = this.isNew;
  if (!isNewProfile) {
    // Not a new profile, skip this step
    return next();
  }

  // Count how many profiles already exist
  const existingCount = await mongoose.model('UserProfile').countDocuments();

  // Generate the next number, padded to 3 digits (e.g. 1 → 001)
  const nextNumber = existingCount + 1;
  const paddedNumber = String(nextNumber).padStart(3, '0');

  // Combine prefix and number to form the roleID
  this.roleID = 'ROLE-' + paddedNumber;

  // Move on to the next step
  next();
});

module.exports = mongoose.model('UserProfile', userProfileSchema);