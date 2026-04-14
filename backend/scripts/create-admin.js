require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const connectWithRetry = async (retries = 5, interval = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB');
      return;
    } catch (err) {
      console.log(`Connection attempt ${i + 1} failed. Retrying in ${interval/1000}s...`);
      await new Promise(res => setTimeout(res, interval));
    }
  }
  throw new Error('Could not connect to MongoDB after multiple attempts');
};

const createAdmin = async () => {
  try {
    await connectWithRetry();
    
    const adminEmail = 'admin@alexsalon.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`Admin account already exists for ${adminEmail}`);
      process.exit(0);
    }

    await User.create({
      name: 'Alex Admin',
      email: adminEmail,
      phone: '9999999999',
      password: 'admin123',
      role: 'admin'
    });

    console.log(`✅ Admin account created successfully!`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: admin123`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
