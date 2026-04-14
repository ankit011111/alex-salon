require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const barberRoutes = require('./routes/barbers');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');
const customerRoutes = require('./routes/customers');

const app = express();

// Middleware
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customers', customerRoutes);

// Health check
app.get('/api/health', (req, res) => {
  const isMock = process.env.USE_MOCK_MODE === 'true';
  res.json({ 
    status: 'OK', 
    message: isMock ? 'Alex Salon API is running in MOCK MODE' : 'Alex Salon API is running', 
    timestamp: new Date(),
    db: isMock ? 'mock_mode' : (mongoose.connection.readyState === 1 ? 'connected' : 'disconnected')
  });
});

// Temporary Setup Route (Remove after use)
app.get('/api/setup-admin', async (req, res) => {
  try {
    const User = require('./models/User');
    const adminEmail = 'admin@alexsalon.com';
    
    // Wait for DB to be potentially ready (1 = connected, 2 = connecting)
    if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
       return res.status(503).json({ error: 'Database disconnected. Please wait for the initial connection.' });
    }

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) return res.json({ message: 'Admin already exists' });
    
    await User.create({
      name: 'Alex Admin',
      email: adminEmail,
      phone: '9999999999',
      password: 'admin123',
      role: 'admin'
    });
    res.json({ message: 'Admin created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
const connectDB = async (retryCount = 5) => {
  if (process.env.USE_MOCK_MODE === 'true') {
    console.log('🛠️  Running in MOCK MODE (In-memory data)');
    return;
  }

  if (mongoose.connection.readyState === 1) return; // Already connected

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
    });
    console.log(`✅ Connected to MongoDB Atlas`);
  } catch (err) {
    console.error(`❌ MongoDB connection error (Retries left: ${retryCount}):`, err.message);
    if (retryCount > 0) {
      console.log('Retrying in 5 seconds...');
      setTimeout(() => connectDB(retryCount - 1), 5000);
    }
  }
};

// Monitor connection status
mongoose.connection.on('error', err => {
  console.error('Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  if (mongoose.connection.readyState === 0) {
    console.log('Mongoose disconnected. Reconnect attempt in 10s...');
    setTimeout(() => connectDB(), 10000);
  }
});

// Start Server with EADDRINUSE handling
const startServer = () => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Alex Salon API running on port ${PORT}`);
    connectDB();
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is busy. Retrying in 2 seconds...`);
      setTimeout(() => {
        server.close();
        startServer();
      }, 2000);
    } else {
      console.error('Server error:', err);
    }
  });
};

startServer();

