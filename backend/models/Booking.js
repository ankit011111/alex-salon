const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  barber: { type: mongoose.Schema.Types.ObjectId, ref: 'Barber', required: true },
  services: [{
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true }
  }],
  date: { type: Date, required: true },
  timeSlot: {
    start: { type: String, required: true },
    end: { type: String, required: true }
  },
  totalDuration: { type: Number, required: true }, // minutes
  serviceType: { type: String, enum: ['salon', 'home'], default: 'salon' },
  homeAddress: {
    street: String,
    city: String,
    pincode: String,
    coordinates: { lat: Number, lng: Number }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  subtotal: { type: Number, required: true },
  homeServiceCharge: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  couponCode: { type: String },
  totalAmount: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: { type: String, enum: ['cash', 'online', 'upi'], default: 'cash' },
  notes: { type: String },
  cancelReason: { type: String },
  cancelledBy: { type: String, enum: ['customer', 'barber', 'admin'] },
  barberEarning: { type: Number, default: 0 },
  platformCommission: { type: Number, default: 0 },
  loyaltyPointsEarned: { type: Number, default: 0 },
  loyaltyPointsUsed: { type: Number, default: 0 },
  reminderSent: { type: Boolean, default: false }
}, { timestamps: true });

bookingSchema.index({ customer: 1, date: -1 });
bookingSchema.index({ barber: 1, date: 1, status: 1 });
bookingSchema.index({ status: 1, date: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

if (process.env.USE_MOCK_MODE === 'true') {
  const { getMockModel } = require('../utils/mockProvider');
  module.exports = getMockModel('Booking', bookingSchema);
} else {
  module.exports = Booking;
}
