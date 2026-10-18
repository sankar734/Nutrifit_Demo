require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Chef = require('../models/Chef');
const Category = require('../models/Category');
const Food = require('../models/Food');
const DeliveryPartner = require('../models/DeliveryPartner');

const run = async () => {
  await connectDB();

  console.log('Clearing existing demo data...');
  await Promise.all([User.deleteMany({}), Chef.deleteMany({}), Category.deleteMany({}), Food.deleteMany({}), DeliveryPartner.deleteMany({})]);

  const categories = await Category.insertMany([
    { name: 'Healthy Breakfast', slug: 'healthy-breakfast', sortOrder: 1 },
    { name: 'Diabetic Friendly', slug: 'diabetic-friendly', sortOrder: 2 },
    { name: 'High Protein', slug: 'high-protein', sortOrder: 3 },
    { name: 'Weight Loss Meals', slug: 'weight-loss-meals', sortOrder: 4 },
    { name: 'Kids Special', slug: 'kids-special', sortOrder: 5 },
  ]);

  const chefUser = await User.create({
    name: 'Sankar Chef',
    email: 'sankar73051862@gmail.com',
    password: 'password123',
    role: 'chef',
    referralCode: 'SANKAR01',
    isEmailVerified: true,
  });

  const chef = await Chef.create({
    user: chefUser._id,
    kitchenName: "Sankar's Healthy Kitchen",
    bio: 'Home-style nutritious meals, balanced macros, high protein and fresh ingredients.',
    specialties: ['South Indian', 'Diabetic Friendly', 'High Protein', 'Millets'],
    kycStatus: 'verified',
    isVerified: true,
    location: { type: 'Point', coordinates: [80.2707, 13.0827] },
    address: 'Chennai, Tamil Nadu',
    rating: 4.8,
    totalReviews: 128,
  });

  const customerUser = await User.create({
    name: 'Demo Customer',
    email: 'customer@nutrichef.demo',
    password: 'password123',
    role: 'customer',
    referralCode: 'CUST01',
    isEmailVerified: true,
    healthProfile: {
      age: 28,
      gender: 'male',
      heightCm: 175,
      weightKg: 78,
      activityLevel: 'moderate',
      goal: 'weight_loss',
      dietaryPreference: 'veg',
    },
  });

  const adminUser = await User.create({
    name: 'Sri Hariram (Admin)',
    email: 'srihariram2005@gmail.com',
    password: 'password123',
    role: 'superadmin',
    isEmailVerified: true,
  });

  const deliveryUser = await User.create({
    name: 'Sankar Delivery',
    email: 'sankarnaga005@gmail.com',
    password: 'password123',
    role: 'delivery',
    referralCode: 'DEL001',
    isEmailVerified: true,
  });

  await DeliveryPartner.create({
    user: deliveryUser._id,
    vehicleType: 'bike',
    vehicleNumber: 'TN 07 AB 1234',
    kycStatus: 'verified',
    isOnline: true,
    rating: 4.8,
    totalDeliveries: 210,
  });

  await Food.insertMany([
    {
      chef: chef._id,
      category: categories[2]._id, // High Protein
      name: 'Grilled Chicken Breast',
      description: 'Herb-marinated tender chicken breast flame-grilled with fresh zucchini, steamed broccoli florets, sweet peppers, and low-fat garlic herb yogurt dip. Packed with clean lean protein.',
      images: [
        '/food-images/grilled-chicken-breast-1.jpg',
        '/food-images/grilled-chicken-breast-2.jpg',
        '/food-images/grilled-chicken-breast-3.jpg',
        '/food-images/grilled-chicken-breast-4.jpg',
      ],
      price: 249,
      discountPrice: 249,
      isVeg: false,
      nutrition: { calories: 380, protein: 42, carbs: 12, fat: 8, fiber: 5, sugar: 3 },
      suitableFor: ['fitness', 'weight_loss'],
      tags: ['42g Protein', '380 kcal', 'Non-Veg', 'High Protein', 'Keto', 'Weight Loss', 'Grills'],
      portionSize: '1 plate (350g)',
      preparationTimeMinutes: 25,
      rating: 4.9,
      totalReviews: 2840,
    },
    {
      chef: chef._id,
      category: categories[2]._id, // High Protein
      name: 'Paneer Tikka',
      description: 'Farm-fresh cottage cheese cubes steeped in hung curd marinade, cold-pressed mustard oil, and carom seeds, skewered with bell peppers and roasted in tandoor. Served with cooling mint dip and lemon.',
      images: [
        '/food-images/paneer-tikka-1.jpg',
        '/food-images/paneer-tikka-2.jpg',
        '/food-images/paneer-tikka-3.jpg',
        '/food-images/paneer-tikka-4.jpg',
      ],
      price: 219,
      discountPrice: 219,
      isVeg: true,
      nutrition: { calories: 320, protein: 24, carbs: 14, fat: 18, fiber: 4, sugar: 4 },
      suitableFor: ['fitness', 'diabetic_friendly'],
      tags: ['24g Protein', '320 kcal', 'Pure Veg', 'High Protein', 'Diabetic Friendly', 'Keto', 'Grills'],
      portionSize: '6 skewers (300g)',
      preparationTimeMinutes: 20,
      rating: 4.8,
      totalReviews: 3150,
    },
    {
      chef: chef._id,
      category: categories[0]._id, // Healthy Breakfast
      name: 'Egg White Omelette',
      description: 'Light and fluffy triple egg-white folded omelette packed with colorful bell peppers, juicy diced tomatoes, fresh oregano, and spicy tomato salsa. Ultra low calorie and protein dense.',
      images: [
        '/food-images/egg-white-omelette-1.jpg',
        '/food-images/egg-white-omelette-2.jpg',
        '/food-images/egg-white-omelette-3.jpg',
        '/food-images/egg-white-omelette-4.jpg',
      ],
      price: 149,
      discountPrice: 149,
      isVeg: false,
      nutrition: { calories: 190, protein: 22, carbs: 6, fat: 4, fiber: 3, sugar: 2 },
      suitableFor: ['weight_loss', 'fitness'],
      tags: ['22g Protein', '190 kcal', 'Eggetarian', 'High Protein', 'Weight Loss', 'Breakfast'],
      portionSize: '1 plate (250g)',
      preparationTimeMinutes: 15,
      rating: 4.7,
      totalReviews: 1920,
    },
    {
      chef: chef._id,
      category: categories[3]._id, // Weight Loss Meals / Salads
      name: 'Sprouts Protein Salad',
      description: 'Organic sprouted moong and black chickpeas tossed with crunchy Persian cucumbers, grated carrots, red onion, crushed pepper, and zesty lemon mustard dressing. Loaded with live enzymes and prebiotic fiber.',
      images: [
        '/food-images/sprouts-protein-salad-1.jpg',
        '/food-images/sprouts-protein-salad-2.jpg',
        '/food-images/sprouts-protein-salad-3.jpg',
        '/food-images/sprouts-protein-salad-4.jpg',
      ],
      price: 139,
      discountPrice: 139,
      isVeg: true,
      nutrition: { calories: 210, protein: 16, carbs: 32, fat: 3, fiber: 11, sugar: 5 },
      suitableFor: ['weight_loss', 'diabetic_friendly'],
      tags: ['16g Protein', '210 kcal', 'Vegan', 'Pure Veg', 'High Protein', 'Weight Loss', 'Diabetic Friendly', 'Salad'],
      portionSize: '1 bowl (300g)',
      preparationTimeMinutes: 12,
      rating: 4.8,
      totalReviews: 2410,
    },
  ]);

  console.log('Seed complete!');
  console.log('Configured accounts:');
  console.log('  Admin     -> srihariram2005@gmail.com / password123');
  console.log('  Chef      -> sankar73051862@gmail.com / password123');
  console.log('  Delivery  -> sankarnaga005@gmail.com / password123');
  console.log('  Customer  -> customer@nutrichef.demo / password123');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
