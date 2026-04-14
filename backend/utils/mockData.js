const mongoose = require('mongoose');

// Fixed IDs for consistency
const ADMIN_ID = '661bc5a5e3b5e4001cf8e1a1';
const BARBER_ID = '661bc5a5e3b5e4001cf8e1a2';
const CUSTOMER_ID = '661bc5a5e3b5e4001cf8e1a3';
const SERVICE_ID_1 = '661bc5a5e3b5e4001cf8e2a1';
const SERVICE_ID_2 = '661bc5a5e3b5e4001cf8e2a2';
const SERVICE_ID_3 = '661bc5a5e3b5e4001cf8e2a3';

const mockData = {
  users: [
    {
      _id: ADMIN_ID,
      name: 'Admin Alex',
      email: 'admin@alexsalon.com',
      phone: '9876543210',
      password: '$2a$10$7w.th643.CbvAQly.BtvQ.bEE5PIL2RVX5J2ah2QKpt2b33QKKnCm', // 'admin123'
      role: 'admin',
      isActive: true,
      lastLogin: new Date()
    },
    {
      _id: BARBER_ID,
      name: 'John Barber',
      email: 'john@alexsalon.com',
      phone: '9876543211',
      password: '$2a$10$7w.th643.CbvAQly.BtvQ.bEE5PIL2RVX5J2ah2QKpt2b33QKKnCm',
      role: 'barber',
      isActive: true
    },
    {
      _id: CUSTOMER_ID,
      name: 'Alice Customer',
      email: 'alice@gmail.com',
      phone: '9876543212',
      password: '$2a$10$7w.th643.CbvAQly.BtvQ.bEE5PIL2RVX5J2ah2QKpt2b33QKKnCm',
      role: 'customer',
      isActive: true
    }
  ],
  services: [
    {
      _id: SERVICE_ID_1,
      name: 'Classic Haircut',
      description: 'Standard haircut with styling and wash',
      category: 'haircut',
      price: 500,
      duration: 30,
      gender: 'male',
      isActive: true,
      isPopular: true,
      rating: 4.5,
      totalReviews: 50
    },
    {
      _id: SERVICE_ID_2,
      name: 'Premium Beard Trim',
      description: 'Precise beard grooming and shaping with hot towel',
      category: 'beard',
      price: 300,
      duration: 20,
      gender: 'male',
      isActive: true,
      rating: 4.8,
      totalReviews: 30
    },
    {
      _id: SERVICE_ID_3,
      name: 'Hydrating Facial',
      description: 'Deep cleaning and hydration for all skin types',
      category: 'skincare',
      price: 1200,
      duration: 60,
      gender: 'unisex',
      isActive: true,
      isTrending: true,
      rating: 4.9,
      totalReviews: 15
    }
  ],
  barbers: [
    {
      _id: '661bc5a5e3b5e4001cf8e3a1',
      user: BARBER_ID,
      specializations: ['haircut', 'beard'],
      experience: 5,
      rating: 4.8,
      totalReviews: 120,
      isActive: true,
      services: [SERVICE_ID_1, SERVICE_ID_2],
      availability: {
        monday: { isAvailable: true, slots: [{ start: '09:00', end: '19:00' }] },
        tuesday: { isAvailable: true, slots: [{ start: '09:00', end: '19:00' }] },
        wednesday: { isAvailable: true, slots: [{ start: '09:00', end: '19:00' }] },
        thursday: { isAvailable: true, slots: [{ start: '09:00', end: '19:00' }] },
        friday: { isAvailable: true, slots: [{ start: '09:00', end: '20:00' }] },
        saturday: { isAvailable: true, slots: [{ start: '10:00', end: '18:00' }] },
        sunday: { isAvailable: false, slots: [] }
      }
    }
  ],
  bookings: [
    {
      _id: '661bc5a5e3b5e4001cf8e4a1',
      customer: CUSTOMER_ID,
      barber: '661bc5a5e3b5e4001cf8e3a1',
      services: [SERVICE_ID_1],
      date: new Date(Date.now() + 86400000).toISOString(),
      slot: '10:00',
      status: 'pending',
      totalAmount: 500,
      paymentStatus: 'pending'
    }
  ],
  reviews: [],
  coupons: []
};

module.exports = mockData;
