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
    {
      chef: chef._id,
      category: categories[1]._id, // Diabetic Friendly
      name: 'Ragi Idli with Sambar',
      description:
        'Steamed finger millet (ragi) idlis served on a banana leaf with piping hot drumstick vegetable sambar, coconut chutney, and roasted tomato chutney. Rich in calcium and low glycemic index.',
      images: [
        '/food-images/ragi-idli-sambar-1.jpg',
        '/food-images/ragi-idli-sambar-2.jpg',
        '/food-images/ragi-idli-sambar-3.jpg',
        '/food-images/ragi-idli-sambar-4.jpg',
      ],
      price: 129,
      discountPrice: 129,
      isVeg: true,
      nutrition: { calories: 230, protein: 9, carbs: 42, fat: 3, fiber: 8, sugar: 3 },
      suitableFor: ['diabetic_friendly', 'weight_loss'],
      tags: ['Diabetic Friendly', 'Pure Veg', 'Breakfast', 'Low GI', 'High Fiber', '9g Protein'],
      portionSize: '3 idlis + sambar (320g)',
      preparationTimeMinutes: 15,
      rating: 4.8,
      totalReviews: 2150,
    },
    {
      chef: chef._id,
      category: categories[1]._id, // Diabetic Friendly
      name: 'Vegetable Oats Upma',
      description:
        'Hearty rolled oats tempered with mustard seeds, curry leaves, ginger, golden roasted cashews, crunchy green peas, and diced carrots. Served with coconut chutney and tangy vegetable sambar.',
      images: [
        '/food-images/vegetable-oats-upma-1.jpg',
        '/food-images/vegetable-oats-upma-2.jpg',
        '/food-images/vegetable-oats-upma-3.jpg',
        '/food-images/vegetable-oats-upma-4.jpg',
      ],
      price: 139,
      discountPrice: 139,
      isVeg: true,
      nutrition: { calories: 260, protein: 11, carbs: 38, fat: 7, fiber: 7, sugar: 4 },
      suitableFor: ['diabetic_friendly', 'weight_loss'],
      tags: ['Diabetic Friendly', 'Pure Veg', 'Breakfast', 'High Fiber', 'Weight Loss', '11g Protein'],
      portionSize: '1 bowl (300g)',
      preparationTimeMinutes: 15,
      rating: 4.7,
      totalReviews: 1840,
    },
    {
      chef: chef._id,
      category: categories[1]._id, // Diabetic Friendly
      name: 'Multigrain Chapati with Vegetable Curry',
      description:
        'Tawa-toasted multigrain flatbreads packed with whole wheat, oats, and ragi flour, accompanied by rich mixed cauliflower, carrot, and green pea curry, homemade curd, and sliced salad.',
      images: [
        '/food-images/multigrain-chapati-vegetable-curry-1.jpg',
        '/food-images/multigrain-chapati-vegetable-curry-2.jpg',
        '/food-images/multigrain-chapati-vegetable-curry-3.jpg',
        '/food-images/multigrain-chapati-vegetable-curry-4.jpg',
      ],
      price: 179,
      discountPrice: 179,
      isVeg: true,
      nutrition: { calories: 340, protein: 14, carbs: 52, fat: 8, fiber: 10, sugar: 5 },
      suitableFor: ['diabetic_friendly', 'weight_loss', 'fitness'],
      tags: ['Diabetic Friendly', 'Pure Veg', 'Low GI', 'High Fiber', '14g Protein'],
      portionSize: '3 chapatis + curry (350g)',
      preparationTimeMinutes: 20,
      rating: 4.8,
      totalReviews: 2650,
    },
    {
      chef: chef._id,
      category: categories[2]._id, // High Protein
      name: 'Grilled Fish with Vegetables',
      description:
        'Fresh sea bass fillet herb-crusted and pan-seared to flaky perfection, served with charred bell peppers, zucchini, cherry tomatoes, broccoli, lemon wedge, and chimichurri herb relish.',
      images: [
        '/food-images/grilled-fish-vegetables-1.jpg',
        '/food-images/grilled-fish-vegetables-2.jpg',
        '/food-images/grilled-fish-vegetables-3.jpg',
        '/food-images/grilled-fish-vegetables-4.jpg',
      ],
      price: 299,
      discountPrice: 299,
      isVeg: false,
      nutrition: { calories: 360, protein: 38, carbs: 10, fat: 9, fiber: 4, sugar: 3 },
      suitableFor: ['fitness', 'weight_loss'],
      tags: ['38g Protein', '360 kcal', 'Non-Veg', 'High Protein', 'Keto', 'Grills'],
      portionSize: '1 fillet + veggies (350g)',
      preparationTimeMinutes: 25,
      rating: 4.9,
      totalReviews: 3420,
    },
    {
      chef: chef._id,
      category: categories[3]._id, // Salad / Bowls
      name: 'Grilled Chicken Salad',
      description:
        'Tender grilled spiced chicken breast strips layered over crisp romaine, butterhead lettuce, English cucumbers, cherry tomatoes, sweet bell peppers, and whole grain mustard vinaigrette.',
      images: [
        '/food-images/grilled-chicken-salad-1.jpg',
        '/food-images/grilled-chicken-salad-2.jpg',
        '/food-images/grilled-chicken-salad-3.jpg',
        '/food-images/grilled-chicken-salad-4.jpg',
      ],
      price: 229,
      discountPrice: 229,
      isVeg: false,
      nutrition: { calories: 310, protein: 36, carbs: 14, fat: 7, fiber: 6, sugar: 4 },
      suitableFor: ['weight_loss', 'fitness'],
      tags: ['36g Protein', '310 kcal', 'Non-Veg', 'High Protein', 'Weight Loss', 'Salad', 'Grills'],
      portionSize: '1 bowl (350g)',
      preparationTimeMinutes: 20,
      rating: 4.9,
      totalReviews: 2910,
    },
    {
      chef: chef._id,
      category: categories[2]._id, // High Protein
      name: 'Paneer Bhurji',
      description:
        'Scrambled fresh cottage cheese sautéed with finely chopped onions, tomatoes, bell peppers, green chilies, and aromatic spices. Served with warm tawa rotis and fresh lemon-onion salad.',
      images: [
        '/food-images/paneer-bhurji-1.jpg',
        '/food-images/paneer-bhurji-2.jpg',
        '/food-images/paneer-bhurji-3.jpg',
        '/food-images/paneer-bhurji-4.jpg',
      ],
      price: 199,
      discountPrice: 199,
      isVeg: true,
      nutrition: { calories: 340, protein: 26, carbs: 12, fat: 21, fiber: 4, sugar: 3 },
      suitableFor: ['fitness', 'weight_loss'],
      tags: ['26g Protein', '340 kcal', 'Pure Veg', 'High Protein', 'Keto'],
      portionSize: '1 bowl + 2 rotis (320g)',
      preparationTimeMinutes: 18,
      rating: 4.8,
      totalReviews: 2530,
    },
    {
      chef: chef._id,
      category: categories[0]._id, // Healthy Breakfast
      name: 'Vegetable Omelette',
      description:
        'Whole farm egg golden omelette loaded with sautéed mushrooms, bell peppers, sweet corn, diced tomatoes, fresh cilantro, and a side of mixed green salad with homemade tomato relish.',
      images: [
        '/food-images/vegetable-omelette-1.jpg',
        '/food-images/vegetable-omelette-2.jpg',
        '/food-images/vegetable-omelette-3.jpg',
        '/food-images/vegetable-omelette-4.jpg',
      ],
      price: 159,
      discountPrice: 159,
      isVeg: false,
      nutrition: { calories: 240, protein: 18, carbs: 8, fat: 14, fiber: 3, sugar: 3 },
      suitableFor: ['fitness', 'weight_loss'],
      tags: ['18g Protein', '240 kcal', 'Eggetarian', 'High Protein', 'Breakfast', 'Weight Loss'],
      portionSize: '1 omelette + salad (280g)',
      preparationTimeMinutes: 15,
      rating: 4.8,
      totalReviews: 2210,
    },
    {
      chef: chef._id,
      category: categories[1]._id, // Diabetic Friendly
      name: 'Cauliflower Rice Bowl',
      description:
        'Fluffy riced cauliflower gently sautéed with steamed broccoli florets, sweet corn, green peas, diced bell peppers, roasted cumin, and cooling minted hung curd dip. Ultra low carb and keto friendly.',
      images: [
        '/food-images/cauliflower-rice-bowl-1.jpg',
        '/food-images/cauliflower-rice-bowl-2.jpg',
        '/food-images/cauliflower-rice-bowl-3.jpg',
        '/food-images/cauliflower-rice-bowl-4.jpg',
      ],
      price: 169,
      discountPrice: 169,
      isVeg: true,
      nutrition: { calories: 180, protein: 8, carbs: 14, fat: 5, fiber: 8, sugar: 4 },
      suitableFor: ['diabetic_friendly', 'weight_loss'],
      tags: ['Diabetic Friendly', 'Pure Veg', 'Keto', 'Low Carb', 'Weight Loss', '8g Protein', 'Salad'],
      portionSize: '1 bowl (320g)',
      preparationTimeMinutes: 15,
      rating: 4.7,
      totalReviews: 1780,
    },
    {
      chef: chef._id,
      category: categories[1]._id, // Diabetic Friendly
      name: 'Vegetable Pongal',
      description:
        'Traditional moong dal and foxtail millet slow-cooked to a comforting creamy texture with carrots, beans, peas, tempered with golden cashews, crushed black pepper, cumin, ginger, and curry leaves.',
      images: [
        '/food-images/vegetable-pongal-1.jpg',
        '/food-images/vegetable-pongal-2.jpg',
        '/food-images/vegetable-pongal-3.jpg',
        '/food-images/vegetable-pongal-4.jpg',
      ],
      price: 149,
      discountPrice: 149,
      isVeg: true,
      nutrition: { calories: 270, protein: 12, carbs: 44, fat: 6, fiber: 9, sugar: 3 },
      suitableFor: ['diabetic_friendly', 'heart_healthy', 'weight_loss'],
      tags: ['Diabetic Friendly', 'Pure Veg', 'Breakfast', 'High Fiber', '12g Protein'],
      portionSize: '1 bowl + chutney + sambar (350g)',
      preparationTimeMinutes: 15,
      rating: 4.8,
      totalReviews: 2890,
    },
    {
      chef: chef._id,
      category: categories[2]._id, // High Protein
      name: 'Paneer Butter Masala',
      description:
        'Succulent cottage cheese cubes simmered in a luscious cashew-tomato gravy, finished with cold-pressed butter, fresh kasuri methi, and a light swirl of low-fat cream. Served with whole wheat roti.',
      images: [
        '/food-images/paneer-butter-masala-1.jpg',
        '/food-images/paneer-butter-masala-2.jpg',
        '/food-images/paneer-butter-masala-3.jpg',
        '/food-images/paneer-butter-masala-4.jpg',
      ],
      price: 239,
      discountPrice: 239,
      isVeg: true,
      nutrition: { calories: 380, protein: 22, carbs: 16, fat: 24, fiber: 5, sugar: 6 },
      suitableFor: ['fitness'],
      tags: ['22g Protein', '380 kcal', 'Pure Veg', 'High Protein'],
      portionSize: '1 bowl + 2 rotis (350g)',
      preparationTimeMinutes: 20,
      rating: 4.9,
      totalReviews: 3820,
    },
    {
      chef: chef._id,
      category: categories[3]._id, // Weight Loss Meals
      name: 'Vegetable Biryani',
      description:
        'Fragrant long-grain aged basmati rice layered with garden-fresh cauliflower florets, carrots, french beans, green peas, and whole aromatics. Garnished with golden fried onions, roasted whole cashews, fresh mint, and served with cool cucumber raita and spicy salan.',
      images: [
        '/food-images/vegetable-biryani-1.jpg',
        '/food-images/vegetable-biryani-2.jpg',
        '/food-images/vegetable-biryani-3.jpg',
        '/food-images/vegetable-biryani-4.jpg',
      ],
      price: 219,
      discountPrice: 219,
      isVeg: true,
      nutrition: { calories: 360, protein: 12, carbs: 58, fat: 8, fiber: 7, sugar: 4 },
      suitableFor: ['weight_loss', 'diabetic_friendly'],
      tags: ['12g Protein', '360 kcal', 'Pure Veg', 'High Fiber', 'Biryani'],
      portionSize: '1 handi (350g)',
      preparationTimeMinutes: 25,
      rating: 4.8,
      totalReviews: 2740,
    },
    {
      chef: chef._id,
      category: categories[1]._id, // Diabetic Friendly
      name: 'Millet Dosa with Sambar',
      description:
        'Golden crisp roasted fermented millet crepe (kodo and barnyard millet) served on a banana leaf with steaming hot drumstick-lentil sambar, fresh grated coconut chutney, and roasted tomato chutney. Zero refined flour and low glycemic index.',
      images: [
        '/food-images/millet-dosa-sambar-1.jpg',
        '/food-images/millet-dosa-sambar-2.jpg',
        '/food-images/millet-dosa-sambar-3.jpg',
        '/food-images/millet-dosa-sambar-4.jpg',
      ],
      price: 139,
      discountPrice: 139,
      isVeg: true,
      nutrition: { calories: 220, protein: 10, carbs: 36, fat: 4, fiber: 9, sugar: 2 },
      suitableFor: ['diabetic_friendly', 'weight_loss'],
      tags: ['Diabetic Friendly', 'Pure Veg', 'Breakfast', 'Low GI', 'High Fiber', '10g Protein'],
      portionSize: '2 dosas + chutney + sambar (300g)',
      preparationTimeMinutes: 15,
      rating: 4.9,
      totalReviews: 3120,
    },
    {
      chef: chef._id,
      category: categories[2]._id, // High Protein
      name: 'Chicken Biryani',
      description:
        'Authentic dum-cooked fragrant saffron basmati rice layered with succulent bone-in tender chicken, whole spices, caramelized shallots, fresh coriander, and mint. Served in a copper handi with creamy onion raita and rich mirchi ka salan.',
      images: [
        '/food-images/chicken-biryani-1.jpg',
        '/food-images/chicken-biryani-2.jpg',
        '/food-images/chicken-biryani-3.jpg',
        '/food-images/chicken-biryani-4.jpg',
      ],
      price: 279,
      discountPrice: 279,
      isVeg: false,
      nutrition: { calories: 480, protein: 36, carbs: 52, fat: 12, fiber: 5, sugar: 3 },
      suitableFor: ['fitness', 'weight_loss'],
      tags: ['36g Protein', '480 kcal', 'Non-Veg', 'High Protein', 'Dum Biryani'],
      portionSize: '1 handi (450g)',
      preparationTimeMinutes: 25,
      rating: 4.9,
      totalReviews: 4520,
    },
    {
      chef: chef._id,
      category: categories[2]._id, // High Protein
      name: 'Grilled Chicken with Vegetables',
      description:
        'Thick-cut chicken breast seasoned with crushed rosemary, black pepper, and garlic herb oil, flame-grilled and sliced alongside charred broccoli, zucchini, bell peppers, sweet potatoes, and yogurt tartar dip.',
      images: [
        '/food-images/grilled-chicken-vegetables-1.jpg',
        '/food-images/grilled-chicken-vegetables-2.jpg',
        '/food-images/grilled-chicken-vegetables-3.jpg',
        '/food-images/grilled-chicken-vegetables-4.jpg',
      ],
      price: 269,
      discountPrice: 269,
      isVeg: false,
      nutrition: { calories: 350, protein: 44, carbs: 12, fat: 9, fiber: 6, sugar: 3 },
      suitableFor: ['fitness', 'weight_loss'],
      tags: ['44g Protein', '350 kcal', 'Non-Veg', 'High Protein', 'Keto', 'Grills'],
      portionSize: '1 plate (350g)',
      preparationTimeMinutes: 20,
      rating: 4.9,
      totalReviews: 3210,
    },
    {
      chef: chef._id,
      category: categories[2]._id, // High Protein
      name: 'Fish Curry with Rice',
      description:
        'Traditional coastal sea bass steaks simmered in a tangy tomato-tamarind and coconut gravy tempered with curry leaves and mustard seeds. Served with steamed fragrant ponni rice, poriyal, lemon, and crispy appalam.',
      images: [
        '/food-images/fish-curry-rice-1.jpg',
        '/food-images/fish-curry-rice-2.jpg',
        '/food-images/fish-curry-rice-3.jpg',
        '/food-images/fish-curry-rice-4.jpg',
      ],
      price: 289,
      discountPrice: 289,
      isVeg: false,
      nutrition: { calories: 420, protein: 34, carbs: 48, fat: 10, fiber: 4, sugar: 3 },
      suitableFor: ['fitness', 'heart_healthy'],
      tags: ['34g Protein', '420 kcal', 'Non-Veg', 'High Protein', 'Omega 3'],
      portionSize: '1 thali (420g)',
      preparationTimeMinutes: 25,
      rating: 4.9,
      totalReviews: 3670,
    },
    {
      chef: chef._id,
      category: categories[2]._id, // High Protein
      name: 'Egg Fried Rice',
      description:
        'Fragrant basmati wok-tossed with triple scrambled farm eggs, sweet carrots, crunchy green peas, spring onion greens, cracked black pepper, and low-sodium soy reduction. High in bio-available protein and low in unhealthy oils.',
      images: [
        '/food-images/egg-fried-rice-1.jpg',
        '/food-images/egg-fried-rice-2.jpg',
        '/food-images/egg-fried-rice-3.jpg',
        '/food-images/egg-fried-rice-4.jpg',
      ],
      price: 179,
      discountPrice: 179,
      isVeg: false,
      nutrition: { calories: 340, protein: 22, carbs: 42, fat: 10, fiber: 4, sugar: 2 },
      suitableFor: ['fitness', 'weight_loss'],
      tags: ['22g Protein', '340 kcal', 'Eggetarian', 'High Protein', 'Asian'],
      portionSize: '1 bowl (350g)',
      preparationTimeMinutes: 20,
      rating: 4.8,
      totalReviews: 2640,
    },
    {
      chef: chef._id,
      category: categories[0]._id, // Healthy Breakfast
      name: 'Mini Idli',
      description:
        'Bite-sized soft steamed button idlis tossed with cold-pressed gingelly oil, mustard tempering, and fresh curry leaves. Served on a banana leaf alongside piping hot vegetable sambar, creamy coconut chutney, and spicy tomato chutney.',
      images: [
        '/food-images/mini-idli-1.jpg',
        '/food-images/mini-idli-2.jpg',
        '/food-images/mini-idli-3.jpg',
        '/food-images/mini-idli-4.jpg',
      ],
      price: 119,
      discountPrice: 119,
      isVeg: true,
      nutrition: { calories: 210, protein: 8, carbs: 40, fat: 2, fiber: 5, sugar: 2 },
      suitableFor: ['diabetic_friendly', 'weight_loss'],
      tags: ['Pure Veg', 'Breakfast', 'Low Calorie', '8g Protein', 'South Indian'],
      portionSize: '14 mini idlis + chutney + sambar (320g)',
      preparationTimeMinutes: 15,
      rating: 4.9,
      totalReviews: 3410,
    },
    {
      chef: chef._id,
      category: categories[3]._id, // Weight Loss Meals
      name: 'Vegetable Sandwich',
      description:
        'Crispy panini-pressed multigrain bread loaded with crunchy Persian cucumbers, ripe tomatoes, grated carrots, red onion rings, fresh romaine lettuce, and mint yogurt spread. Served with baked potato wedges and tomato salsa.',
      images: [
        '/food-images/vegetable-sandwich-1.jpg',
        '/food-images/vegetable-sandwich-2.jpg',
        '/food-images/vegetable-sandwich-3.jpg',
        '/food-images/vegetable-sandwich-4.jpg',
      ],
      price: 149,
      discountPrice: 149,
      isVeg: true,
      nutrition: { calories: 260, protein: 11, carbs: 38, fat: 7, fiber: 8, sugar: 4 },
      suitableFor: ['weight_loss', 'diabetic_friendly'],
      tags: ['Pure Veg', 'High Fiber', 'Weight Loss', '11g Protein', 'Breakfast'],
      portionSize: '2 grilled halves + wedges (280g)',
      preparationTimeMinutes: 15,
      rating: 4.7,
      totalReviews: 2190,
    },
    {
      chef: chef._id,
      category: categories[2]._id, // High Protein
      name: 'Chicken Rice Bowl',
      description:
        'Herb-crusted char-grilled chicken breast slices over wholesome brown rice bed, paired with shredded purple cabbage, sweet corn, baby cucumbers, cherry tomatoes, and garlic hung-curd ranch dressing.',
      images: [
        '/food-images/chicken-rice-bowl-1.jpg',
        '/food-images/chicken-rice-bowl-2.jpg',
        '/food-images/chicken-rice-bowl-3.jpg',
        '/food-images/chicken-rice-bowl-4.jpg',
      ],
      price: 259,
      discountPrice: 259,
      isVeg: false,
      nutrition: { calories: 390, protein: 42, carbs: 32, fat: 8, fiber: 7, sugar: 3 },
      suitableFor: ['fitness', 'weight_loss'],
      tags: ['42g Protein', '390 kcal', 'Non-Veg', 'High Protein', 'Salad'],
      portionSize: '1 bowl (380g)',
      preparationTimeMinutes: 20,
      rating: 4.9,
      totalReviews: 3980,
    },
    {
      chef: chef._id,
      category: categories[3]._id, // Weight Loss Meals
      name: 'Vegetable Pasta',
      description:
        'Al-dente 100% durum whole wheat penne pasta sautéed with charred broccoli florets, sweet tri-color bell peppers, zucchini, blistered cherry tomatoes, fresh basil, and light garlic olive oil with micro-planed parmesan.',
      images: [
        '/food-images/vegetable-pasta-1.jpg',
        '/food-images/vegetable-pasta-2.jpg',
        '/food-images/vegetable-pasta-3.jpg',
        '/food-images/vegetable-pasta-4.jpg',
      ],
      price: 229,
      discountPrice: 229,
      isVeg: true,
      nutrition: { calories: 320, protein: 14, carbs: 54, fat: 6, fiber: 9, sugar: 4 },
      suitableFor: ['weight_loss', 'heart_healthy'],
      tags: ['Pure Veg', 'High Fiber', 'Whole Wheat', '14g Protein'],
      portionSize: '1 bowl (350g)',
      preparationTimeMinutes: 20,
      rating: 4.8,
      totalReviews: 2870,
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
