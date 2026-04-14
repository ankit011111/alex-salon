const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  barber: { type: mongoose.Schema.Types.ObjectId, ref: 'Barber', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true },
  photos: [{ type: String }],
  reply: {
    text: String,
    repliedAt: Date
  },
  isVerified: { type: Boolean, default: true },
  isVisible: { type: Boolean, default: true }
}, { timestamps: true });

reviewSchema.index({ barber: 1, createdAt: -1 });
reviewSchema.index({ customer: 1 });

const Review = mongoose.model('Review', reviewSchema);

if (process.env.USE_MOCK_MODE === 'true') {
  const { getMockModel } = require('../utils/mockProvider');
  module.exports = getMockModel('Review', reviewSchema);
} else {
  module.exports = Review;
}
