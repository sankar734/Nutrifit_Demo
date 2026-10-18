const mongoose = require('mongoose');

const chefSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    kitchenName: { type: String, required: true },
    bio: String,
    phone: String,
    yearsOfExperience: Number,
    specialties: [String],
    kycStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    foodLicenseNumber: String,
    foodLicenseUrl: String,
    kitchenPhotos: [String],
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifsc: String,
      upiId: String,
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    address: String,
    isAvailable: { type: Boolean, default: true },
    holidayMode: { type: Boolean, default: false },
    availabilitySchedule: [
      {
        day: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
        openTime: String,
        closeTime: String,
      },
    ],
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    commissionRate: { type: Number, default: 15 },
    subscriptionPlan: { type: String, enum: ['free', 'pro', 'premium'], default: 'free' },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

chefSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Chef', chefSchema);
