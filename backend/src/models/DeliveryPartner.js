const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    vehicleType: { type: String, enum: ['bike', 'bicycle', 'car', 'on_foot'], default: 'bike' },
    vehicleNumber: String,
    dateOfBirth: Date,
    address: String,
    idProofNumber: String,
    emergencyContact: {
      name: String,
      phone: String,
    },
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifsc: String,
    },
    documents: {
      license: String,
      idProof: String,
      vehicleRC: String,
    },
    kycStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    isOnline: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    totalDeliveries: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

deliveryPartnerSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
