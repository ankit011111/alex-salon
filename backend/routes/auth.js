const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Barber = require('../models/Barber');
const { protect } = require('../middleware/auth');

const { generateOTP, sendSMS } = require('../utils/otpService');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Role safety: only allow customer registration via public API unless admin creates it
    const assignedRole = role === 'barber' ? 'barber' : 'customer';

    const user = await User.create({ name, email, phone, password, role: assignedRole });

    // Generate and send OTP for verification
    const otpCode = generateOTP();
    user.otp = {
      code: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    };
    await user.save();

    await sendSMS(user.phone, `Your Alex Salon verification code is: ${otpCode}`);

    res.status(201).json({
      message: 'User created successfully. Please verify your phone number.',
      userId: user._id,
      requiresVerification: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.otp || !user.otp.code) {
      return res.status(400).json({ message: 'No OTP requested' });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Verification successful
    user.isPhoneVerified = true;
    user.otp = undefined; // Clear OTP
    await user.save();

    // If barber, create profile
    if (user.role === 'barber') {
      await Barber.create({
        user: user._id,
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
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isPhoneVerified) return res.status(400).json({ message: 'Phone already verified' });

    const otpCode = generateOTP();
    user.otp = {
      code: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    };
    await user.save();

    await sendSMS(user.phone, `Your Alex Salon verification code is: ${otpCode}`);

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    let barberProfile = null;
    if (user.role === 'barber') {
      barberProfile = await Barber.findOne({ user: user._id });
    }

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar },
      barberProfile
    });
  } catch (error) {
    console.error('🔥 Login Error:', error);
    if (error.name === 'MongooseError' || error.name === 'MongoNetworkError') {
      return res.status(503).json({ message: 'Database busy or disconnected. Please try again in a moment.' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let barberProfile = null;
    if (user.role === 'barber') {
      barberProfile = await Barber.findOne({ user: user._id }).populate('services');
    }
    res.json({ user, barberProfile });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, address, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address, avatar },
      { new: true }
    ).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
