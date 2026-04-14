const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['customer', 'barber', 'admin'], default: 'customer' },
  avatar: { type: String, default: '' },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  preferences: {
    preferredServices: [String],
    preferredBarber: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notifications: { type: Boolean, default: true }
  },
  loyaltyPoints: { type: Number, default: 0 },
  isPhoneVerified: { type: Boolean, default: false },
  otp: {
    code: String,
    expiresAt: Date
  },
  isActive: { type: Boolean, default: true },
  lastLogin: Date
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

if (process.env.USE_MOCK_MODE === 'true') {
  const { getMockModel } = require('../utils/mockProvider');
  module.exports = getMockModel('User', userSchema);
} else {
  module.exports = User;
}
