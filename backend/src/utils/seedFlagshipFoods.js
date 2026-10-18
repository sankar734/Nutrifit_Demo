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
    }

    let diabeticCat = await Category.findOne({ name: /diabetic/i });
    if (!diabeticCat) {
      diabeticCat = await Category.create({
        name: 'Diabetic Friendly',
        slug: 'diabetic-friendly',
        description: 'Low glycemic index, fiber-rich blood sugar balancing meals',
        icon: 'Droplet',
        isActive: true,
      });
    }

    let chef = await Chef.findOne();
    if (!chef) {
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

    const allDishes = [
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
        tags: ['42g Protein', '380 kcal', 'Non-Veg', 'High Protein', 'Keto', 'Weight Loss', 'Grills'],
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
        tags: ['24g Protein', '320 kcal', 'Pure Veg', 'High Protein', 'Diabetic Friendly', 'Keto', 'Grills'],
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
        tags: ['16g Protein', '210 kcal', 'Vegan', 'Pure Veg', 'High Protein', 'Weight Loss', 'Diabetic Friendly', 'Salad'],
      },
      {
        name: 'Ragi Idli with Sambar',
        category: diabeticCat._id,
        chef: chefId,
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
        rating: 4.8,
        totalReviews: 2150,
        nutrition: { calories: 230, protein: 9, carbs: 42, fat: 3, fiber: 8, sugar: 3 },
        suitableFor: ['diabetic_friendly', 'weight_loss'],
        tags: ['Diabetic Friendly', 'Pure Veg', 'Breakfast', 'Low GI', 'High Fiber', '9g Protein'],
      },
      {
        name: 'Vegetable Oats Upma',
        category: diabeticCat._id,
        chef: chefId,
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
        rating: 4.7,
        totalReviews: 1840,
        nutrition: { calories: 260, protein: 11, carbs: 38, fat: 7, fiber: 7, sugar: 4 },
        suitableFor: ['diabetic_friendly', 'weight_loss'],
        tags: ['Diabetic Friendly', 'Pure Veg', 'Breakfast', 'High Fiber', 'Weight Loss', '11g Protein'],
      },
      {
        name: 'Multigrain Chapati with Vegetable Curry',
        category: diabeticCat._id,
        chef: chefId,
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
        rating: 4.8,
        totalReviews: 2650,
        nutrition: { calories: 340, protein: 14, carbs: 52, fat: 8, fiber: 10, sugar: 5 },
        suitableFor: ['diabetic_friendly', 'weight_loss', 'fitness'],
        tags: ['Diabetic Friendly', 'Pure Veg', 'Low GI', 'High Fiber', '14g Protein'],
      },
      {
        name: 'Grilled Fish with Vegetables',
        category: highProteinCat._id,
        chef: chefId,
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
        rating: 4.9,
        totalReviews: 3420,
        nutrition: { calories: 360, protein: 38, carbs: 10, fat: 9, fiber: 4, sugar: 3 },
        suitableFor: ['fitness', 'weight_loss'],
        tags: ['38g Protein', '360 kcal', 'Non-Veg', 'High Protein', 'Keto', 'Grills'],
      },
      {
        name: 'Grilled Chicken Salad',
        category: saladCat._id,
        chef: chefId,
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
        rating: 4.9,
        totalReviews: 2910,
        nutrition: { calories: 310, protein: 36, carbs: 14, fat: 7, fiber: 6, sugar: 4 },
        suitableFor: ['weight_loss', 'fitness'],
        tags: ['36g Protein', '310 kcal', 'Non-Veg', 'High Protein', 'Weight Loss', 'Salad', 'Grills'],
      },
      {
        name: 'Paneer Bhurji',
        category: highProteinCat._id,
        chef: chefId,
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
        rating: 4.8,
        totalReviews: 2530,
        nutrition: { calories: 340, protein: 26, carbs: 12, fat: 21, fiber: 4, sugar: 3 },
        suitableFor: ['fitness', 'weight_loss'],
        tags: ['26g Protein', '340 kcal', 'Pure Veg', 'High Protein', 'Keto'],
      },
      {
        name: 'Vegetable Omelette',
        category: breakfastCat._id,
        chef: chefId,
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
        rating: 4.8,
        totalReviews: 2210,
        nutrition: { calories: 240, protein: 18, carbs: 8, fat: 14, fiber: 3, sugar: 3 },
        suitableFor: ['fitness', 'weight_loss'],
        tags: ['18g Protein', '240 kcal', 'Eggetarian', 'High Protein', 'Breakfast', 'Weight Loss'],
      },
      {
        name: 'Cauliflower Rice Bowl',
        category: diabeticCat._id,
        chef: chefId,
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
        rating: 4.7,
        totalReviews: 1780,
        nutrition: { calories: 180, protein: 8, carbs: 14, fat: 5, fiber: 8, sugar: 4 },
        suitableFor: ['diabetic_friendly', 'weight_loss'],
        tags: ['Diabetic Friendly', 'Pure Veg', 'Keto', 'Low Carb', 'Weight Loss', '8g Protein', 'Salad'],
      },
      {
        name: 'Vegetable Pongal',
        category: diabeticCat._id,
        chef: chefId,
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
        rating: 4.8,
        totalReviews: 2890,
        nutrition: { calories: 270, protein: 12, carbs: 44, fat: 6, fiber: 9, sugar: 3 },
        suitableFor: ['diabetic_friendly', 'heart_healthy', 'weight_loss'],
        tags: ['Diabetic Friendly', 'Pure Veg', 'Breakfast', 'High Fiber', '12g Protein'],
      },
      {
        name: 'Paneer Butter Masala',
        category: highProteinCat._id,
        chef: chefId,
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
        rating: 4.9,
        totalReviews: 3820,
        nutrition: { calories: 380, protein: 22, carbs: 16, fat: 24, fiber: 5, sugar: 6 },
        suitableFor: ['fitness'],
        tags: ['22g Protein', '380 kcal', 'Pure Veg', 'High Protein'],
      },
    ];

    for (const d of allDishes) {
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

    console.log('Finished seeding all 14 flagship multi-angle dishes successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding dishes:', err);
    process.exit(1);
  }
}

seedFlagshipFoods();
