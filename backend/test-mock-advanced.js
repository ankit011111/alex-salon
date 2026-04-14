const { getMockModel } = require('./utils/mockProvider');

async function test() {
  const User = getMockModel('User', {});
  
  console.log('--- Testing Retrieval & Method Wrapping ---');
  const user = await User.findOne({ email: 'admin@alexsalon.com' });
  console.log('User found:', user ? user.name : 'null');
  
  if (user && user.comparePassword) {
    try {
      const isMatch = await user.comparePassword('admin123');
      console.log('Login match (admin123):', isMatch);
      const isFail = await user.comparePassword('wrong');
      console.log('Login match (wrong):', isFail);
    } catch (err) {
      console.error('Error calling comparePassword:', err.message);
    }
  } else {
    console.error('Error: comparePassword method missing on user object!');
  }

  console.log('\n--- Testing Advanced Querying ($in, $regex) ---');
  const Service = getMockModel('Service', {});
  
  // Test $in
  const servicesIn = await Service.find({ category: { $in: ['haircut', 'skincare'] } });
  console.log('Categories haircut/skincare count (expect 2):', servicesIn.length);
  
  // Test $regex
  const searchResults = await Service.find({ name: { $regex: 'beard', $options: 'i' } });
  console.log('Search "beard" count (expect 1):', searchResults.length);
  
  // Test numeric range
  const priceRange = await Service.find({ price: { $gte: 1000 } });
  console.log('Price >= 1000 count (expect 1):', priceRange.length);

  console.log('\n--- Result: Verification Complete ---');
}

test();
