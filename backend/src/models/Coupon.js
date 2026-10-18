const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: String,
    discountType: { type: String, enum: ['percentage', 'flat'], required: true },
    discountValue: { type: Number, required: true },
    maxDiscount: Number,
    minOrderValue: { type: Number, default: 0 },
    usageLimit: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    validFrom: Date,
    validTill: Date,
    isActive: { type: Boolean, default: true },
    applicableChefs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chef' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
