const mongoose = require('mongoose');

const barberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  specializations: [{ type: String }],
  experience: { type: Number, default: 0 }, // in years
  bio: { type: String, default: '' },
  portfolio: [{
    image: String,
    caption: String,
    beforeImage: String,
    afterImage: String
  }],
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  availability: {
    monday: { isAvailable: { type: Boolean, default: true }, slots: [{ start: String, end: String }] },
    tuesday: { isAvailable: { type: Boolean, default: true }, slots: [{ start: String, end: String }] },
    wednesday: { isAvailable: { type: Boolean, default: true }, slots: [{ start: String, end: String }] },
    thursday: { isAvailable: { type: Boolean, default: true }, slots: [{ start: String, end: String }] },
    friday: { isAvailable: { type: Boolean, default: true }, slots: [{ start: String, end: String }] },
    saturday: { isAvailable: { type: Boolean, default: true }, slots: [{ start: String, end: String }] },
    sunday: { isAvailable: { type: Boolean, default: false }, slots: [{ start: String, end: String }] }
  },
  blockedSlots: [{
    date: Date,
    startTime: String,
    endTime: String,
    reason: String
  }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  completedJobs: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  commissionRate: { type: Number, default: 30 }, // percentage
  homeServiceAvailable: { type: Boolean, default: true },
  maxHomeDistance: { type: Number, default: 15 }, // km
  isOnline: { type: Boolean, default: false },
  isTopRated: { type: Boolean, default: false },
  currentLocation: {
    lat: Number,
    lng: Number,
    updatedAt: Date
  },
  salon: { type: String, default: 'Alex Salon Main Branch' }
}, { timestamps: true });

barberSchema.index({ rating: -1 });


const Barber = mongoose.model('Barber', barberSchema);

if (process.env.USE_MOCK_MODE === 'true') {
  const { getMockModel } = require('../utils/mockProvider');
  module.exports = getMockModel('Barber', barberSchema);
} else {
  module.exports = Barber;
}
