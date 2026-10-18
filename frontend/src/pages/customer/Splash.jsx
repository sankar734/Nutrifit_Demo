import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  ChefHat, 
  ShieldCheck, 
  Leaf, 
  Heart, 
  Activity, 
  CheckCircle2, 
  Flame, 
  Star, 
  TrendingUp, 
  ShoppingBag,
  Smartphone,
  Monitor
} from 'lucide-react';
import DeviceViewSwitcher from '../../components/customer/DeviceViewSwitcher';
import { useDeviceMode } from '../../context/DeviceModeContext';

const diets = [
  { id: 'protein', label: 'High Protein Gym', icon: '💪', cal: '520 kcal', protein: '42g', color: 'from-amber-500 to-orange-500' },
  { id: 'diabetic', label: 'Diabetic Friendly', icon: '🩸', cal: '340 kcal', carbs: '<15g', color: 'from-blue-500 to-indigo-500' },
  { id: 'weightloss', label: 'Weight Loss & Keto', icon: '⚖️', cal: '310 kcal', fat: 'Good Fats', color: 'from-emerald-500 to-teal-500' },
  { id: 'kids', label: 'Kids Nutri-Tiffin', icon: '🧒', cal: '380 kcal', vitamins: 'Iron & Zinc', color: 'from-purple-500 to-pink-500' },
  { id: 'vegan', label: 'Pure Veg & Vegan', icon: '🌱', cal: '390 kcal', fiber: '12g', color: 'from-green-500 to-emerald-600' },
];

const stats = [
  { value: '10K+', label: 'Healthy Meals Delivered' },
  { value: '50+', label: 'Verified Home Chefs' },
  { value: '4.9 ★', label: 'Customer Satisfaction' },
  { value: '100%', label: 'Zero Artificial Additives' },
];

