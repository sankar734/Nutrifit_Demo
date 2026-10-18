import React, { useState } from 'react';
import { Star, Heart, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const FoodCard = ({ food, onAdd, variant = 'grid' }) => {
  const navigate = useNavigate();
  const { getItemQuantity, addToCart, updateItem } = useCart() || {};
  const [imgError, setImgError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const price = food.discountPrice || food.price;

  const currentQty = getItemQuantity ? getItemQuantity(food._id, food) : 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (onAdd) {
      onAdd(food);
    } else if (addToCart) {
      addToCart(food._id, 1, food);
    }
  };

  const handleMinus = (e) => {
    e.stopPropagation();
    if (updateItem) {
      updateItem(food._id, currentQty - 1, food);
    }
  };

  const handlePlus = (e) => {
    e.stopPropagation();
    if (updateItem) {
      updateItem(food._id, currentQty + 1, food);
    }
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite((prev) => !prev);
  };

  const proteinG = food.nutrition?.protein || 12;
  const calories = food.nutrition?.calories || 320;
  const macroSummary = `${proteinG}g Protein • ${calories} kcal`;

  // =========================================================================
  // COMPACT VARIANT: Mobile Explore List Row
  // Left image, middle details, right heart & Swiggy-style ADD/[-] qty [+] pill
  // =========================================================================
  if (variant === 'compact') {
    return (
      <div
        onClick={() => navigate(`/food/${food._id}`)}
        className="bg-white rounded-2xl p-3 shadow-xs border border-slate-100/90 flex items-center justify-between gap-3 hover:border-purple-200 transition cursor-pointer active:scale-[0.99]"
      >
        {/* Left Thumbnail with Veg Tag */}
        <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
          {food.images?.[0] && !imgError ? (
            <img
              src={food.images[0]}
              alt={food.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">
              🥗
            </div>
          )}

          {/* Micro Veg / Non-Veg Indicator */}
          <div className="absolute top-1.5 left-1.5 bg-white/95 backdrop-blur-md p-1 rounded-sm shadow-2xs">
            <span
              className={`w-2.5 h-2.5 border rounded-xs flex items-center justify-center ${
                food.isVeg ? 'border-emerald-600' : 'border-rose-600'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${food.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
            </span>
          </div>
        </div>

        {/* Center Details */}
        <div className="flex-1 min-w-0 space-y-1">
          <h4 className="text-sm font-black text-slate-900 truncate">
            {food.name}
          </h4>

          {/* Rating */}
          <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
            <Star size={11} className="fill-amber-500 text-amber-500" />
            <span className="text-slate-800">{food.rating ? food.rating.toFixed(1) : '4.5'}</span>
            <span className="text-slate-400 font-normal">
              ({food.formattedReviews || (food.totalReviews ? `${food.totalReviews}` : '1.2k')})
            </span>
          </div>

          {/* Macros */}
          <p className="text-[11px] font-medium text-slate-500">
            {macroSummary}
          </p>

          {/* Price */}
          <p className="text-sm font-black text-slate-900 pt-0.5">
            ₹{price}
          </p>
        </div>

        {/* Right Actions: Heart & Quantity Controller */}
        <div className="flex flex-col items-end justify-between h-20 shrink-0">
          <button
            type="button"
            onClick={handleFavorite}
            className="p-1 rounded-full text-slate-400 hover:text-rose-500 transition"
          >
            <Heart
              size={16}
              className={isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}
            />
          </button>

          {currentQty === 0 ? (
            <button
              type="button"
              onClick={handleAdd}
              className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-600 border border-purple-200 hover:border-purple-600 text-purple-700 hover:text-white font-extrabold text-xs shadow-xs transition active:scale-90 flex items-center gap-1"
              title="Add to Cart"
            >
              <span>ADD</span>
              <Plus size={13} />
            </button>
          ) : (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="flex items-center rounded-xl bg-purple-600 text-white shadow-md shadow-purple-500/25 p-0.5 border border-purple-500"
            >
              <button
                type="button"
                onClick={handleMinus}
                className="w-6 h-6 rounded-lg bg-purple-700/60 hover:bg-purple-800 text-white flex items-center justify-center transition active:scale-90"
              >
                <Minus size={12} strokeWidth={2.8} />
              </button>
              <span className="w-5 text-center text-xs font-black select-none">
                {currentQty}
              </span>
              <button
                type="button"
                onClick={handlePlus}
                className="w-6 h-6 rounded-lg bg-purple-700/60 hover:bg-purple-800 text-white flex items-center justify-center transition active:scale-90"
              >
                <Plus size={12} strokeWidth={2.8} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // STANDARD GRID VARIANT: Desktop & Mobile Home Grid Cards
  // =========================================================================
  return (
    <div
      onClick={() => navigate(`/food/${food._id}`)}
      className="group bg-white rounded-2xl shadow-xs hover:shadow-xl border border-slate-100 hover:border-purple-200 overflow-hidden transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
    >
      {/* Food Image Container */}
      <div className="relative h-38 sm:h-42 w-full bg-slate-100 overflow-hidden p-2 pb-0">
        <div className="relative w-full h-full rounded-xl overflow-hidden">
          {food.images?.[0] && !imgError ? (
            <img
              src={food.images[0]}
              alt={food.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-tr from-purple-100 to-indigo-100">
              🥗
            </div>
          )}

          {/* Top Left Veg / Non-Veg Badge */}
          <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-md px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-1 border border-slate-100">
            <span
              className={`w-2.5 h-2.5 border-2 rounded-xs flex items-center justify-center ${
                food.isVeg ? 'border-emerald-600' : 'border-rose-600'
              }`}
            >
              <span className={`w-1 h-1 rounded-full ${food.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
            </span>
            <span className={`text-[8px] font-black uppercase tracking-wider ${food.isVeg ? 'text-emerald-700' : 'text-rose-700'}`}>
              {food.isVeg ? 'VEG' : 'NON-VEG'}
            </span>
          </div>

          {/* Top Right Favorite Heart Button */}
          <button
            type="button"
            onClick={handleFavorite}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-xs hover:bg-white transition active:scale-90"
          >
            <Heart
              size={12}
              className={isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-rose-500'}
            />
          </button>
        </div>
      </div>

      {/* Food Details Info */}
      <div className="p-3 pt-2.5 flex-1 flex flex-col justify-between space-y-1.5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition line-clamp-1">
            {food.name}
          </h3>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-1 text-[11px] mt-0.5">
            <Star size={12} className="text-amber-500 fill-amber-500" />
            <span className="font-extrabold text-slate-800">
              {food.rating ? food.rating.toFixed(1) : '4.5'}
            </span>
            <span className="text-slate-400 font-medium">
              ({food.formattedReviews || (food.totalReviews ? `${food.totalReviews}` : '1.2k')})
            </span>
          </div>

          {/* Macros */}
          <p className="text-[11px] font-medium text-slate-500 mt-0.5">
            {macroSummary}
          </p>
        </div>

        {/* Pricing & Add / Quantity Controller Button */}
        <div className="pt-1.5 flex items-center justify-between">
          <span className="text-sm sm:text-base font-black text-slate-900">
            ₹{price}
          </span>

          {currentQty === 0 ? (
            <button
              type="button"
              onClick={handleAdd}
              className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-600 border border-purple-200 hover:border-purple-600 text-purple-700 hover:text-white font-extrabold text-xs shadow-xs transition-all duration-200 transform active:scale-90 flex items-center gap-1 group/btn"
            >
              <span>ADD</span>
              <Plus size={13} className="text-purple-600 group-hover/btn:text-white transition" />
            </button>
          ) : (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="flex items-center rounded-xl bg-purple-600 text-white shadow-md shadow-purple-500/25 p-0.5 border border-purple-500 animate-scale-in"
            >
              <button
                type="button"
                onClick={handleMinus}
                className="w-6 h-6 rounded-lg bg-purple-700/60 hover:bg-purple-800 text-white flex items-center justify-center transition active:scale-90"
                title={currentQty === 1 ? "Remove from cart" : "Decrease quantity"}
              >
                <Minus size={12} strokeWidth={2.8} />
              </button>

              <span className="w-6 text-center text-xs font-black select-none">
                {currentQty}
              </span>

              <button
                type="button"
                onClick={handlePlus}
                className="w-6 h-6 rounded-lg bg-purple-700/60 hover:bg-purple-800 text-white flex items-center justify-center transition active:scale-90"
                title="Increase quantity"
              >
                <Plus size={12} strokeWidth={2.8} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
