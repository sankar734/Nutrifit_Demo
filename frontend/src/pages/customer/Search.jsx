import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search as SearchIcon, 
  Flame, 
  Droplet, 
  Scale, 
  ShieldCheck, 
  Sparkles, 
  Leaf, 
  ChevronDown, 
  X,
  SlidersHorizontal,
  Clock
} from 'lucide-react';
import MobileLayout from '../../components/customer/MobileLayout';
import DesktopSidebar from '../../components/customer/DesktopSidebar';
import FoodCard from '../../components/customer/FoodCard';
import Toast from '../../components/customer/Toast';
import { foodApi } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useDeviceMode } from '../../context/DeviceModeContext';
import { useToast } from '../../hooks/useToast';
import sampleFoods from '../../data/sampleFoods';

// Category pills at the top of Desktop Explore view
const desktopCategoryPills = [
  { id: 'all', label: 'All Dishes', icon: Sparkles },
  { id: 'high-protein', label: 'High Protein', icon: Flame },
  { id: 'diabetic-friendly', label: 'Diabetic Friendly', icon: Droplet },
  { id: 'grill', label: 'Grills & Tandoor', icon: Flame },
  { id: 'breakfast', label: 'Healthy Breakfast', icon: Clock },
  { id: 'salads', label: 'Salads & Bowls', icon: Leaf },
  { id: 'weight-loss', label: 'Weight Loss', icon: Scale },
  { id: 'pure-veg', label: 'Pure Veg', icon: Leaf },
  { id: 'non-veg', label: 'Non-Veg', icon: Flame },
];

// Mobile top chips
const mobileChips = [
  { id: 'all', label: 'All Dishes' },
  { id: 'high-protein', label: 'High Protein' },
  { id: 'diabetic-friendly', label: 'Diabetic Friendly' },
  { id: 'grill', label: 'Grills' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'salads', label: 'Salads' },
  { id: 'pure-veg', label: 'Pure Veg' },
  { id: 'non-veg', label: 'Non-Veg' },
];

const dietTypesList = [
  'All',
  'High Protein',
  'Diabetic Friendly',
  'Low Carb',
  'Pure Veg',
  'Non-Veg',
];

const cuisinesList = [
  'South Indian',
  'North Indian',
  'Continental',
  'Chinese',
  'Salad & Bowls',
];

