require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nutrichef');
    console.log('Connected to MongoDB');

    const User = require('../models/User');
    const Chef = require('../models/Chef');
    const DeliveryPartner = require('../models/DeliveryPartner');
    const Food = require('../models/Food');

    // 1. Setup Admin: srihariram2005@gmail.com
    let admin = await User.findOne({ email: 'srihariram2005@gmail.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Sri Hariram (Admin)',
        email: 'srihariram2005@gmail.com',
        password: 'password123',
        role: 'superadmin',
        isEmailVerified: true,
        isActive: true,
      });
    } else {
      admin.role = 'superadmin';
      admin.isEmailVerified = true;
      admin.isActive = true;
      admin.password = 'password123';
      await admin.save();
    }
    console.log('Admin account ready:', admin.email, '| Role:', admin.role);

    // 2. Setup Chef: sankar73051862@gmail.com
    let chefUser = await User.findOne({ email: 'sankar73051862@gmail.com' });
    if (!chefUser) {
      chefUser = await User.create({
        name: 'Sankar Chef',
        email: 'sankar73051862@gmail.com',
        password: 'password123',
        role: 'chef',
        referralCode: 'SANKAR01',
        isEmailVerified: true,
        isActive: true,
      });
    } else {
      chefUser.role = 'chef';
      chefUser.isEmailVerified = true;
      chefUser.isActive = true;
      chefUser.password = 'password123';
      await chefUser.save();
    }

    let chef = await Chef.findOne({ user: chefUser._id });
    if (!chef) {
      chef = await Chef.create({
        user: chefUser._id,
        kitchenName: "Sankar's Healthy Kitchen",
        bio: 'Home-style nutritious meals, balanced macros, high protein and fresh ingredients.',
        specialties: ['South Indian', 'Diabetic Friendly', 'High Protein', 'Millets'],
        kycStatus: 'verified',
        isVerified: true,
        location: { type: 'Point', coordinates: [80.2707, 13.0827] },
        address: 'Chennai, Tamil Nadu',
        rating: 4.9,
        totalReviews: 145,
      });
    } else {
      chef.kitchenName = "Sankar's Healthy Kitchen";
      chef.kycStatus = 'verified';
      chef.isVerified = true;
      await chef.save();
    }

    // Link foods to this chef
    await Food.updateMany({}, { chef: chef._id });
    console.log('Chef account ready:', chefUser.email, '| Kitchen:', chef.kitchenName);

    // 3. Setup Delivery Partner: sankarnaga005@gmail.com
    let deliveryUser = await User.findOne({ email: 'sankarnaga005@gmail.com' });
    if (!deliveryUser) {
      deliveryUser = await User.create({
        name: 'Sankar Delivery',
        email: 'sankarnaga005@gmail.com',
        password: 'password123',
        role: 'delivery',
        referralCode: 'DEL001',
        isEmailVerified: true,
        isActive: true,
      });
    } else {
      deliveryUser.role = 'delivery';
      deliveryUser.isEmailVerified = true;
      deliveryUser.isActive = true;
      deliveryUser.password = 'password123';
      await deliveryUser.save();
    }

    let dp = await DeliveryPartner.findOne({ user: deliveryUser._id });
    if (!dp) {
      dp = await DeliveryPartner.create({
        user: deliveryUser._id,
        vehicleType: 'bike',
        vehicleNumber: 'TN 07 AB 1234',
        kycStatus: 'verified',
        isOnline: true,
        rating: 4.8,
        totalDeliveries: 210,
      });
    } else {
      dp.kycStatus = 'verified';
      dp.isOnline = true;
      await dp.save();
    }
    console.log('Delivery account ready:', deliveryUser.email, '| Vehicle:', dp.vehicleNumber);

    console.log('\n--- ALL ACCOUNTS SUCCESSFULLY CONFIGURED ---');
    console.log('Admin:    srihariram2005@gmail.com / password123');
    console.log('Chef:     sankar73051862@gmail.com / password123');
    console.log('Delivery: sankarnaga005@gmail.com / password123');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Setup error:', err);
    process.exit(1);
  }
}

run();
