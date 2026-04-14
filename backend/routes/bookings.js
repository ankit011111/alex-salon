const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Barber = require('../models/Barber');
const Service = require('../models/Service');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/bookings
router.post('/', protect, async (req, res) => {
  try {
    const { barberId, serviceIds, date, timeSlot, serviceType, homeAddress, couponCode, notes, loyaltyPointsUsed } = req.body;

    const barber = await Barber.findById(barberId);
    if (!barber) return res.status(404).json({ message: 'Barber not found' });

    if (serviceType === 'home') {
      if (!homeAddress || !homeAddress.street || !homeAddress.city || !homeAddress.pincode) {
        return res.status(400).json({ message: 'Valid address (street, city, pincode) is required for home services.' });
      }
    }

    // Calculate totals
    const services = await Service.find({ _id: { $in: serviceIds } });
    const bookingServices = services.map(s => ({
      service: s._id,
      price: s.discountPrice || s.price,
      duration: s.duration
    }));

    const subtotal = bookingServices.reduce((sum, s) => sum + s.price, 0);
    const totalDuration = bookingServices.reduce((sum, s) => sum + s.duration, 0);
    const homeServiceCharge = serviceType === 'home' ? services.reduce((sum, s) => sum + (s.homeServiceExtraCharge || 0), 0) + 100 : 0;

    // Calculate end time
    const [startHour, startMin] = timeSlot.start.split(':').map(Number);
    const totalMins = startHour * 60 + startMin + totalDuration;
    const endTime = `${String(Math.floor(totalMins / 60)).padStart(2, '0')}:${String(totalMins % 60).padStart(2, '0')}`;

    let discount = 0;
    let loyaltyDiscount = 0;
    if (loyaltyPointsUsed && loyaltyPointsUsed > 0) {
      loyaltyDiscount = Math.min(loyaltyPointsUsed, subtotal * 0.1); // Max 10% off via points
      discount += loyaltyDiscount;
    }

    const totalAmount = subtotal + homeServiceCharge - discount;
    const platformCommission = totalAmount * (barber.commissionRate / 100);
    const barberEarning = totalAmount - platformCommission;
    const loyaltyPointsEarned = Math.floor(totalAmount / 10); // 1 point per ₹10

    const booking = await Booking.create({
      customer: req.user._id,
      barber: barber._id,
      services: bookingServices,
      date: new Date(date),
      timeSlot: { start: timeSlot.start, end: endTime },
      totalDuration,
      serviceType: serviceType || 'salon',
      homeAddress: serviceType === 'home' ? homeAddress : undefined,
      subtotal,
      homeServiceCharge,
      discount,
      couponCode,
      totalAmount,
      paymentStatus: 'pending',
      notes,
      barberEarning,
      platformCommission,
      loyaltyPointsEarned,
      loyaltyPointsUsed: loyaltyPointsUsed || 0
    });

    // Update service booking counts
    await Service.updateMany({ _id: { $in: serviceIds } }, { $inc: { totalBookings: 1 } });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('customer', 'name email phone')
      .populate('barber')
      .populate('services.service', 'name price category');

    res.status(201).json({ booking: populatedBooking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/bookings/my-bookings
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const { status, upcoming } = req.query;
    let query = { customer: req.user._id };

    if (status) query.status = status;
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
      query.status = { $in: ['pending', 'confirmed'] };
    }

    const bookings = await Booking.find(query)
      .populate({ path: 'barber', populate: { path: 'user', select: 'name avatar phone' } })
      .populate('services.service', 'name price category image')
      .sort({ date: -1 });

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/bookings/barber-bookings
router.get('/barber-bookings', protect, authorize('barber'), async (req, res) => {
  try {
    const barber = await Barber.findOne({ user: req.user._id });
    const { status, date } = req.query;
    let query = { barber: barber._id };

    if (status) query.status = status;
    if (date) {
      const d = new Date(date);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      query.date = { $gte: start, $lte: end };
    }

    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone avatar')
      .populate('services.service', 'name price category')
      .sort({ date: 1, 'timeSlot.start': 1 });

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/bookings/:id/status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, cancelReason } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = status;

    if (status === 'cancelled') {
      booking.cancelReason = cancelReason;
      booking.cancelledBy = req.user.role;
    }

    if (status === 'completed') {
      booking.paymentStatus = 'paid';
      // Update barber stats
      const barber = await Barber.findById(booking.barber);
      barber.completedJobs += 1;
      barber.totalEarnings += booking.barberEarning;
      await barber.save();

      // Award loyalty points
      await User.findByIdAndUpdate(booking.customer, {
        $inc: { loyaltyPoints: booking.loyaltyPointsEarned }
      });
    }

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('customer', 'name email phone')
      .populate({ path: 'barber', populate: { path: 'user', select: 'name avatar phone' } })
      .populate('services.service', 'name price category');

    res.json({ booking: updatedBooking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/bookings/:id/reschedule
router.put('/:id/reschedule', protect, async (req, res) => {
  try {
    const { date, timeSlot } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { date: new Date(date), timeSlot, status: 'pending' },
      { new: true }
    ).populate('customer', 'name email phone')
      .populate({ path: 'barber', populate: { path: 'user', select: 'name avatar phone' } })
      .populate('services.service', 'name price category');

    res.json({ booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