const Search = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { addToCart } = useCart() || {};
  const { isMobileView } = useDeviceMode();
  const { message, showToast } = useToast();

  const [foods, setFoods] = useState(sampleFoods);
  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedDietTypes, setSelectedDietTypes] = useState(['All']);
  const [maxPrice, setMaxPrice] = useState(500);
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [sortBy, setSortBy] = useState('popular');
  const [showMoreCuisines, setShowMoreCuisines] = useState(false);

  // Sync with live API data if available
  useEffect(() => {
    foodApi
      .list({ limit: 20 })
      .then(({ data }) => {
        if (data.data.foods?.length >= 4) {
          const apiFoods = data.data.foods;
          const merged = [...sampleFoods];
          apiFoods.forEach((af) => {
            const idx = merged.findIndex((m) => m.name.toLowerCase() === af.name.toLowerCase());
            if (idx >= 0) {
              merged[idx] = { ...merged[idx], ...af };
            } else {
              merged.push(af);
            }
          });
          setFoods(merged);
        }
      })
      .catch(() => {});
  }, []);

  const handleAdd = async (food) => {
    const res = await addToCart?.(food._id, 1, food);
    if (res && res.success === false) {
      showToast(`⚠️ ${res.message}`);
    } else {
      showToast(`🛒 ${food.name} added to cart!`);
    }
  };

  const toggleDietType = (type) => {
    if (type === 'All') {
      setSelectedDietTypes(['All']);
      return;
    }
    const withoutAll = selectedDietTypes.filter((t) => t !== 'All');
    if (withoutAll.includes(type)) {
      const next = withoutAll.filter((t) => t !== type);
      setSelectedDietTypes(next.length ? next : ['All']);
    } else {
      setSelectedDietTypes([...withoutAll, type]);
    }
  };

  const toggleCuisine = (cuisine) => {
    if (selectedCuisines.includes(cuisine)) {
      setSelectedCuisines(selectedCuisines.filter((c) => c !== cuisine));
    } else {
      setSelectedCuisines([...selectedCuisines, cuisine]);
    }
  };

  // Filter foods based on criteria
  const filteredFoods = useMemo(() => {
    return foods.filter((f) => {
      // 1. Text Search Query
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesName = f.name.toLowerCase().includes(q);
        const matchesDesc = f.description?.toLowerCase().includes(q);
        const matchesCuisine = f.cuisine?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCuisine) return false;
      }

      // 2. Top Category Pills
      const catName =
        typeof f.category === 'object' && f.category !== null
          ? (f.category.name || '')
          : (f.category || '');

      if (activeCategory === 'high-protein') {
        const hasProteinTag = f.dietaryTags?.some((t) => t.toLowerCase().includes('protein'));
        const hasProteinMacro = (f.nutrition?.protein || 0) >= 15;
        const hasProteinCat = catName.toLowerCase().includes('protein');
        if (!hasProteinTag && !hasProteinMacro && !hasProteinCat) {
          return false;
        }
      } else if (activeCategory === 'diabetic-friendly') {
        const isDiabetic =
          f.dietaryTags?.some((t) => t.toLowerCase().includes('diabetic')) ||
          catName.toLowerCase().includes('diabetic') ||
          f.suitableFor?.includes('diabetic_friendly');
        if (!isDiabetic) return false;
      } else if (activeCategory === 'grill') {
        const isGrill =
          f.name?.toLowerCase().includes('grill') ||
          f.name?.toLowerCase().includes('tikka') ||
          catName.toLowerCase().includes('grill');
        if (!isGrill) return false;
      } else if (activeCategory === 'breakfast') {
        const isBreakfast =
          catName.toLowerCase().includes('breakfast') ||
          f.name?.toLowerCase().includes('omelette') ||
          f.dietaryTags?.some((t) => t.toLowerCase().includes('breakfast'));
        if (!isBreakfast) return false;
      } else if (activeCategory === 'salads') {
        const isSalad =
          f.name?.toLowerCase().includes('salad') ||
          catName.toLowerCase().includes('salad');
        if (!isSalad) return false;
      } else if (activeCategory === 'weight-loss') {
        const isWeightLoss =
          f.dietaryTags?.some((t) => t.toLowerCase().includes('weight')) ||
          catName.toLowerCase().includes('weight');
        if (!isWeightLoss && (f.nutrition?.calories || 0) > 350) {
          return false;
        }
      } else if (activeCategory === 'pure-veg') {
        if (!f.isVeg) return false;
      } else if (activeCategory === 'non-veg') {
        if (f.isVeg) return false;
      }

      // 3. Price Filter
      if (f.price > maxPrice) return false;

      // 4. Diet Type Checkboxes
      if (!selectedDietTypes.includes('All')) {
        const wantsVeg = selectedDietTypes.includes('Pure Veg');
        const wantsNonVeg = selectedDietTypes.includes('Non-Veg');
        const wantsHighProtein = selectedDietTypes.includes('High Protein');
        const wantsDiabetic = selectedDietTypes.includes('Diabetic Friendly');

        if (wantsVeg && !f.isVeg) return false;
        if (wantsNonVeg && f.isVeg) return false;
        if (wantsHighProtein && (f.nutrition?.protein || 0) < 14) return false;
        if (wantsDiabetic && !f.dietaryTags?.some((t) => t.toLowerCase().includes('diabetic')) && f.name !== 'Quinoa Delight') return false;
      }

      // 5. Cuisine Filter
      if (selectedCuisines.length > 0) {
        if (!selectedCuisines.includes(f.cuisine) && !selectedCuisines.includes(catName)) {
          return false;
        }
      }

      return true;
    });
  }, [foods, query, activeCategory, selectedDietTypes, maxPrice, selectedCuisines]);

  return (
    <MobileLayout fullWidth={!isMobileView}>
      <Toast message={message} />

      {/* ========================================================================= */}
      {/* 1. DESKTOP VIEW LAYOUT (Matches Screen 2: Explore Page - Desktop View)     */}
      {/* ========================================================================= */}
      {!isMobileView ? (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-8 items-start">
            
            {/* 1.1 LEFT NAVIGATION SIDEBAR (Explore highlighted) */}
            <DesktopSidebar activeItem="explore" />

            {/* 1.2 MAIN CONTENT COLUMN */}
            <div className="flex-1 min-w-0 space-y-6">
              
              {/* TOP CATEGORY PILLS (All Dishes, High Protein, Diabetic Friendly, etc.) */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {desktopCategoryPills.map((pill) => {
                  const Icon = pill.icon;
                  const isActive = activeCategory === pill.id;
                  return (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => setActiveCategory(pill.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-2xs ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 scale-102'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80'
                      }`}
                    >
                      <Icon size={14} className={isActive ? 'text-white' : 'text-purple-600'} />
                      <span>{pill.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* SPLIT LAYOUT: FILTERS PANEL (LEFT) + HEALTHY MEALS GRID (RIGHT) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
                
                {/* 1.3 LEFT FILTERS PANEL (260px / 3 cols) */}
                <div className="lg:col-span-3 bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-6">
                  
                  {/* Filters Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-sm font-black text-slate-900 tracking-wide">
                      Filters
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDietTypes(['All']);
                        setSelectedCuisines([]);
                        setMaxPrice(500);
                        setActiveCategory('all');
                      }}
                      className="text-xs font-bold text-purple-700 hover:underline"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Section A: Diet Type */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Diet Type
                    </h4>
                    <div className="space-y-2">
                      {dietTypesList.map((type) => {
                        const isChecked = selectedDietTypes.includes(type);
                        return (
                          <label
                            key={type}
                            className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleDietType(type)}
                              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 rounded-sm cursor-pointer accent-purple-600"
                            />
                            <span>{type}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section B: Price Range */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        Price Range
                      </h4>
                      <span className="text-xs font-extrabold text-purple-700">
                        ₹0 - ₹{maxPrice}
                      </span>
                    </div>

                    <input
                      type="range"
                      min="100"
                      max="500"
                      step="10"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                    />
                  </div>

                  {/* Section C: Cuisine */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Cuisine
                    </h4>
                    <div className="space-y-2">
                      {cuisinesList.map((cuisine) => {
                        const isChecked = selectedCuisines.includes(cuisine);
                        return (
                          <label
                            key={cuisine}
                            className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCuisine(cuisine)}
                              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 rounded-sm cursor-pointer accent-purple-600"
                            />
                            <span>{cuisine}</span>
                          </label>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowMoreCuisines(!showMoreCuisines)}
                      className="text-xs font-bold text-purple-700 hover:underline pt-1 inline-block"
                    >
                      {showMoreCuisines ? 'Show less' : 'Show more'}
                    </button>
                  </div>

                </div>

                {/* 1.4 RIGHT MEALS GRID (9 cols) */}
                <div className="lg:col-span-9 space-y-4">
                  
                  {/* Header Row: Healthy Meals title + Sort Dropdown */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        Healthy Meals
                      </h2>
                      <p className="text-xs text-slate-500 font-medium">
                        {filteredFoods.length > 0 ? `${filteredFoods.length} meals found` : '32 meals found'}
                      </p>
                    </div>

                    {/* Sort By Dropdown */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 font-medium">Sort by</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-500 cursor-pointer shadow-2xs"
                      >
                        <option value="popular">Popular</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                      </select>
                    </div>
                  </div>

                  {/* 3x2 Grid of 6 Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredFoods.map((f) => (
                      <FoodCard key={f._id} food={f} onAdd={handleAdd} variant="grid" />
                    ))}
                  </div>

                </div>

              </div>

            </div>
          </div>
        </div>
      ) : (

        /* ========================================================================= */
        /* 2. MOBILE VIEW LAYOUT (Matches Screen 5: Explore Page - Mobile View)       */
        /* ========================================================================= */
        <div className="p-4 space-y-4 max-w-md mx-auto">
          
          {/* 2.1 TITLE */}
          <div className="pt-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Explore
            </h1>
          </div>

          {/* 2.2 SEARCH INPUT */}
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dishes, ingredients, cuisine..."
              className="w-full pl-10 pr-10 py-2.5 rounded-full bg-slate-100 focus:bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium"
            />
            <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* 2.3 HORIZONTAL CHIPS (All | High Protein | Diabetic) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {mobileChips.map((chip) => {
              const isActive = activeCategory === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setActiveCategory(chip.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* 2.4 COMPACT FOOD LIST (VERTICAL ROWS) */}
          <div className="space-y-3 pt-1">
            {filteredFoods.map((f) => (
              <FoodCard key={f._id} food={f} onAdd={handleAdd} variant="compact" />
            ))}
          </div>

        </div>
      )}
    </MobileLayout>
  );
};

export default Search;
