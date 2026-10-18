const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const Food = require('../models/Food');
const Category = require('../models/Category');
const Chef = require('../models/Chef');

async function seedFlagshipFoods() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nutrichef');
    console.log('Connected to MongoDB');

    // Ensure Categories
    let highProteinCat = await Category.findOne({ name: /high protein/i });
    if (!highProteinCat) {
      highProteinCat = await Category.create({
        name: 'High Protein',
        slug: 'high-protein',
        description: 'Muscle building, lean protein healthy meals',
        icon: 'Flame',
        isActive: true,
      });
      console.log('Created High Protein category');
    }

    let breakfastCat = await Category.findOne({ name: /breakfast/i });
    if (!breakfastCat) {
      breakfastCat = await Category.create({
        name: 'Healthy Breakfast',
        slug: 'healthy-breakfast',
        description: 'Energizing wholesome morning breakfasts',
        icon: 'Clock',
        isActive: true,
      });
      console.log('Created Breakfast category');
    }

    let saladCat = await Category.findOne({ name: /salad/i });
    if (!saladCat) {
      saladCat = await Category.create({
        name: 'Salad & Bowls',
        slug: 'salad-bowls',
        description: 'Fresh fiber-rich nutritious salads and bowls',
        icon: 'Leaf',
        isActive: true,
      });
      console.log('Created Salad category');
    }

    let chef = await Chef.findOne();
    if (!chef) {
      console.log('No chef found, looking for user with role chef');
      const User = require('../models/User');
      let chefUser = await User.findOne({ role: 'chef' });
      if (chefUser) {
        chef = await Chef.create({
          user: chefUser._id,
          kitchenName: "Sankar's Healthy Kitchen",
          description: 'Specialist in high-protein & diet meal prep',
          rating: 4.9,
          totalReviews: 2840,
        });
      }
    }
    const chefId = chef ? chef._id : null;

    const flagshipDishes = [
      {
        name: 'Grilled Chicken Breast',
        category: highProteinCat._id,
        chef: chefId,
        description:
          'Herb-marinated tender chicken breast flame-grilled with fresh zucchini, steamed broccoli florets, sweet peppers, and low-fat garlic herb yogurt dip. Packed with clean lean protein.',
        images: [
          '/food-images/grilled-chicken-breast-1.jpg',
          '/food-images/grilled-chicken-breast-2.jpg',
          '/food-images/grilled-chicken-breast-3.jpg',
          '/food-images/grilled-chicken-breast-4.jpg',
        ],
        price: 249,
        discountPrice: 249,
        isVeg: false,
        rating: 4.9,
        totalReviews: 2840,
        nutrition: { calories: 380, protein: 42, carbs: 12, fat: 8, fiber: 5, sugar: 3 },
        suitableFor: ['fitness', 'weight_loss'],
        tags: ['42g Protein', '380 kcal', 'Non-Veg', 'High Protein', 'Keto', 'Weight Loss'],
      },
      {
        name: 'Paneer Tikka',
        category: highProteinCat._id,
        chef: chefId,
        description:
          'Farm-fresh cottage cheese cubes steeped in hung curd marinade, cold-pressed mustard oil, and carom seeds, skewered with bell peppers and roasted in tandoor. Served with cooling mint dip and lemon.',
        images: [
          '/food-images/paneer-tikka-1.jpg',
          '/food-images/paneer-tikka-2.jpg',
          '/food-images/paneer-tikka-3.jpg',
          '/food-images/paneer-tikka-4.jpg',
        ],
        price: 219,
        discountPrice: 219,
        isVeg: true,
        rating: 4.8,
        totalReviews: 3150,
        nutrition: { calories: 320, protein: 24, carbs: 14, fat: 18, fiber: 4, sugar: 4 },
        suitableFor: ['fitness', 'diabetic_friendly'],
        tags: ['24g Protein', '320 kcal', 'Pure Veg', 'High Protein', 'Diabetic Friendly', 'Keto'],
      },
      {
        name: 'Egg White Omelette',
        category: breakfastCat._id,
        chef: chefId,
        description:
          'Light and fluffy triple egg-white folded omelette packed with colorful bell peppers, juicy diced tomatoes, fresh oregano, and spicy tomato salsa. Ultra low calorie and protein dense.',
        images: [
          '/food-images/egg-white-omelette-1.jpg',
          '/food-images/egg-white-omelette-2.jpg',
          '/food-images/egg-white-omelette-3.jpg',
          '/food-images/egg-white-omelette-4.jpg',
        ],
        price: 149,
        discountPrice: 149,
        isVeg: false,
        rating: 4.7,
        totalReviews: 1920,
        nutrition: { calories: 190, protein: 22, carbs: 6, fat: 4, fiber: 3, sugar: 2 },
        suitableFor: ['weight_loss', 'fitness'],
        tags: ['22g Protein', '190 kcal', 'Eggetarian', 'High Protein', 'Weight Loss', 'Breakfast'],
      },
      {
        name: 'Sprouts Protein Salad',
        category: saladCat._id,
        chef: chefId,
        description:
          'Organic sprouted moong and black chickpeas tossed with crunchy Persian cucumbers, grated carrots, red onion, crushed pepper, and zesty lemon mustard dressing. Loaded with live enzymes and prebiotic fiber.',
        images: [
          '/food-images/sprouts-protein-salad-1.jpg',
          '/food-images/sprouts-protein-salad-2.jpg',
          '/food-images/sprouts-protein-salad-3.jpg',
          '/food-images/sprouts-protein-salad-4.jpg',
        ],
        price: 139,
        discountPrice: 139,
        isVeg: true,
        rating: 4.8,
        totalReviews: 2410,
        nutrition: { calories: 210, protein: 16, carbs: 32, fat: 3, fiber: 11, sugar: 5 },
        suitableFor: ['weight_loss', 'diabetic_friendly'],
        tags: ['16g Protein', '210 kcal', 'Vegan', 'Pure Veg', 'High Protein', 'Weight Loss', 'Diabetic Friendly'],
      },
    ];

    for (const d of flagshipDishes) {
      let existing = await Food.findOne({ name: d.name });
      if (existing) {
        existing.images = d.images;
        existing.price = d.price;
        existing.discountPrice = d.discountPrice;
        existing.description = d.description;
        existing.nutrition = d.nutrition;
        existing.tags = d.tags;
        existing.suitableFor = d.suitableFor;
        existing.category = d.category;
        existing.isVeg = d.isVeg;
        if (chefId && !existing.chef) existing.chef = chefId;
        await existing.save();
        console.log(`Updated existing dish: ${d.name} (${existing._id})`);
      } else {
        const created = await Food.create(d);
        console.log(`Created new dish: ${d.name} (${created._id})`);
      }
    }

    console.log('Finished seeding 4 flagship dishes successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding dishes:', err);
    process.exit(1);
  }
}

seedFlagshipFoods();
