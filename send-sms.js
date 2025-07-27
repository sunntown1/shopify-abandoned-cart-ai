// Twilio SMS sending function
// Sends SMS messages using Twilio API

require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

/**
 * Sends an SMS message using Twilio
 * @param {string} phoneNumber - The recipient's phone number (E.164 format, e.g., +1234567890)
 * @param {string} message - The SMS message to send
 * @returns {Promise<object>} Twilio API response
 */
async function sendSMS(phoneNumber, message) {
  if (!phoneNumber || !message) {
    throw new Error('phoneNumber and message are required');
  }
  
  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Twilio credentials are not set in environment variables');
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: phoneNumber
    });
    
    console.log('✅ SMS sent successfully:', result.sid);
    return result;
    
  } catch (error) {
    console.error('❌ SMS sending failed:', error);
    throw error;
  }
}

/**
 * Test SMS sending function
 */
async function testSMSSending() {
  try {
    console.log('🧪 Testing SMS sending...');
    
    const testPhoneNumber = process.env.TEST_PHONE_NUMBER;
    if (!testPhoneNumber) {
      console.log('⚠️ TEST_PHONE_NUMBER not set, skipping SMS test');
      return;
    }
    
    const testMessage = '🧪 This is a test SMS from your abandoned cart system!';
    
    const result = await sendSMS(testPhoneNumber, testMessage);
    console.log('✅ Test SMS sent successfully!');
    console.log('📱 Message SID:', result.sid);
    
  } catch (error) {
    console.error('❌ Test SMS failed:', error.message);
  }
}

module.exports = { sendSMS, testSMSSending };

// Run test if this file is executed directly
if (require.main === module) {
  // Check required environment variables
  const requiredEnvVars = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing Twilio environment variables:', missingVars.join(', '));
    process.exit(1);
  }
  
  testSMSSending();
} 