import { useEffect, useState } from 'react';
import { 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  Leaf, 
  Sparkles, 
  Clock, 
  Bell, 
  ShoppingBag, 
  MapPin, 
  ChevronDown,
  ChefHat,
  Bike
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import MobileLayout from '../../components/customer/MobileLayout';
import DesktopSidebar from '../../components/customer/DesktopSidebar';
import FoodCard from '../../components/customer/FoodCard';
import Toast from '../../components/customer/Toast';
import NotificationBell from '../../components/customer/NotificationBell';
import { foodApi, chefApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useDeviceMode } from '../../context/DeviceModeContext';
import { useToast } from '../../hooks/useToast';
import sampleFoods, { sampleChefs } from '../../data/sampleFoods';

const Home = () => {
  const { user } = useAuth();
  const { addToCart, totalItems } = useCart() || { totalItems: 0 };
  const { isMobileView } = useDeviceMode();
  const { message, showToast } = useToast();
  const navigate = useNavigate();

  const [foods, setFoods] = useState(sampleFoods);
  const [searchQuery, setSearchQuery] = useState('');

  // Fallback to sample data ensuring the 4 prototype cards always show
  useEffect(() => {
    foodApi
      .list({ sortBy: 'popular', limit: 12 })
      .then(({ data }) => {
        if (data.data.foods?.length >= 4) {
          // Merge to ensure prototype items stay at the top
          const apiFoods = data.data.foods;
          const merged = [...sampleFoods];
          apiFoods.forEach((af) => {
            if (!merged.some((mf) => mf.name === af.name)) {
              merged.push(af);
            }
          });
          setFoods(merged);
        } else {
          setFoods(sampleFoods);
        }
      })
      .catch(() => setFoods(sampleFoods));
  }, []);

  const handleAdd = async (food) => {
    const res = await addToCart?.(food._id, 1, food);
    if (res && res.success === false) {
      showToast(`⚠️ ${res.message}`);
    } else {
      showToast(`🛒 ${food.name} added to cart!`);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Popular meals for top section (ensuring the 4 flagship dishes)
  const popularMeals = [
    foods.find((f) => f.name.toLowerCase().includes('chicken')) || sampleFoods[0],
    foods.find((f) => f.name.toLowerCase().includes('paneer')) || sampleFoods[1],
    foods.find((f) => f.name.toLowerCase().includes('omelette') || f.name.toLowerCase().includes('egg')) || sampleFoods[2],
    foods.find((f) => f.name.toLowerCase().includes('sprouts') || f.name.toLowerCase().includes('salad')) || sampleFoods[3],
  ];

  return (
    <MobileLayout fullWidth={!isMobileView}>
      <Toast message={message} />

      {/* ========================================================================= */}
      {/* 1. DESKTOP VIEW LAYOUT (Matches Screen 1: Home Page - Desktop View)        */}
      {/* ========================================================================= */}
      {!isMobileView ? (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-8 items-start">
            
            {/* LEFT SIDEBAR NAVIGATION */}
            <DesktopSidebar activeItem="home" />

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 min-w-0 space-y-7">
              
              {/* 1.1 HERO BANNER (PURPLE WITH 100% HOMEMADE STAMP) */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-100/90 via-purple-50 to-indigo-100/70 border border-purple-100 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xs">
                
                {/* Left Text & CTA */}
                <div className="space-y-4 max-w-lg z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-slate-800 text-xs font-bold shadow-2xs border border-purple-100">
                    <ShieldCheck size={14} className="text-purple-600" />
                    <span>FSSAI Verified Home Chefs</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-slate-900 tracking-tight leading-[1.18]">
                    Healthy Homemade <br />
                    Food Delivered to You
                  </h1>

                  <p className="text-xs sm:text-sm font-semibold text-slate-600 tracking-wide">
                    Fresh • Nutritious • Hygienic • Personalized
                  </p>

                  <div className="pt-2">
                    <Link
                      to="/search"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow-md shadow-purple-500/25 transition transform active:scale-95 hover:scale-102"
                    >
                      <span>Order Now</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>

                {/* Right Hero Image with Circular 100% Home Made Stamp */}
                <div className="relative shrink-0">
                  <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden shadow-2xl border-4 border-white relative">
                    <img
                      src="/food-images/grilled-chicken-breast-1.jpg"
                      alt="Healthy Food Bowl"
                      className="w-full h-full object-cover transform hover:scale-105 transition duration-700"
                    />
                  </div>

                  {/* 100% Home Made Stamp Badge */}
                  <div className="absolute top-2 right-2 w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-purple-600 text-white flex flex-col items-center justify-center text-center shadow-lg border-2 border-white transform rotate-6 animate-pulse">
                    <span className="text-[10px] font-bold">100%</span>
                    <span className="text-[9px] font-extrabold leading-tight">Home Made</span>
                  </div>
                </div>
              </div>

              {/* 1.2 VALUE PROPOSITIONS BAR (4 HORIZONTAL PILLS MATCHING PROTOTYPE) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* 1. FSSAI Verified */}
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:shadow-xs transition">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-tight">FSSAI Verified</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Home Chefs</p>
                  </div>
                </div>

                {/* 2. No Preservatives */}
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:shadow-xs transition">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Leaf size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-tight">No Preservatives</h4>
                    <p className="text-[11px] text-slate-500 font-medium">100% Fresh</p>
                  </div>
                </div>

                {/* 3. Personalized Nutrition */}
                <button
                  type="button"
                  onClick={() => navigate('/nutrition')}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:shadow-xs transition text-left group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 group-hover:text-purple-700 transition leading-tight">Personalized Nutrition</h4>
                    <p className="text-[11px] text-slate-500 font-medium">AI Diet Planner →</p>
                  </div>
                </button>

                {/* 4. Fast Delivery */}
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:shadow-xs transition">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-tight">Fast Delivery</h4>
                    <p className="text-[11px] text-slate-500 font-medium">30–45 mins</p>
                  </div>
                </div>

              </div>

              {/* 1.3 POPULAR HEALTHY MEALS (4 CARDS MATCHING PROTOTYPE) */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-slate-900">
                    Popular Healthy Meals
                  </h2>
                  <Link 
                    to="/search" 
                    className="text-xs font-bold text-purple-700 hover:text-purple-800 transition flex items-center gap-1 hover:underline"
                  >
                    <span>See all</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                {/* 4 Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {popularMeals.map((f) => (
                    <FoodCard key={f._id} food={f} onAdd={handleAdd} />
                  ))}
                </div>
              </div>

              {/* Role Switcher if applicable */}
              {(user?.role === 'chef' || user?.role === 'delivery') && (
                <div className="pt-2">
                  <button
                    onClick={() => navigate(user.role === 'chef' ? '/chef' : '/delivery')}
                    className="w-full flex items-center justify-between bg-slate-900 hover:bg-slate-800 text-white rounded-2xl p-4 shadow-md transition border border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300">
                        {user.role === 'chef' ? <ChefHat size={20} /> : <Bike size={20} />}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-white">
                          Switch to {user.role === 'chef' ? 'Chef Kitchen Console' : 'Delivery Fleet Console'}
                        </p>
                        <p className="text-xs text-slate-400">Manage orders & menu items</p>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-purple-400" />
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      ) : (

        /* ========================================================================= */
        /* 2. MOBILE VIEW LAYOUT (Matches Screen 4: Home Page - Mobile View)          */
        /* ========================================================================= */
        <div className="p-4 space-y-4 max-w-md mx-auto">
          
          {/* 2.1 MOBILE TOP BAR */}
          <div className="flex items-center justify-between pt-1">
            {/* Brand Logo */}
            <Link to="/home" className="flex items-center gap-2">
              <span className="text-2xl">🥗</span>
              <span className="text-xl font-black bg-gradient-to-r from-orange-600 via-purple-700 to-indigo-700 bg-clip-text text-transparent">
                NutriFit
              </span>
            </Link>

            {/* Notification Bell & Cart Badge */}
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Link to="/cart" className="relative p-2 rounded-full hover:bg-slate-100 text-slate-700">
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* 2.2 MOBILE SEARCH BAR */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search for healthy food, chef, cuisine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-100 focus:bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </form>

          {/* 2.3 MOBILE HERO BANNER (PURPLE GRADIENT WITH BOWL IMAGE) */}
          <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden flex items-center justify-between">
            <div className="space-y-2 max-w-[200px] z-10">
              <span className="text-[10px] font-extrabold uppercase bg-white/20 px-2 py-0.5 rounded-full tracking-wide">
                FSSAI Verified Home Chefs
              </span>
              <h2 className="text-base font-black leading-snug">
                Healthy Homemade Food Delivered to You
              </h2>
              <p className="text-[10px] text-purple-200/90 leading-tight">
                Fresh • Nutritious • Hygienic
              </p>
              <Link
                to="/search"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs font-black shadow-md transition active:scale-95 mt-1 border border-purple-400/40"
              >
                <span>Order Now</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {/* Round Food Preview */}
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/80 shadow-xl shrink-0">
              <img
                src="/food-images/grilled-chicken-breast-1.jpg"
                alt="Healthy Food"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* 2.4 FOUR PILL FEATURE ICONS (MATCHING MOBILE SCREEN 4) */}
          <div className="grid grid-cols-4 gap-2 py-1">
            <div className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-white border border-slate-100 shadow-2xs text-center">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShieldCheck size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-700 leading-tight">FSSAI Verified</span>
            </div>

            <div className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-white border border-slate-100 shadow-2xs text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Leaf size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-700 leading-tight">No Preservatives</span>
            </div>

            <div className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-white border border-slate-100 shadow-2xs text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-700 leading-tight">AI Diet Planner</span>
            </div>

            <div className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-white border border-slate-100 shadow-2xs text-center">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-700 leading-tight">Fast Delivery</span>
            </div>
          </div>

          {/* 2.5 POPULAR HEALTHY MEALS SECTION */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">
                Popular Healthy Meals
              </h3>
              <Link to="/search" className="text-xs font-bold text-purple-700 flex items-center gap-0.5">
                <span>See all</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {/* Food Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              {popularMeals.map((f) => (
                <FoodCard key={f._id} food={f} onAdd={handleAdd} />
              ))}
            </div>
          </div>

        </div>
      )}
    </MobileLayout>
  );
};

export default Home;
