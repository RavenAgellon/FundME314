const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userID: { type: String, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  name: String,
  email: String,
  phoneNumber: { type: String, default: '' },
  suspended: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Auto-generate userID before saving (only on creation)
userSchema.pre('save', async function (next) {
  if (!this.isNew) return next();

  const prefixMap = {
    user_admin: 'UA',
    fundraiser: 'FR',
    donee: 'DN',
    platform_management: 'PM'
  };

  const prefix = prefixMap[this.role] || 'US';
  const count = await mongoose.model('User').countDocuments({ role: this.role });
  const padded = String(count + 1).padStart(4, '0');
  this.userID = `${prefix}-${padded}`;

  next();
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password at login
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);