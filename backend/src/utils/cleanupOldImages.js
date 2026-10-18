const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const frontendDir = path.resolve(__dirname, '../../../frontend/public/food-images');
const backendUploadsDir = path.resolve(__dirname, '../uploads');

const keepImages = new Set([
  'grilled-chicken-breast-1.jpg',
  'grilled-chicken-breast-2.jpg',
  'grilled-chicken-breast-3.jpg',
  'grilled-chicken-breast-4.jpg',
  'paneer-tikka-1.jpg',
  'paneer-tikka-2.jpg',
  'paneer-tikka-3.jpg',
  'paneer-tikka-4.jpg',
  'egg-white-omelette-1.jpg',
  'egg-white-omelette-2.jpg',
  'egg-white-omelette-3.jpg',
  'egg-white-omelette-4.jpg',
  'sprouts-protein-salad-1.jpg',
  'sprouts-protein-salad-2.jpg',
  'sprouts-protein-salad-3.jpg',
  'sprouts-protein-salad-4.jpg',
  '.gitkeep'
]);

function cleanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    if (!keepImages.has(file)) {
      const fullPath = path.join(dirPath, file);
      if (fs.lstatSync(fullPath).isFile()) {
        fs.unlinkSync(fullPath);
        console.log(`Deleted file: ${file} from ${dirPath}`);
      }
    }
  }
}

cleanDirectory(frontendDir);
cleanDirectory(backendUploadsDir);

async function cleanDatabase() {
  try {
    require('dotenv').config({ path: path.join(__dirname, '../../.env') });
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nutrichef');
    const Food = require('../models/Food');

    const flagshipNames = [
      'Grilled Chicken Breast',
      'Paneer Tikka',
      'Egg White Omelette',
      'Sprouts Protein Salad'
    ];

    const result = await Food.deleteMany({ name: { $nin: flagshipNames } });
    console.log(`Removed ${result.deletedCount} old dishes from database that used removed images.`);

    console.log('Database and disk image cleanup completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error during database cleanup:', err);
    process.exit(1);
  }
}

cleanDatabase();
