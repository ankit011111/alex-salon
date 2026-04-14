const mongoose = require('mongoose');
require('dotenv').config();

const test = async () => {
  console.log('Testing connection to:', process.env.MONGODB_URI.split('@')[1]);
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      tls: true,
      tlsAllowInvalidCertificates: true // Just for testing SSL handshake
    });
    console.log('✅ TEST SUCCESSFUL');
    process.exit(0);
  } catch (err) {
    console.error('❌ TEST FAILED:', err.message);
    process.exit(1);
  }
};

test();
