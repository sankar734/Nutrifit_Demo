let twilioClient = null;

const isConfigured = () =>
  !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER);

const getClient = () => {
  if (!isConfigured()) return null;
  if (!twilioClient) {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
};

// Sends a real SMS via Twilio if configured; otherwise logs to console so the
// OTP flow still works end-to-end in local/dev environments (the OTP is also
// returned in the API response in non-production mode in that case).
const sendSms = async (to, body) => {
  const client = getClient();
  if (!client) {
    console.log(`[smsService] Twilio not configured — would have sent to ${to}: ${body}`);
    return { sent: false, mock: true };
  }
  try {
    await client.messages.create({ body, from: process.env.TWILIO_PHONE_NUMBER, to });
    return { sent: true };
  } catch (err) {
    console.error(`[smsService] Failed to send SMS to ${to}:`, err.message);
    return { sent: false, error: err.message };
  }
};

const sendOtpSms = (phone, otp) => sendSms(phone, `Your NutriChef verification code is ${otp}. Valid for 5 minutes.`);

module.exports = { sendSms, sendOtpSms, isConfigured };
