const express = require('express');
const router = express.Router();
const Barber = require('../models/Barber');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/barbers
router.get('/', async (req, res) => {
  try {
    const { specialization, rating, homeService, search, sort } = req.query;
    let query = {};

    if (specialization) query.specializations = specialization;
    if (rating) query.rating = { $gte: Number(rating) };
    if (homeService === 'true') query.homeServiceAvailable = true;

    let sortOption = { rating: -1 };
    if (sort === 'experience') sortOption = { experience: -1 };
    else if (sort === 'jobs') sortOption = { completedJobs: -1 };

    let barbers = await Barber.find(query)
      .populate('user', 'name email phone avatar')
      .populate('services', 'name price category duration')
      .sort(sortOption);

    if (search) {
      barbers = barbers.filter(b =>
        b.user.name.toLowerCase().includes(search.toLowerCase()) ||
        b.specializations.some(s => s.toLowerCase().includes(search.toLowerCase()))
      );
    }

    res.json({ barbers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/barbers/:id
router.get('/:id', async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id)
      .populate('user', 'name email phone avatar')
      .populate('services', 'name price category duration image');
    if (!barber) return res.status(404).json({ message: 'Barber not found' });
    res.json({ barber });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/barbers/:id/slots
router.get('/:id/slots', async (req, res) => {
  try {
    const { date } = req.query;
    const barber = await Barber.findById(req.params.id);
    if (!barber) return res.status(404).json({ message: 'Barber not found' });

    const requestedDate = new Date(date);
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[requestedDate.getDay()];
    const dayAvailability = barber.availability[dayName];

    if (!dayAvailability || !dayAvailability.isAvailable) {
      return res.json({ slots: [], message: 'Barber is not available on this day' });
    }

    // Get existing bookings for this date
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await Booking.find({
      barber: barber._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed', 'in_progress'] }
    });

    const bookedSlots = existingBookings.map(b => ({
      start: b.timeSlot.start,
      end: b.timeSlot.end
    }));

    // Generate available time slots (30-min intervals)
    const availableSlots = [];
    for (const slot of dayAvailability.slots) {
      let [startHour, startMin] = slot.start.split(':').map(Number);
      const [endHour, endMin] = slot.end.split(':').map(Number);
      const endMinutes = endHour * 60 + endMin;

      while (startHour * 60 + startMin + 30 <= endMinutes) {
        const slotStart = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
        const nextMin = startMin + 30;
        const nextHour = startHour + Math.floor(nextMin / 60);
        const slotEnd = `${String(nextHour).padStart(2, '0')}:${String(nextMin % 60).padStart(2, '0')}`;

        const isBooked = bookedSlots.some(bs => {
          return (slotStart >= bs.start && slotStart < bs.end) || (slotEnd > bs.start && slotEnd <= bs.end);
        });

        const isBlocked = barber.blockedSlots.some(bs => {
          const bDate = new Date(bs.date);
          return bDate.toDateString() === requestedDate.toDateString() &&
            ((slotStart >= bs.startTime && slotStart < bs.endTime) || (slotEnd > bs.startTime && slotEnd <= bs.endTime));
        });

        availableSlots.push({
          start: slotStart,
          end: slotEnd,
          isAvailable: !isBooked && !isBlocked
        });

        startMin += 30;
        if (startMin >= 60) {
          startHour += 1;
          startMin -= 60;
        }
      }
    }

    res.json({ slots: availableSlots, date: requestedDate });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/barbers/profile (Barber updates own profile)
router.put('/profile', protect, authorize('barber'), async (req, res) => {
  try {
    const barber = await Barber.findOneAndUpdate(
      { user: req.user._id },
      req.body,
      { new: true }
    ).populate('user', 'name email phone avatar').populate('services');
    res.json({ barber });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/barbers/availability
router.put('/availability', protect, authorize('barber'), async (req, res) => {
  try {
    const barber = await Barber.findOneAndUpdate(
      { user: req.user._id },
      { availability: req.body.availability },
      { new: true }
    );
    res.json({ barber });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/barbers/toggle-online
router.put('/toggle-online', protect, authorize('barber'), async (req, res) => {
  try {
    const barber = await Barber.findOne({ user: req.user._id });
    barber.isOnline = !barber.isOnline;
    await barber.save();
    res.json({ isOnline: barber.isOnline });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
