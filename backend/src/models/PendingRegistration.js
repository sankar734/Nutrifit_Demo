const mongoose = require('mongoose');

const pendingRegistrationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: 'customer' },
    otp: {
      code: { type: String, required: true },
      expiresAt: { type: Date, required: true },
    },
    createdAt: { type: Date, default: Date.now, expires: 600 }, // Expire after 10 minutes
  },
  { timestamps: true }
);

module.exports = mongoose.model('PendingRegistration', pendingRegistrationSchema);
