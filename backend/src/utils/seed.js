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
      category: categories[0]._id,
      name: 'Berry Overnight Oats',
      description: 'Creamy overnight oats layered with chia seeds, toasted almonds, and fresh strawberries, raspberries and blueberries.',
      images: ['/food-images/berry-overnight-oats.jpg'],
      price: 129,
      isVeg: true,
      nutrition: { calories: 290, protein: 10, carbs: 42, fat: 9, fiber: 8, sugar: 14 },
      suitableFor: ['weight_loss', 'kids'],
      tags: ['breakfast', 'oats', 'berries', 'no-cook'],
      portionSize: '1 jar (300g)',
      preparationTimeMinutes: 10,
    },
    {
      chef: chef._id,
      category: categories[2]._id,
      name: 'Chickpea Feta Salad',
      description: 'A protein-rich Mediterranean salad with chickpeas, feta, cucumber, cherry tomatoes, olives and fresh parsley.',
      images: ['/food-images/chickpea-feta-salad.jpg'],
      price: 189,
      isVeg: true,
      nutrition: { calories: 340, protein: 16, carbs: 34, fat: 14, fiber: 10, sugar: 5 },
      suitableFor: ['weight_loss', 'fitness'],
      tags: ['salad', 'mediterranean', 'high-protein'],
      portionSize: '1 bowl (350g)',
      preparationTimeMinutes: 15,
    },
    {
      chef: chef._id,
      category: categories[0]._id,
      name: 'Avocado & Poached Egg Toast',
      description: 'Multigrain toast topped with smashed avocado, a perfectly poached egg, chili flakes and microgreens.',
      images: ['/food-images/avocado-poached-egg-toast.jpg'],
      price: 159,
      isVeg: true,
      nutrition: { calories: 310, protein: 14, carbs: 28, fat: 17, fiber: 7, sugar: 3 },
      suitableFor: ['fitness', 'heart_healthy'],
      tags: ['breakfast', 'avocado', 'egg'],
      portionSize: '1 toast',
      preparationTimeMinutes: 12,
    },
    {
      chef: chef._id,
      category: categories[3]._id,
      name: 'Rainbow Buddha Bowl',
      description: 'A vibrant bowl of millet, black beans, chickpeas, sautéed kale, cherry tomatoes, avocado and fresh orange, with a side of tamari dressing.',
      images: ['/food-images/buddha-bowl.jpg'],
      price: 219,
      isVeg: true,
      nutrition: { calories: 420, protein: 18, carbs: 58, fat: 13, fiber: 14, sugar: 9 },
      suitableFor: ['weight_loss', 'diabetic_friendly', 'heart_healthy'],
      tags: ['bowl', 'vegan', 'kale', 'millet'],
      portionSize: '1 bowl (400g)',
      preparationTimeMinutes: 20,
    },
    {
      chef: chef._id,
      category: categories[0]._id,
      name: 'Green Detox Smoothie Bowl',
      description: 'Spinach, banana and mango blended into a smooth green base, topped with baby kiwi, granola and chia seeds.',
      images: ['/food-images/green-smoothie-bowl.jpg'],
      price: 149,
      isVeg: true,
      nutrition: { calories: 260, protein: 7, carbs: 48, fat: 5, fiber: 9, sugar: 22 },
      suitableFor: ['weight_loss', 'kids'],
      tags: ['smoothie', 'breakfast', 'detox'],
      portionSize: '1 bowl (350g)',
      preparationTimeMinutes: 8,
    },
    {
      chef: chef._id,
      category: categories[2]._id,
      name: 'Grilled Salmon with Asparagus & Millet',
      description: 'Char-grilled salmon fillet served with steamed asparagus spears and nutty black-sesame millet, finished with fresh lemon.',
      images: ['/food-images/grilled-salmon-asparagus.jpg'],
      price: 349,
      isVeg: false,
      nutrition: { calories: 480, protein: 38, carbs: 32, fat: 20, fiber: 6, sugar: 3 },
      suitableFor: ['fitness', 'heart_healthy', 'weight_loss'],
      tags: ['salmon', 'seafood', 'high-protein', 'omega-3'],
      portionSize: '1 plate (380g)',
      preparationTimeMinutes: 25,
    },
    {
      chef: chef._id,
      category: categories[2]._id,
      name: 'Tuna Poke Bowl',
      description: 'Fresh diced tuna over sushi rice with pickled red cabbage, green peas, cucumber, sesame and a light citrus-soy dressing.',
      images: ['/food-images/tuna-poke-bowl.jpg'],
      price: 289,
      isVeg: false,
      nutrition: { calories: 410, protein: 30, carbs: 46, fat: 9, fiber: 5, sugar: 6 },
      suitableFor: ['fitness', 'weight_loss'],
      tags: ['poke', 'tuna', 'rice-bowl', 'japanese'],
      portionSize: '1 bowl (400g)',
      preparationTimeMinutes: 18,
    },
    {
      chef: chef._id,
      category: categories[3]._id,
      name: 'Grilled Chicken with Sweet Potato Mash',
      description: 'Lean grilled chicken breast served over creamy sweet potato mash with steamed broccoli florets.',
      images: ['/food-images/grilled-chicken-sweet-potato.jpg'],
      price: 259,
      isVeg: false,
      nutrition: { calories: 390, protein: 36, carbs: 34, fat: 10, fiber: 6, sugar: 8 },
      suitableFor: ['fitness', 'weight_loss', 'diabetic_friendly'],
      tags: ['chicken', 'high-protein', 'sweet-potato'],
      portionSize: '1 plate (380g)',
      preparationTimeMinutes: 22,
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
