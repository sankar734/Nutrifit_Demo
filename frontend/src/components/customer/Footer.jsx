import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Clock, Sparkles, ChefHat, Leaf, PhoneCall, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-10 border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Props Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-slate-800 text-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <ChefHat size={20} />
            </div>
            <div>
              <h4 className="font-bold text-white mb-0.5">100% Home Cooked</h4>
              <p className="text-xs text-slate-400">Authentic recipes made by verified local passionate chefs.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-900/50 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Leaf size={20} />
            </div>
            <div>
              <h4 className="font-bold text-white mb-0.5">Nutrient Calculated</h4>
              <p className="text-xs text-slate-400">Real macros, calories & dietary labels on every single meal.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-900/50 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <h4 className="font-bold text-white mb-0.5">Hot & Fresh Delivery</h4>
              <p className="text-xs text-slate-400">Cooked just in time and delivered warm right to your door.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-900/50 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="font-bold text-white mb-0.5">Hygiene Verified</h4>
              <p className="text-xs text-slate-400">FSSAI certified and audited kitchen hygiene standards.</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-purple-500/30">
                🥑
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">NutriChef</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering healthy lifestyles through nutritious homemade meals prepared by certified home chefs. Fuel your body with healthy food, not junk.
            </p>
            <div className="flex items-center gap-2 text-xs text-purple-400">
              <Sparkles size={14} />
              <span>AI-Powered Nutrition Analysis</span>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Healthy Diets</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/search" className="hover:text-purple-400 transition">High Protein Gym Meals</Link></li>
              <li><Link to="/search" className="hover:text-purple-400 transition">Diabetic Friendly Platters</Link></li>
              <li><Link to="/search" className="hover:text-purple-400 transition">Weight Loss / Keto Bowls</Link></li>
              <li><Link to="/search" className="hover:text-purple-400 transition">Kids Nutritious Tiffin</Link></li>
              <li><Link to="/search" className="hover:text-purple-400 transition">Pure Vegetarian & Vegan</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Quick Links</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/home" className="hover:text-purple-400 transition">Home Dashboard</Link></li>
              <li><Link to="/nutrition" className="hover:text-purple-400 transition">AI Nutrition Tracker</Link></li>
              <li><Link to="/become-chef" className="hover:text-purple-400 transition">Join as Home Chef 👨‍🍳</Link></li>
              <li><Link to="/become-delivery" className="hover:text-purple-400 transition">Join Delivery Fleet 🚴</Link></li>
              <li><Link to="/settings/help" className="hover:text-purple-400 transition">24x7 Help & Support</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Contact & Support</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-purple-400" />
                <span>support@nutrichef.health</span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneCall size={14} className="text-purple-400" />
                <span>1800-NUTRI-CHEF</span>
              </li>
              <li className="pt-2 text-slate-400">
                <span>Available daily 7:00 AM – 10:30 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} NutriChef Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/settings/privacy" className="hover:text-slate-400 transition">Privacy Policy</Link>
            <span>•</span>
            <Link to="/settings/about" className="hover:text-slate-400 transition">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