const Splash = () => {
  const navigate = useNavigate();
  const { isMobileView, isSimulatorMode } = useDeviceMode();
  const [activeDiet, setActiveDiet] = useState(diets[0]);

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-800 ${isSimulatorMode ? 'mobile-simulator-wrapper p-4' : ''}`}>
      
      {/* 1. TOP WEB HERO NAVBAR */}
      {!isMobileView ? (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/20">
                🥑
              </div>
              <div>
                <span className="text-xl font-black bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-600 bg-clip-text text-transparent">
                  NutriChef
                </span>
                <span className="block text-[10px] font-bold text-purple-600 uppercase tracking-widest">
                  Healthy Homemade Food
                </span>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
              <a href="#features" className="hover:text-purple-600 transition">How It Works</a>
              <a href="#diets" className="hover:text-purple-600 transition">Dietary Plans</a>
              <a href="#chefs" className="hover:text-purple-600 transition">Home Chefs</a>
              <Link to="/login" className="hover:text-purple-600 transition">Explore Meals</Link>
            </nav>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <DeviceViewSwitcher inline={true} />
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-purple-500/25 hover:shadow-lg hover:scale-105 transition transform active:scale-95"
              >
                Sign In / Register
              </Link>
            </div>
          </div>
        </header>
      ) : (
        /* Mobile Intro Header */
        <div className={`w-full ${isSimulatorMode ? 'max-w-[430px]' : 'max-w-md mx-auto px-4 pt-4'} flex items-center justify-between mb-4`}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🥑</span>
            <span className="font-extrabold text-lg text-purple-900">NutriChef</span>
          </div>
          <DeviceViewSwitcher inline={true} />
        </div>
      )}

      {/* 2. MAIN HERO SECTION */}
      <section className={`relative overflow-hidden ${isMobileView ? `w-full ${isSimulatorMode ? 'max-w-[430px]' : 'max-w-md mx-auto'} bg-white rounded-3xl p-6 shadow-2xl border border-purple-100` : 'pt-12 pb-20 lg:pt-20 lg:pb-28'}`}>
        
        {/* Decorative Background Blobs on Desktop */}
        {!isMobileView && (
          <>
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-3/4 h-96 bg-gradient-to-tr from-purple-200/40 via-indigo-100/30 to-pink-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300/20 rounded-full blur-2xl pointer-events-none -z-10" />
          </>
        )}

        <div className={`${!isMobileView ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' : ''}`}>
          <div className={`grid grid-cols-1 ${!isMobileView ? 'lg:grid-cols-12 gap-12 items-center' : 'gap-6'}`}>
            
            {/* Left Content Column */}
            <div className={`${!isMobileView ? 'lg:col-span-7' : ''} space-y-6 text-left`}>
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-purple-800 text-xs font-bold tracking-wide animate-fade-in">
                <Sparkles size={14} className="text-purple-600 animate-spin" />
                <span>AI-Powered Healthy Homemade Food Platform</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Real Homemade Meals,{' '}
                <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800 bg-clip-text text-transparent">
                  Nutrient-Calculated
                </span>{' '}
                for Your Body.
              </h1>

              {/* Subheading */}
              <p className="text-sm sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Say goodbye to oily restaurant junk food. Enjoy chef-prepared healthy homemade dishes crafted to fit your precise nutrition goals—with instant real-time OTP registration.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:scale-[1.02] transition transform active:scale-95"
                >
                  <span>Get Started with Email OTP</span>
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm sm:text-base border border-slate-200 shadow-sm transition"
                >
                  <ChefHat size={18} className="text-purple-600" />
                  <span>Join as Home Chef</span>
                </Link>
              </div>

              {/* Mini Social Proof */}
              <div className="flex items-center gap-4 pt-4 text-xs text-slate-500">
                <div className="flex -space-x-2">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="user" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="user" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="user" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                </div>
                <div>
                  <div className="flex text-amber-400">
                    {'★★★★★'}
                  </div>
                  <span className="font-semibold text-slate-700">4.9/5 by 2,400+ Health Conscious Foodies</span>
                </div>
              </div>

            </div>

            {/* Right Interactive Card / Food Showcase */}
            <div className={`${!isMobileView ? 'lg:col-span-5' : ''} relative`}>
              
              {/* Interactive Showcase Card */}
              <div className="relative z-10 bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-purple-100 space-y-5 animate-fade-in">
                
                {/* Header with live badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-slate-800">Live AI Nutrition Breakdown</span>
                  </div>
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                    Chef Lakshmi's Kitchen
                  </span>
                </div>

                {/* Hero Dish Image */}
                <div className="relative rounded-2xl overflow-hidden shadow-md group">
                  <img
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80"
                    alt="Healthy Food"
                    className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                    <span className="text-xs font-semibold text-purple-300">🌿 Organic Super Bowl</span>
                    <h3 className="text-base font-black">Quinoa, Avocado & Sprout Protein Platter</h3>
                  </div>
                </div>

                {/* Macro Nutrients Pills */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-purple-50 p-2.5 rounded-2xl border border-purple-100">
                    <p className="text-[10px] text-purple-600 font-bold uppercase">Calories</p>
                    <p className="text-base font-extrabold text-slate-800">420 kcal</p>
                  </div>
                  <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-100">
                    <p className="text-[10px] text-emerald-600 font-bold uppercase">Protein</p>
                    <p className="text-base font-extrabold text-slate-800">28g</p>
                  </div>
                  <div className="bg-amber-50 p-2.5 rounded-2xl border border-amber-100">
                    <p className="text-[10px] text-amber-600 font-bold uppercase">Carbs / Fat</p>
                    <p className="text-base font-extrabold text-slate-800">32g / 12g</p>
                  </div>
                </div>

                {/* Interactive Diet Switcher on the Card */}
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-bold text-slate-700">Choose Your Dietary Lifestyle:</p>
                  <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                    {diets.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setActiveDiet(d)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
                          activeDiet.id === d.id
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span>{d.icon}</span>
                        <span>{d.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Order Button */}
                <Link
                  to="/login"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition"
                >
                  <ShoppingBag size={14} />
                  <span>Order {activeDiet.label} Meal</span>
                </Link>

              </div>

              {/* Floating Floating Badges */}
              <div className="hidden sm:flex absolute -bottom-5 -left-5 bg-white p-3 rounded-2xl shadow-xl border border-slate-100 items-center gap-3 z-20 animate-float">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <ShieldCheck size={20} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">FSSAI Certified</p>
                  <p className="text-xs font-bold text-slate-800">100% Kitchen Audited</p>
                </div>
              </div>

            </div>

          </div>
        </div>

      </section>

      {/* 3. LIVE STATS COUNTER */}
      <section className="bg-white border-y border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
                  {s.value}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS 3-STEP FLOW */}
      <section id="features" className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="max-w-2xl mx-auto mb-14 space-y-3">
            <span className="px-3.5 py-1.5 rounded-full bg-purple-100 text-purple-700 font-bold text-xs uppercase tracking-wider">
              Simple & Transparent
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
              How NutriChef Transforms Your Eating Habits
            </h2>
            <p className="text-sm text-slate-600">
              No complicated calorie counting. We connect you directly with passionate home chefs cooking nutritious food according to your lifestyle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-left space-y-4 relative group hover:-translate-y-1 transition duration-300">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-2xl shadow-inner">
                🎯
              </div>
              <span className="text-xs font-black text-purple-600 tracking-wider uppercase">Step 01</span>
              <h3 className="text-lg font-bold text-slate-900">Set Health Goals & Pick Diet</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose High Protein, Diabetic Friendly, Keto, Weight Loss, or Custom Macros. Our AI matches you with ideal meals.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-left space-y-4 relative group hover:-translate-y-1 transition duration-300">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-2xl shadow-inner">
                👩‍🍳
              </div>
              <span className="text-xs font-black text-indigo-600 tracking-wider uppercase">Step 02</span>
              <h3 className="text-lg font-bold text-slate-900">Cooked Fresh by Certified Chefs</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Verified home chefs cook your food in small, hygienic batches using cold-pressed oils and organic farm produce.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-left space-y-4 relative group hover:-translate-y-1 transition duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl shadow-inner">
                ⚡
              </div>
              <span className="text-xs font-black text-emerald-600 tracking-wider uppercase">Step 03</span>
              <h3 className="text-lg font-bold text-slate-900">Hot Doorstep Delivery & Live Tracking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track your healthy meal in real-time from the chef's kitchen to your doorstep and view your daily calorie consumption dashboard.
              </p>
            </div>

          </div>

          {/* Quick CTA */}
          <div className="mt-12">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-sm shadow-xl hover:shadow-2xl hover:scale-105 transition transform"
            >
              <span>Explore All Healthy Dishes Now</span>
              <ArrowRight size={16} />
            </Link>
          </div>

        </div>
      </section>

      {/* Floating Device Switcher on Splash */}
      <DeviceViewSwitcher />

    </div>
  );
};

export default Splash;
