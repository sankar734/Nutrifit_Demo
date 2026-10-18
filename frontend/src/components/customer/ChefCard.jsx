import React from 'react';
import { Star, MapPin, ShieldCheck, ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChefCard = ({ chef }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/search?chef=${chef._id}`)}
      className="group min-w-[200px] sm:min-w-[220px] rounded-3xl bg-white shadow-sm hover:shadow-xl border border-slate-100 hover:border-purple-200 p-4 cursor-pointer transition duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
    >
      <div className="relative h-24 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-400 flex items-center justify-center text-3xl mb-3 shadow-md group-hover:scale-105 transition transform">
        {chef.profileImage ? (
          <img src={chef.profileImage} alt={chef.kitchenName} className="w-full h-full object-cover rounded-2xl" />
        ) : (
          <span>👩‍🍳</span>
        )}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-1.5 py-0.5 rounded-lg text-[9px] font-bold text-purple-700 flex items-center gap-1 shadow-xs">
          <ShieldCheck size={11} className="text-emerald-500" />
          <span>FSSAI Verified</span>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-slate-800 group-hover:text-purple-700 transition truncate">
          {chef.kitchenName}
        </h4>
        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
          <MapPin size={12} className="text-slate-400 shrink-0" />
          <span className="truncate">{chef.address || 'Chennai, India'}</span>
        </div>
      </div>

      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-amber-500 font-bold">
          <Star size={13} fill="currentColor" />
          <span>{chef.rating?.toFixed(1) ?? '4.8'}</span>
          <span className="text-slate-400 font-normal">({chef.totalReviews || 12})</span>
        </div>
        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
          View Menu
        </span>
      </div>
    </div>
  );
};

export default ChefCard;
