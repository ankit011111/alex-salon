const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Barber = require('../models/Barber');
const Service = require('../models/Service');
const { protect } = require('../middleware/auth');

// @route   POST /api/reviews
router.post('/', protect, async (req, res) => {
  try {
    const { barberId, bookingId, serviceId, rating, comment, photos } = req.body;

    const existingReview = await Review.findOne({ booking: bookingId, customer: req.user._id });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this booking' });
    }

    const review = await Review.create({
      customer: req.user._id,
      barber: barberId,
      booking: bookingId,
      service: serviceId,
      rating,
      comment,
      photos: photos || []
    });

    // Update barber average rating
    const allReviews = await Review.find({ barber: barberId, isVisible: true });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Barber.findByIdAndUpdate(barberId, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length,
      isTopRated: avgRating >= 4.5
    });

    // Update service rating too
    if (serviceId) {
      const serviceReviews = await Review.find({ service: serviceId, isVisible: true });
      const sAvg = serviceReviews.reduce((sum, r) => sum + r.rating, 0) / serviceReviews.length;
      await Service.findByIdAndUpdate(serviceId, {
        rating: Math.round(sAvg * 10) / 10,
        totalReviews: serviceReviews.length
      });
    }

    const populatedReview = await Review.findById(review._id)
      .populate('customer', 'name avatar')
      .populate('barber')
      .populate('service', 'name');

    res.status(201).json({ review: populatedReview });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/reviews/barber/:barberId
router.get('/barber/:barberId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const reviews = await Review.find({ barber: req.params.barberId, isVisible: true })
      .populate('customer', 'name avatar')
      .populate('service', 'name')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Review.countDocuments({ barber: req.params.barberId, isVisible: true });

    res.json({ reviews, total, pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
