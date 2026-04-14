const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  description: { type: String },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  minOrderValue: { type: Number, default: 0 },
  maxDiscount: { type: Number },
  usageLimit: { type: Number, default: 100 },
  usedCount: { type: Number, default: 0 },
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  applicableServices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', couponSchema);

if (process.env.USE_MOCK_MODE === 'true') {
  const { getMockModel } = require('../utils/mockProvider');
  module.exports = getMockModel('Coupon', couponSchema);
} else {
  module.exports = Coupon;
}
