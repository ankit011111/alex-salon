const generateOTP = () => {
  // Generate a random 6-digit number
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendSMS = async (phone, message) => {
  // In a real production environment, you would integrate a provider like Twilio here:
  // e.g., await twilioClient.messages.create({ body: message, from: TWILIO_PHONE, to: phone })
  
  console.log('============================================');
  console.log(`📱 MOCK SMS TO: ${phone}`);
  console.log(`✉️ MESSAGE: ${message}`);
  console.log('============================================');

  // Simulate network delay
  return new Promise(resolve => setTimeout(resolve, 500));
};

module.exports = {
  generateOTP,
  sendSMS
};
