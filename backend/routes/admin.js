const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const Barber = require('../models/Barber');
const Service = require('../models/Service');
const Review = require('../models/Review');
const Coupon = require('../models/Coupon');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect, authorize('admin'));

// @route   GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    // Totals
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalBarbers = await User.countDocuments({ role: 'barber' });
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: { $in: ['pending', 'confirmed', 'in_progress'] } });

    // Revenue
    const totalRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, commission: { $sum: '$platformCommission' } } }
    ]);

    const todayRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid', date: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const weekRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid', date: { $gte: weekAgo } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const monthRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid', date: { $gte: monthAgo } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Today's bookings
    const todayBookings = await Booking.countDocuments({ date: { $gte: today } });

    // Booking by status
    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Conversion rate (completed / total)
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const conversionRate = totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(1) : 0;

    // Cancellation rate
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    const cancellationRate = totalBookings > 0 ? ((cancelledBookings / totalBookings) * 100).toFixed(1) : 0;

    // Home vs Salon ratio
    const homeBookings = await Booking.countDocuments({ serviceType: 'home' });
    const salonBookings = await Booking.countDocuments({ serviceType: 'salon' });

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate('customer', 'name email phone')
      .populate({ path: 'barber', populate: { path: 'user', select: 'name' } })
      .populate('services.service', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      overview: {
        totalUsers,
        totalBarbers,
        totalBookings,
        activeBookings,
        todayBookings,
        completedBookings,
        conversionRate: Number(conversionRate),
        cancellationRate: Number(cancellationRate)
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        commission: totalRevenue[0]?.commission || 0,
        today: todayRevenue[0]?.total || 0,
        thisWeek: weekRevenue[0]?.total || 0,
        thisMonth: monthRevenue[0]?.total || 0
      },
      bookingsByStatus,
      serviceTypeSplit: { home: homeBookings, salon: salonBookings },
      recentBookings
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
  try {
    // Top services
    const topServices = await Booking.aggregate([
      { $unwind: '$services' },
      { $group: { _id: '$services.service', count: { $sum: 1 }, revenue: { $sum: '$services.price' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'services', localField: '_id', foreignField: '_id', as: 'serviceInfo' } },
      { $unwind: '$serviceInfo' },
      { $project: { name: '$serviceInfo.name', category: '$serviceInfo.category', count: 1, revenue: 1 } }
    ]);

    // Top barbers by revenue
    const topBarbers = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$barber', totalRevenue: { $sum: '$totalAmount' }, bookings: { $sum: 1 } } },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'barbers', localField: '_id', foreignField: '_id', as: 'barberInfo' } },
      { $unwind: '$barberInfo' },
      { $lookup: { from: 'users', localField: 'barberInfo.user', foreignField: '_id', as: 'userInfo' } },
      { $unwind: '$userInfo' },
      { $project: { name: '$userInfo.name', totalRevenue: 1, bookings: 1, rating: '$barberInfo.rating' } }
    ]);

    // Peak hours
    const peakHours = await Booking.aggregate([
      { $project: { hour: { $substr: ['$timeSlot.start', 0, 2] } } },
      { $group: { _id: '$hour', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Revenue trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenueTrend = await Booking.aggregate([
      { $match: { paymentStatus: 'paid', date: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // New vs returning customers
    const customerBookingCounts = await Booking.aggregate([
      { $group: { _id: '$customer', count: { $sum: 1 } } }
    ]);
    const newCustomers = customerBookingCounts.filter(c => c.count === 1).length;
    const returningCustomers = customerBookingCounts.filter(c => c.count > 1).length;

    res.json({
      topServices,
      topBarbers,
      peakHours,
      revenueTrend,
      customerInsights: { newCustomers, returningCustomers }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/barbers
router.get('/barbers', async (req, res) => {
  try {
    const barbers = await Barber.find()
      .populate('user', 'name email phone avatar isActive')
      .populate('services', 'name price')
      .sort({ rating: -1 });

    const barberStats = await Promise.all(barbers.map(async (barber) => {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);

      const monthlyBookings = await Booking.countDocuments({
        barber: barber._id,
        date: { $gte: monthAgo }
      });

      const monthlyRevenue = await Booking.aggregate([
        { $match: { barber: barber._id, date: { $gte: monthAgo }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$barberEarning' } } }
      ]);

      return {
        ...barber.toObject(),
        monthlyBookings,
        monthlyRevenue: monthlyRevenue[0]?.total || 0
      };
    }));

    res.json({ barbers: barberStats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/customers
router.get('/customers', async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 });
    res.json({ customers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/bookings
router.get('/bookings', async (req, res) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    let query = {};

    if (status) query.status = status;
    if (date) {
      const d = new Date(date);
      query.date = { $gte: new Date(d.setHours(0, 0, 0, 0)), $lte: new Date(d.setHours(23, 59, 59, 999)) };
    }

    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone')
      .populate({ path: 'barber', populate: { path: 'user', select: 'name avatar' } })
      .populate('services.service', 'name price')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Booking.countDocuments(query);

    res.json({ bookings, total, pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/coupons
router.post('/coupons', async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ coupon });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/coupons
router.get('/coupons', async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ coupons });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/services
router.post('/services', async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json({ service });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/services/:id
router.put('/services/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ service });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/admin/services/:id
router.delete('/services/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/barbers
router.post('/barbers', async (req, res) => {
  try {
    const { name, email, phone, password, specializations, experience, bio, salon } = req.body;
    
    // Create the User first
    const user = await User.create({ name, email, phone, password, role: 'barber' });
    
    // Create the Barber profile
    const barber = await Barber.create({
      user: user._id,
      specializations,
      experience,
      bio,
      salon,
      availability: {
        monday: { isAvailable: true, slots: [{ start: '09:00', end: '19:00' }] },
        tuesday: { isAvailable: true, slots: [{ start: '09:00', end: '19:00' }] },
        wednesday: { isAvailable: true, slots: [{ start: '09:00', end: '19:00' }] },
        thursday: { isAvailable: true, slots: [{ start: '09:00', end: '19:00' }] },
        friday: { isAvailable: true, slots: [{ start: '09:00', end: '19:00' }] },
        saturday: { isAvailable: true, slots: [{ start: '09:00', end: '19:00' }] },
        sunday: { isAvailable: false, slots: [] }
      }
    });

    res.status(201).json({ barber });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/barbers/:id
router.put('/barbers/:id', async (req, res) => {
  try {
    const barber = await Barber.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!barber) return res.status(404).json({ message: 'Barber not found' });
    res.json({ barber });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/admin/barbers/:id
router.delete('/barbers/:id', async (req, res) => {
  try {
    const barber = await Barber.findByIdAndDelete(req.params.id);
    if (!barber) return res.status(404).json({ message: 'Barber not found' });
    // Also deactivate the user
    await User.findByIdAndUpdate(barber.user, { isActive: false });
    res.json({ message: 'Barber deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
