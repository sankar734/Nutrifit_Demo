import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Star, 
  Minus, 
  Plus, 
  ShieldCheck, 
  Sparkles, 
  Leaf, 
  Clock, 
  Heart, 
  ChevronRight, 
  ChevronLeft, 
  Play,
  Flame,
  Beef,
  Wheat
} from 'lucide-react';
import MobileLayout from '../../components/customer/MobileLayout';
import DesktopSidebar from '../../components/customer/DesktopSidebar';
import { foodApi } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useDeviceMode } from '../../context/DeviceModeContext';
import sampleFoods from '../../data/sampleFoods';

const addOnsList = [
  { id: 'chicken', label: 'Extra Chicken', price: 50 },
  { id: 'raita', label: 'Raita', price: 30, defaultChecked: true },
  { id: 'salan', label: 'Salan', price: 20 },
];

const FoodDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart() || {};
  const { isMobileView } = useDeviceMode();

  const [food, setFood] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedTab, setSelectedTab] = useState('Details');
  const [spiceLevel, setSpiceLevel] = useState('Medium');
  const [selectedAddOns, setSelectedAddOns] = useState(['raita']);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    // Check if id matches sample data or biryani
    const matched = sampleFoods.find(
      (f) => f._id === id || (id === 'chicken-biryani' && f.name.toLowerCase().includes('biryani'))
    );
    if (matched) {
      setFood(matched);
      return;
    }
    foodApi
      .details(id)
      .then(({ data }) => setFood(data.data.food || sampleFoods[4]))
      .catch(() => setFood(sampleFoods[4] || sampleFoods[0]));
  }, [id]);

  if (!food) {
    return (
      <MobileLayout showNav={false}>
        <div className="p-16 text-center">
          <Sparkles size={32} className="animate-spin text-purple-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500 font-semibold">Loading dish details...</p>
        </div>
      </MobileLayout>
    );
  }

  const basePrice = food.discountPrice || food.price;
  const addOnsTotal = selectedAddOns.reduce((sum, addOnId) => {
    const item = addOnsList.find((a) => a.id === addOnId);
    return sum + (item ? item.price : 0);
  }, 0);
  const unitPrice = basePrice + addOnsTotal;
  const totalPrice = unitPrice * qty;

  const restaurantName = food.chef?.kitchenName || 'Paradise Biryani';

  const galleryImages = [
    food.images?.[0] || '/food-images/chicken-biryani.jpg',
    food.images?.[1] || '/food-images/hero-bowl.jpg',
    food.images?.[2] || '/food-images/paneer-salad.jpg',
    food.images?.[3] || '/food-images/buddha-bowl.jpg',
  ];

  const toggleAddOn = (addOnId) => {
    if (selectedAddOns.includes(addOnId)) {
      setSelectedAddOns(selectedAddOns.filter((id) => id !== addOnId));
    } else {
      setSelectedAddOns([...selectedAddOns, addOnId]);
    }
  };

  const handleAddToCart = async () => {
    await addToCart?.(food._id, qty, {
      ...food,
      spiceLevel,
      selectedAddOns,
      finalUnitPrice: unitPrice,
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  return (
    <MobileLayout showNav={false} fullWidth={!isMobileView}>
      
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-purple-500/40 flex items-center gap-2.5 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold">🛒 Added {qty}x {food.name} to cart!</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DESKTOP VIEW LAYOUT (Matches Screen 3: Food Item Page - Desktop View)   */}
      {/* ========================================================================= */}
      {!isMobileView ? (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-8 items-start">
            
            {/* LEFT SIDEBAR NAVIGATION (Explore active) */}
            <DesktopSidebar activeItem="explore" />

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 min-w-0 space-y-5">
              
              {/* 1.1 BREADCRUMB */}
              <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Link to="/search" className="hover:text-purple-700 transition">Explore</Link>
                <ChevronRight size={13} className="text-slate-400" />
                <span className="text-slate-600">Biryani</span>
                <ChevronRight size={13} className="text-slate-400" />
                <span className="text-slate-900 font-bold">{food.name}</span>
              </nav>

              {/* 1.2 TWO-COLUMN SPLIT LAYOUT */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT COLUMN: HERO IMAGE, THUMBNAILS, TABS, CUSTOMIZATION (7 Cols) */}
                <div className="lg:col-span-7 space-y-5">
                  
                  {/* Main Food Photo */}
                  <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden shadow-sm border border-slate-100 bg-slate-100 group">
                    <img
                      src={galleryImages[activeImageIdx]}
                      alt={food.name}
                      className="w-full h-full object-cover transition duration-500"
                    />

                    {/* Bestseller Badge (Green) */}
                    <div className="absolute top-4 left-4 bg-emerald-600 text-white text-[11px] font-extrabold px-3 py-1 rounded-xl shadow-md">
                      Bestseller
                    </div>

                    {/* Favorite Heart Button */}
                    <button
                      type="button"
                      onClick={() => setIsFavorite(!isFavorite)}
                      className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md hover:bg-white transition active:scale-90"
                    >
                      <Heart
                        size={17}
                        className={isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}
                      />
                    </button>
                  </div>

                  {/* 4 Thumbnails Row below photo (3 angles + 1 video play) */}
                  <div className="grid grid-cols-4 gap-3">
                    {galleryImages.slice(0, 3).map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIdx(idx)}
                        className={`h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                          activeImageIdx === idx
                            ? 'border-purple-600 ring-2 ring-purple-400/40 scale-102'
                            : 'border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="thumb" className="w-full h-full object-cover" />
                      </button>
                    ))}

                    {/* 4th: Play Video Thumbnail */}
                    <button
                      type="button"
                      onClick={() => setShowVideoModal(true)}
                      className="h-20 rounded-2xl bg-slate-900 text-white border-2 border-slate-800 flex items-center justify-center hover:bg-purple-900 transition group shadow-2xs relative overflow-hidden"
                    >
                      <img
                        src="/food-images/chicken-biryani.jpg"
                        alt="video bg"
                        className="w-full h-full object-cover opacity-50 group-hover:opacity-40"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center">
                          <Play size={14} className="fill-white text-white ml-0.5" />
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Tabs Row: Details, Nutrition, Reviews (12k), Related */}
                  <div className="flex border-b border-slate-200 text-xs font-bold text-slate-500 gap-6 pt-2">
                    {['Details', 'Nutrition', 'Reviews (12k)', 'Related'].map((tab) => {
                      const isActive = selectedTab === tab || (tab === 'Reviews (12k)' && selectedTab === 'Reviews');
                      return (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setSelectedTab(tab.startsWith('Reviews') ? 'Reviews' : tab)}
                          className={`pb-2.5 transition-all relative ${
                            isActive
                              ? 'text-purple-700 font-extrabold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-purple-600'
                              : 'hover:text-slate-800'
                          }`}
                        >
                          {tab}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab Content: Details */}
                  {selectedTab === 'Details' && (
                    <div className="space-y-4">
                      {/* Description Text */}
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {food.description || 'Aromatic basmati rice cooked with tender chicken pieces and authentic spices. Served with raita and salan.'}
                      </p>

                      {/* 3 Trust Badges */}
                      <div className="flex items-center gap-6 text-xs font-bold text-slate-700 pt-1">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck size={16} className="text-purple-600" />
                          <span>FSSAI Verified</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Sparkles size={16} className="text-purple-600" />
                          <span>Hygienically Prepared</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Leaf size={16} className="text-emerald-600" />
                          <span>No Preservatives</span>
                        </div>
                      </div>

                      {/* Customization: Choose Spice Level */}
                      <div className="pt-3 space-y-2">
                        <h4 className="text-xs font-black text-slate-900">Customization</h4>
                        <p className="text-xs font-medium text-slate-500">Choose Spice Level</p>

                        <div className="flex items-center gap-3">
                          {['Mild', 'Medium', 'Spicy'].map((level) => {
                            const isSelected = spiceLevel === level;
                            return (
                              <button
                                key={level}
                                type="button"
                                onClick={() => setSpiceLevel(level)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition border ${
                                  isSelected
                                    ? 'border-purple-600 bg-purple-50/50 text-purple-700'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <span
                                  className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                                    isSelected ? 'border-purple-600' : 'border-slate-300'
                                  }`}
                                >
                                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />}
                                </span>
                                <span>{level}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Add-ons Checkboxes */}
                      <div className="pt-2 space-y-2">
                        <h4 className="text-xs font-black text-slate-900">Add-ons</h4>
                        <div className="space-y-2">
                          {addOnsList.map((addon) => {
                            const isChecked = selectedAddOns.includes(addon.id);
                            return (
                              <label
                                key={addon.id}
                                className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer select-none"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleAddOn(addon.id)}
                                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 rounded-sm cursor-pointer accent-purple-600"
                                />
                                <span>{addon.label} (+₹{addon.price})</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Tab Content: Nutrition */}
                  {selectedTab === 'Nutrition' && (
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                        <Flame size={16} className="text-amber-500 mx-auto mb-1" />
                        <span className="block text-sm font-black text-slate-900">{food.nutrition?.calories || 420} kcal</span>
                        <span className="text-[10px] text-slate-400 font-semibold">Calories</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                        <Beef size={16} className="text-purple-600 mx-auto mb-1" />
                        <span className="block text-sm font-black text-slate-900">{food.nutrition?.protein || 28}g</span>
                        <span className="text-[10px] text-slate-400 font-semibold">Protein</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                        <Wheat size={16} className="text-emerald-600 mx-auto mb-1" />
                        <span className="block text-sm font-black text-slate-900">{food.nutrition?.carbs || 48}g</span>
                        <span className="text-[10px] text-slate-400 font-semibold">Carbs</span>
                      </div>
                    </div>
                  )}

                  {/* Tab Content: Reviews */}
                  {selectedTab === 'Reviews' && (
                    <div className="p-4 bg-slate-50 rounded-2xl text-center space-y-1">
                      <Star size={20} className="text-amber-500 fill-amber-500 mx-auto" />
                      <h4 className="font-extrabold text-sm text-slate-800">4.5 out of 5 stars</h4>
                      <p className="text-xs text-slate-500">Based on 12,000+ verified customer reviews</p>
                    </div>
                  )}

                  {/* Tab Content: Related */}
                  {selectedTab === 'Related' && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {sampleFoods.slice(0, 3).map((f) => (
                        <button
                          key={f._id}
                          onClick={() => navigate(`/food/${f._id}`)}
                          className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold shrink-0 hover:bg-purple-100 transition"
                        >
                          {f.name}
                        </button>
                      ))}
                    </div>
                  )}

                </div>

                {/* RIGHT COLUMN: DISH TITLE, RATING, PRICE, STEPPER, ADD TO CART, STATS (5 Cols) */}
                <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
                  
                  {/* Dish Name & Kitchen */}
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                      {food.name}
                    </h1>
                    <p className="text-xs font-semibold text-slate-500 mt-1">
                      {restaurantName}
                    </p>

                    {/* Rating & Write a review */}
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <div className="flex items-center gap-1 text-slate-800 font-extrabold">
                        <Star size={14} className="text-amber-500 fill-amber-500" />
                        <span>{food.rating ? food.rating.toFixed(1) : '4.5'}</span>
                        <span className="text-slate-400 font-normal">
                          ({food.formattedReviews || '12k reviews'})
                        </span>
                      </div>
                      <span className="text-slate-300">|</span>
                      <button type="button" className="text-purple-700 font-bold hover:underline">
                        Write a review
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <span className="text-3xl font-black text-slate-900">
                      ₹{unitPrice}
                    </span>
                  </div>

                  {/* Quantity Stepper & Add to Cart Button */}
                  <div className="flex items-center gap-4">
                    {/* - 1 + Stepper */}
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="w-7 h-7 rounded-lg bg-white text-slate-700 flex items-center justify-center font-black hover:bg-slate-200 transition shadow-2xs"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="font-extrabold text-sm px-2 text-slate-800">{qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(qty + 1)}
                        className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-black hover:bg-purple-700 transition shadow-2xs"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="flex-1 py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow-md shadow-purple-500/25 transition transform active:scale-95 text-center"
                    >
                      Add to Cart
                    </button>
                  </div>

                  {/* 3 Metric Pills */}
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
                      <Clock size={16} className="text-purple-600 mx-auto mb-1" />
                      <span className="block text-xs font-black text-slate-900">30-40 mins</span>
                      <span className="text-[10px] text-slate-400 font-semibold">Delivery time</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
                      <Flame size={16} className="text-amber-500 mx-auto mb-1" />
                      <span className="block text-xs font-black text-slate-900">{food.nutrition?.calories || 420} kcal</span>
                      <span className="text-[10px] text-slate-400 font-semibold">Per serving</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
                      <Leaf size={16} className={food.isVeg ? 'text-emerald-500 mx-auto mb-1' : 'text-rose-500 mx-auto mb-1'} />
                      <span className="block text-xs font-black text-slate-900">{food.isVeg ? 'Veg' : 'Non-Veg'}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{food.isVeg ? 'Pure veg' : 'Contains chicken'}</span>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </div>
        </div>
      ) : (

        /* ========================================================================= */
        /* 2. MOBILE VIEW LAYOUT (Matches Screen 6: Food Item Page - Mobile View)     */
        /* ========================================================================= */
        <div className="min-h-screen bg-slate-50 pb-28 max-w-md mx-auto">
          
          {/* 2.1 HERO IMAGE WITH OVERLAID BACK AND FAVORITE BUTTONS */}
          <div className="relative h-64 sm:h-72 w-full bg-slate-100 overflow-hidden">
            <img
              src={galleryImages[activeImageIdx]}
              alt={food.name}
              className="w-full h-full object-cover"
            />

            {/* Floating Top Controls */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md text-slate-800 flex items-center justify-center shadow-md active:scale-95"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                type="button"
                onClick={() => setIsFavorite(!isFavorite)}
                className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md text-slate-800 flex items-center justify-center shadow-md active:scale-95"
              >
                <Heart size={18} className={isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-600'} />
              </button>
            </div>

            {/* Bestseller Badge */}
            <div className="absolute bottom-3 left-4 bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg shadow-md">
              Bestseller
            </div>
          </div>

          {/* 2.2 4 THUMBNAILS ROW UNDER PHOTO */}
          <div className="p-3 bg-white border-b border-slate-100">
            <div className="grid grid-cols-4 gap-2">
              {galleryImages.slice(0, 3).map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={`h-14 rounded-xl overflow-hidden border transition-all ${
                    activeImageIdx === idx ? 'border-purple-600 ring-2 ring-purple-400/40' : 'border-slate-200'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}

              <button
                type="button"
                onClick={() => setShowVideoModal(true)}
                className="h-14 rounded-xl bg-slate-900 text-white border border-slate-800 flex items-center justify-center relative overflow-hidden"
              >
                <img
                  src="/food-images/chicken-biryani.jpg"
                  alt="video"
                  className="w-full h-full object-cover opacity-50"
                />
                <Play size={14} className="fill-white text-white absolute" />
              </button>
            </div>
          </div>

          {/* 2.3 MAIN CONTENT SECTION */}
          <div className="p-4 bg-white space-y-4">
            
            {/* Title & Kitchen */}
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-tight">
                {food.name}
              </h1>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                {restaurantName}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-1 text-xs text-amber-500 font-extrabold mt-1">
                <Star size={13} className="fill-amber-500 text-amber-500" />
                <span className="text-slate-900">{food.rating ? food.rating.toFixed(1) : '4.5'}</span>
                <span className="text-slate-400 font-normal">
                  ({food.formattedReviews || '12k reviews'})
                </span>
              </div>
            </div>

            {/* Price & Stepper Row */}
            <div className="flex items-center justify-between py-2 border-y border-slate-100">
              <span className="text-2xl font-black text-slate-900">
                ₹{unitPrice}
              </span>

              {/* Stepper */}
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-6 h-6 rounded-full bg-white text-slate-700 flex items-center justify-center font-black active:scale-90"
                >
                  <Minus size={12} />
                </button>
                <span className="font-extrabold text-sm px-1.5 text-slate-800">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                  className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-black active:scale-90"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>

            {/* 3 Metric Boxes */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-50 rounded-2xl p-2.5 text-center border border-slate-100">
                <Clock size={15} className="text-purple-600 mx-auto mb-0.5" />
                <span className="block text-xs font-black text-slate-900">30-40 mins</span>
                <span className="text-[9px] text-slate-400 font-semibold">Delivery</span>
              </div>

              <div className="bg-slate-50 rounded-2xl p-2.5 text-center border border-slate-100">
                <Flame size={15} className="text-amber-500 mx-auto mb-0.5" />
                <span className="block text-xs font-black text-slate-900">{food.nutrition?.calories || 420} kcal</span>
                <span className="text-[9px] text-slate-400 font-semibold">Per serving</span>
              </div>

              <div className="bg-slate-50 rounded-2xl p-2.5 text-center border border-slate-100">
                <Leaf size={15} className={food.isVeg ? 'text-emerald-500 mx-auto mb-0.5' : 'text-rose-500 mx-auto mb-0.5'} />
                <span className="block text-xs font-black text-slate-900">{food.isVeg ? 'Veg' : 'Non-Veg'}</span>
                <span className="text-[9px] text-slate-400 font-semibold">{food.isVeg ? 'Plant based' : 'Contains chicken'}</span>
              </div>
            </div>

            {/* Tabs: Details | Nutrition | Reviews */}
            <div className="flex border-b border-slate-100 text-xs font-bold text-slate-500 pt-1">
              {['Details', 'Nutrition', 'Reviews'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSelectedTab(tab)}
                  className={`pb-2 px-3 flex-1 text-center transition-all ${
                    selectedTab === tab
                      ? 'text-purple-700 border-b-2 border-purple-600 font-extrabold'
                      : 'hover:text-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed">
              {food.description || 'Aromatic basmati rice cooked with tender chicken pieces and authentic spices. Served with raita and salan.'}
            </p>

          </div>

          {/* 2.4 STICKY BOTTOM ACTION BAR */}
          <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-100 z-30 max-w-md mx-auto">
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm shadow-xl shadow-purple-500/30 transition transform active:scale-95"
            >
              Add to Cart • ₹{totalPrice}
            </button>
          </div>

        </div>
      )}

      {/* Video Modal Preview */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto text-2xl">
              📹
            </div>
            <h3 className="text-lg font-black text-slate-900">Kitchen Preparation Video</h3>
            <p className="text-xs text-slate-500">
              Watch Chef preparing {food.name} with certified organic ingredients, low oil, and high hygiene standards.
            </p>
            <button
              type="button"
              onClick={() => setShowVideoModal(false)}
              className="w-full py-2.5 rounded-full bg-purple-600 text-white font-bold text-xs"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

    </MobileLayout>
  );
};

export default FoodDetails;
