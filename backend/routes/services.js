const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/services
router.get('/', async (req, res) => {
  try {
    const { category, gender, minPrice, maxPrice, sort, search, homeService, popular, limit } = req.query;
    let query = { isActive: true };

    if (category) query.category = category;
    if (gender) query.gender = { $in: [gender, 'unisex'] };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (homeService === 'true') query.homeServiceAvailable = true;
    if (popular === 'true') query.isPopular = true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_low') sortOption = { price: 1 };
    else if (sort === 'price_high') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    else if (sort === 'popular') sortOption = { totalBookings: -1 };

    const services = await Service.find(query).sort(sortOption).limit(Number(limit) || 50);
    const total = await Service.countDocuments(query);

    res.json({ services, total });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/services/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Service.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/services/:id
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ service });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/services (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json({ service });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/services/:id (Admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ service });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/services/:id (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Service.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Service deactivated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
