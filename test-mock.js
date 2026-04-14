const { getMockModel } = require('./backend/utils/mockProvider');
const mongoose = require('mongoose');

async function test() {
  const User = getMockModel('User', {});
  const user = await User.findOne({ email: 'admin@alexsalon.com' });
  console.log('User found:', user ? user.name : 'null');
  if (user) {
    try {
      console.log('Testing comparePassword...');
      const isMatch = await user.comparePassword('admin123');
      console.log('Match:', isMatch);
    } catch (err) {
      console.error('Error calling comparePassword:', err.message);
    }
  }
}

test();
