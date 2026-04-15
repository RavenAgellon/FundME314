const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  roleID: { type: String, unique: true },
  roleName: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  suspended: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Auto-generate roleID before saving
userProfileSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  const count = await mongoose.model('UserProfile').countDocuments();
  this.roleID = `ROLE-${String(count + 1).padStart(3, '0')}`;
  next();
});

module.exports = mongoose.model('UserProfile', userProfileSchema);