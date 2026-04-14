const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['haircut', 'beard', 'makeup', 'spa', 'skincare', 'hair_coloring', 'bridal', 'facial', 'massage', 'other']
  },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  duration: { type: Number, required: true }, // in minutes
  image: { type: String, default: '' },
  gender: { type: String, enum: ['male', 'female', 'unisex'], default: 'unisex' },
  homeServiceAvailable: { type: Boolean, default: true },
  homeServiceExtraCharge: { type: Number, default: 0 },
  isPopular: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  tags: [String],
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 }
}, { timestamps: true });

serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ price: 1 });

const Service = mongoose.model('Service', serviceSchema);

if (process.env.USE_MOCK_MODE === 'true') {
  const { getMockModel } = require('../utils/mockProvider');
  module.exports = getMockModel('Service', serviceSchema);
} else {
  module.exports = Service;
}
