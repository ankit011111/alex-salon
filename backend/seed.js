require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Service = require('./models/Service');
const Barber = require('./models/Barber');
const Booking = require('./models/Booking');
const Review = require('./models/Review');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Service.deleteMany({});
    await Barber.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing data');

    // Create Admin
    const admin = await User.create({
      name: 'Alex Admin',
      email: 'admin@alexsalon.com',
      phone: '9999999999',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Admin created: admin@alexsalon.com / admin123');

    // Create Barbers (users)
    const barberUsers = await User.create([
      { name: 'Rahul Sharma', email: 'rahul@alexsalon.com', phone: '9876543210', password: 'barber123', role: 'barber', avatar: '' },
      { name: 'Priya Patel', email: 'priya@alexsalon.com', phone: '9876543211', password: 'barber123', role: 'barber', avatar: '' },
      { name: 'Vikram Singh', email: 'vikram@alexsalon.com', phone: '9876543212', password: 'barber123', role: 'barber', avatar: '' },
      { name: 'Ananya Desai', email: 'ananya@alexsalon.com', phone: '9876543213', password: 'barber123', role: 'barber', avatar: '' },
      { name: 'Arjun Reddy', email: 'arjun@alexsalon.com', phone: '9876543214', password: 'barber123', role: 'barber', avatar: '' }
    ]);
    console.log('Barber users created');

    // Create Services
    const services = await Service.create([
      { name: 'Classic Haircut', description: 'Precision haircut with styling. Includes wash and blow dry.', category: 'haircut', price: 499, duration: 45, gender: 'male', homeServiceAvailable: true, homeServiceExtraCharge: 100, isPopular: true, tags: ['haircut', 'classic', 'men'] },
      { name: 'Premium Haircut & Style', description: 'Designer haircut with premium products and detailed styling.', category: 'haircut', price: 899, duration: 60, gender: 'unisex', homeServiceAvailable: true, homeServiceExtraCharge: 150, isPopular: true, isTrending: true, tags: ['premium', 'styling'] },
      { name: 'Kids Haircut', description: 'Gentle and fun haircut for children under 12.', category: 'haircut', price: 299, duration: 30, gender: 'unisex', homeServiceAvailable: true, homeServiceExtraCharge: 100, tags: ['kids', 'children'] },
      { name: 'Beard Trim & Shape', description: 'Expert beard trimming and shaping with hot towel finish.', category: 'beard', price: 349, duration: 30, gender: 'male', homeServiceAvailable: true, homeServiceExtraCharge: 50, isPopular: true, tags: ['beard', 'grooming'] },
      { name: 'Royal Beard Grooming', description: 'Complete beard treatment with oil massage, trim, and styling.', category: 'beard', price: 699, duration: 45, gender: 'male', homeServiceAvailable: true, homeServiceExtraCharge: 100, isTrending: true, tags: ['beard', 'royal', 'premium'] },
      { name: 'Clean Shave', description: 'Traditional hot towel clean shave with premium razor.', category: 'beard', price: 249, duration: 25, gender: 'male', homeServiceAvailable: true, homeServiceExtraCharge: 50, tags: ['shave', 'clean'] },
      { name: 'Bridal Makeup', description: 'Complete bridal makeup with HD products. Includes trial session.', category: 'bridal', price: 14999, duration: 180, gender: 'female', homeServiceAvailable: true, homeServiceExtraCharge: 500, isPopular: true, tags: ['bridal', 'wedding', 'makeup'] },
      { name: 'Party Makeup', description: 'Glamorous party look with long-lasting premium products.', category: 'makeup', price: 2499, duration: 90, gender: 'female', homeServiceAvailable: true, homeServiceExtraCharge: 200, isTrending: true, tags: ['party', 'makeup', 'glamour'] },
      { name: 'Natural Makeup', description: 'Subtle and natural everyday look enhancement.', category: 'makeup', price: 1499, duration: 60, gender: 'female', homeServiceAvailable: true, homeServiceExtraCharge: 150, tags: ['natural', 'everyday'] },
      { name: 'Deep Cleansing Facial', description: 'Deep pore cleansing facial with exfoliation and mask.', category: 'facial', price: 1299, duration: 60, gender: 'unisex', homeServiceAvailable: true, homeServiceExtraCharge: 150, isPopular: true, tags: ['facial', 'cleansing', 'skincare'] },
      { name: 'Gold Facial', description: 'Luxury gold facial for radiant and youthful skin.', category: 'facial', price: 2499, duration: 75, gender: 'unisex', homeServiceAvailable: true, homeServiceExtraCharge: 200, isTrending: true, tags: ['gold', 'luxury', 'anti-aging'] },
      { name: 'Full Body Spa', description: 'Relaxing full body spa with aromatherapy and hot stones.', category: 'spa', price: 3999, duration: 120, gender: 'unisex', homeServiceAvailable: false, tags: ['spa', 'relaxation', 'full-body'] },
      { name: 'Head Massage', description: 'Stress-relieving head and scalp massage with essential oils.', category: 'spa', price: 599, duration: 30, gender: 'unisex', homeServiceAvailable: true, homeServiceExtraCharge: 100, isPopular: true, tags: ['massage', 'head', 'relaxation'] },
      { name: 'Hair Coloring', description: 'Professional hair coloring with premium ammonia-free colors.', category: 'hair_coloring', price: 1999, discountPrice: 1799, duration: 90, gender: 'unisex', homeServiceAvailable: false, isTrending: true, tags: ['color', 'hair', 'fashion'] },
      { name: 'Hair Highlights', description: 'Trendy highlights and balayage with global colors.', category: 'hair_coloring', price: 3499, duration: 120, gender: 'unisex', homeServiceAvailable: false, tags: ['highlights', 'balayage', 'trendy'] },
      { name: 'Anti-Tan Treatment', description: 'Complete de-tan treatment for face and neck.', category: 'skincare', price: 999, duration: 45, gender: 'unisex', homeServiceAvailable: true, homeServiceExtraCharge: 100, tags: ['tan', 'skincare', 'treatment'] },
      { name: 'Keratin Treatment', description: 'Smoothing keratin treatment for frizz-free, silky hair.', category: 'haircut', price: 4999, duration: 150, gender: 'unisex', homeServiceAvailable: false, isPopular: true, tags: ['keratin', 'smoothing', 'hair'] },
      { name: 'Manicure & Pedicure Combo', description: 'Complete hand and foot care with nail art.', category: 'spa', price: 1499, duration: 75, gender: 'female', homeServiceAvailable: true, homeServiceExtraCharge: 150, tags: ['nails', 'manicure', 'pedicure'] }
    ]);
    console.log(`${services.length} services created`);

    // Create Barber Profiles
    const defaultSlots = [{ start: '09:00', end: '19:00' }];
    const defaultAvailability = {
      monday: { isAvailable: true, slots: defaultSlots },
      tuesday: { isAvailable: true, slots: defaultSlots },
      wednesday: { isAvailable: true, slots: defaultSlots },
      thursday: { isAvailable: true, slots: defaultSlots },
      friday: { isAvailable: true, slots: defaultSlots },
      saturday: { isAvailable: true, slots: [{ start: '10:00', end: '20:00' }] },
      sunday: { isAvailable: false, slots: [] }
    };

    const barberProfiles = await Barber.create([
      {
        user: barberUsers[0]._id,
        specializations: ['Haircut', 'Beard Grooming', 'Hair Styling'],
        experience: 8,
        bio: 'Master stylist with 8+ years of experience. Specializes in modern cuts and classic grooming.',
        services: [services[0]._id, services[1]._id, services[3]._id, services[4]._id, services[5]._id, services[12]._id],
        availability: defaultAvailability,
        rating: 4.8,
        totalReviews: 156,
        completedJobs: 1240,
        totalEarnings: 456000,
        commissionRate: 30,
        homeServiceAvailable: true,
        isOnline: true,
        isTopRated: true,
        salon: 'Alex Salon - Main Branch'
      },
      {
        user: barberUsers[1]._id,
        specializations: ['Bridal Makeup', 'Party Makeup', 'Facial', 'Skincare'],
        experience: 6,
        bio: 'Certified makeup artist and skincare specialist. Expert in bridal and party makeovers.',
        services: [services[6]._id, services[7]._id, services[8]._id, services[9]._id, services[10]._id, services[15]._id],
        availability: defaultAvailability,
        rating: 4.9,
        totalReviews: 203,
        completedJobs: 890,
        totalEarnings: 567000,
        commissionRate: 25,
        homeServiceAvailable: true,
        isOnline: true,
        isTopRated: true,
        salon: 'Alex Salon - Main Branch'
      },
      {
        user: barberUsers[2]._id,
        specializations: ['Haircut', 'Hair Coloring', 'Keratin Treatment'],
        experience: 10,
        bio: 'Senior stylist with decade of experience. Expert in hair transformations and coloring.',
        services: [services[0]._id, services[1]._id, services[13]._id, services[14]._id, services[16]._id],
        availability: defaultAvailability,
        rating: 4.7,
        totalReviews: 189,
        completedJobs: 1560,
        totalEarnings: 723000,
        commissionRate: 25,
        homeServiceAvailable: false,
        isOnline: true,
        isTopRated: true,
        salon: 'Alex Salon - Main Branch'
      },
      {
        user: barberUsers[3]._id,
        specializations: ['Makeup', 'Spa', 'Skincare', 'Nail Art'],
        experience: 4,
        bio: 'Young and creative beauty expert specializing in modern trends and spa treatments.',
        services: [services[7]._id, services[8]._id, services[9]._id, services[11]._id, services[15]._id, services[17]._id],
        availability: defaultAvailability,
        rating: 4.5,
        totalReviews: 87,
        completedJobs: 430,
        totalEarnings: 234000,
        commissionRate: 30,
        homeServiceAvailable: true,
        isOnline: false,
        isTopRated: false,
        salon: 'Alex Salon - Green Park Branch'
      },
      {
        user: barberUsers[4]._id,
        specializations: ['Haircut', 'Beard', 'Head Massage'],
        experience: 5,
        bio: 'Skilled barber focused on classic and modern men\'s grooming. Known for precision cuts.',
        services: [services[0]._id, services[1]._id, services[2]._id, services[3]._id, services[5]._id, services[12]._id],
        availability: defaultAvailability,
        rating: 4.6,
        totalReviews: 124,
        completedJobs: 780,
        totalEarnings: 345000,
        commissionRate: 30,
        homeServiceAvailable: true,
        isOnline: true,
        isTopRated: true,
        salon: 'Alex Salon - Green Park Branch'
      }
    ]);
    console.log('Barber profiles created');

    // Create sample customers
    const customers = await User.create([
      { name: 'Amit Kumar', email: 'amit@gmail.com', phone: '9988776655', password: 'customer123', role: 'customer', loyaltyPoints: 250 },
      { name: 'Sneha Gupta', email: 'sneha@gmail.com', phone: '9988776656', password: 'customer123', role: 'customer', loyaltyPoints: 180 },
      { name: 'Rohit Mehta', email: 'rohit@gmail.com', phone: '9988776657', password: 'customer123', role: 'customer', loyaltyPoints: 420 },
      { name: 'Kavita Joshi', email: 'kavita@gmail.com', phone: '9988776658', password: 'customer123', role: 'customer', loyaltyPoints: 90 },
      { name: 'Deepak Verma', email: 'deepak@gmail.com', phone: '9988776659', password: 'customer123', role: 'customer', loyaltyPoints: 310 }
    ]);
    console.log('Sample customers created');

    // Create sample bookings
    const now = new Date();
    const bookings = await Booking.create([
      {
        customer: customers[0]._id, barber: barberProfiles[0]._id,
        services: [{ service: services[0]._id, price: 499, duration: 45 }, { service: services[3]._id, price: 349, duration: 30 }],
        date: new Date(now.getTime() + 86400000), timeSlot: { start: '10:00', end: '11:15' },
        totalDuration: 75, serviceType: 'salon', subtotal: 848, totalAmount: 848,
        status: 'confirmed', barberEarning: 594, platformCommission: 254, loyaltyPointsEarned: 84
      },
      {
        customer: customers[1]._id, barber: barberProfiles[1]._id,
        services: [{ service: services[7]._id, price: 2499, duration: 90 }],
        date: new Date(now.getTime() + 86400000), timeSlot: { start: '14:00', end: '15:30' },
        totalDuration: 90, serviceType: 'home', homeAddress: { street: '123 Park Avenue', city: 'New Delhi', pincode: '110001' },
        subtotal: 2499, homeServiceCharge: 200, totalAmount: 2699,
        status: 'confirmed', barberEarning: 2024, platformCommission: 675, loyaltyPointsEarned: 269
      },
      {
        customer: customers[2]._id, barber: barberProfiles[2]._id,
        services: [{ service: services[13]._id, price: 1799, duration: 90 }],
        date: new Date(now.getTime() + 172800000), timeSlot: { start: '11:00', end: '12:30' },
        totalDuration: 90, serviceType: 'salon', subtotal: 1799, totalAmount: 1799,
        status: 'pending', barberEarning: 1349, platformCommission: 450, loyaltyPointsEarned: 179
      },
      {
        customer: customers[3]._id, barber: barberProfiles[1]._id,
        services: [{ service: services[6]._id, price: 14999, duration: 180 }],
        date: new Date(now.getTime() + 604800000), timeSlot: { start: '09:00', end: '12:00' },
        totalDuration: 180, serviceType: 'home', homeAddress: { street: '456 Wedding Hall Rd', city: 'New Delhi', pincode: '110002' },
        subtotal: 14999, homeServiceCharge: 500, totalAmount: 15499,
        status: 'confirmed', barberEarning: 11624, platformCommission: 3875, loyaltyPointsEarned: 1549
      },
      {
        customer: customers[0]._id, barber: barberProfiles[4]._id,
        services: [{ service: services[0]._id, price: 499, duration: 45 }],
        date: new Date(now.getTime() - 86400000), timeSlot: { start: '16:00', end: '16:45' },
        totalDuration: 45, serviceType: 'salon', subtotal: 499, totalAmount: 499,
        status: 'completed', paymentStatus: 'paid', barberEarning: 349, platformCommission: 150, loyaltyPointsEarned: 49
      },
      {
        customer: customers[4]._id, barber: barberProfiles[0]._id,
        services: [{ service: services[1]._id, price: 899, duration: 60 }, { service: services[4]._id, price: 699, duration: 45 }],
        date: new Date(now.getTime() - 172800000), timeSlot: { start: '12:00', end: '13:45' },
        totalDuration: 105, serviceType: 'salon', subtotal: 1598, totalAmount: 1598,
        status: 'completed', paymentStatus: 'paid', barberEarning: 1119, platformCommission: 479, loyaltyPointsEarned: 159
      }
    ]);
    console.log(`${bookings.length} sample bookings created`);

    // Create sample reviews
    await Review.create([
      { customer: customers[0]._id, barber: barberProfiles[4]._id, booking: bookings[4]._id, service: services[0]._id, rating: 5, comment: 'Amazing haircut! Arjun really knows his craft. Will definitely come back.' },
      { customer: customers[4]._id, barber: barberProfiles[0]._id, booking: bookings[5]._id, service: services[1]._id, rating: 5, comment: 'Rahul is the best stylist I have ever been to. The premium haircut was worth every penny!' },
      { customer: customers[4]._id, barber: barberProfiles[0]._id, booking: bookings[5]._id, service: services[4]._id, rating: 4, comment: 'Great beard grooming. The royal treatment felt luxurious.' }
    ]);
    console.log('Sample reviews created');

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin:    admin@alexsalon.com / admin123');
    console.log('Barber:   rahul@alexsalon.com / barber123');
    console.log('Customer: amit@gmail.com / customer123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
