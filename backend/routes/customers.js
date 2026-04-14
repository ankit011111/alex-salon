const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

// @route   GET /api/customers/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const totalBookings = await Booking.countDocuments({ customer: req.user._id });
    const completedBookings = await Booking.countDocuments({ customer: req.user._id, status: 'completed' });
    const totalSpent = await Booking.aggregate([
      { $match: { customer: req.user._id, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      user,
      stats: {
        totalBookings,
        completedBookings,
        totalSpent: totalSpent[0]?.total || 0,
        loyaltyPoints: user.loyaltyPoints
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
