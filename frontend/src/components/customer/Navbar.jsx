import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShoppingBag, 
  User as UserIcon, 
  LogOut, 
  ChefHat, 
  Bike, 
  Activity, 
  ChevronDown, 
  Settings, 
  X,
  MapPin,
  Tag,
  Heart,
  ShieldCheck,
  Check,
  Plus,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import DeviceViewSwitcher from './DeviceViewSwitcher';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout, activeAddress, selectActiveAddress, saveUserAddress } = useAuth();
  const { totalItems, subtotal } = useCart() || { totalItems: 0, subtotal: 0 };
  const { t } = useLanguage() || { t: (k) => k };
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileMenuRef = useRef(null);

  // Address picker & add modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    addressLine: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600020',
  });
  const [addressFeedback, setAddressFeedback] = useState('');

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-xs transition-all">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3 lg:gap-6">
          
          {/* 1. BRAND LOGO */}
          <div className="flex items-center gap-6 shrink-0">
            <Link to="/home" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-purple-600 flex items-center justify-center text-xl shadow-md shadow-orange-500/20 group-hover:scale-105 transition transform">
                🥗
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black bg-gradient-to-r from-orange-600 via-purple-700 to-indigo-700 bg-clip-text text-transparent tracking-tight leading-none">
                  NutriFit
                </span>
                <span className="text-[9px] font-extrabold tracking-widest text-purple-600 uppercase mt-0.5">
                  Healthy Foods
                </span>
              </div>
            </Link>

            {/* LOCATION SELECTOR (Synchronized with user activeAddress) */}
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <MapPin size={16} />
              </div>
              <div className="text-left">
                <span className="block text-[10px] font-semibold text-slate-400 uppercase leading-none">
                  Deliver to
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNewAddress(false);
                    setAddressFeedback('');
                    setShowAddressModal(true);
                  }}
                  className="flex items-center gap-1.5 text-xs font-black text-slate-800 hover:text-purple-700 transition leading-tight mt-0.5 group"
                  title={activeAddress?.addressLine ? `${activeAddress.label || 'Home'}: ${activeAddress.addressLine}` : 'Change delivery location'}
                >
                  <span className="max-w-[150px] truncate">
                    {activeAddress ? `${activeAddress.city || 'Chennai'}, ${activeAddress.state || 'Tamil Nadu'}` : 'Chennai, Tamil Nadu'}
                  </span>
                  <ChevronDown size={13} className="text-slate-400 group-hover:text-purple-600 transition shrink-0" />
                </button>
              </div>
            </div>
          </div>

          {/* 2. SEARCH BAR WITH PURPLE BUTTON */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl relative hidden md:block">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search for biryani, pizza, healthy food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-14 py-2.5 rounded-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/25 focus:border-purple-500 transition shadow-inner font-medium"
              />
              <Search size={17} className="absolute left-4 text-slate-400 pointer-events-none" />
              
              {/* Purple search submit button */}
              <button
                type="submit"
                className="absolute right-1.5 w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-sm transition active:scale-95"
              >
                <Search size={14} />
              </button>
            </div>
          </form>

          {/* RIGHT ACTIONS: OFFERS, FAVORITES, CART & USER PROFILE */}
          <div className="flex items-center gap-3 lg:gap-5 shrink-0">
            {/* Desktop / Phone View Switcher */}
            <div className="hidden lg:flex items-center">
              <DeviceViewSwitcher inline={true} />
            </div>

            {/* OFFERS LINK */}
            <Link
              to="/settings"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-purple-700 transition px-2.5 py-1.5 rounded-xl hover:bg-slate-50"
            >
              <Tag size={16} className="text-purple-600" />
              <span>Offers</span>
            </Link>

            {/* FAVORITES LINK */}
            <Link
              to="/my-orders"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-purple-700 transition px-2.5 py-1.5 rounded-xl hover:bg-slate-50"
            >
              <Heart size={16} className="text-purple-600" />
              <span>Favorites</span>
            </Link>

            {/* NOTIFICATION BELL */}
            <NotificationBell />

            {/* CART ICON WITH BADGE */}
            <Link
              to="/cart"
              className="relative p-2 rounded-full hover:bg-purple-50 text-slate-700 hover:text-purple-700 transition group"
            >
              <ShoppingBag size={21} className="group-hover:scale-105 transition" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-md animate-scale-in">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* USER AVATAR & DROPDOWN */}
            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-purple-400 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm border-2 border-white ring-1 ring-slate-200">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
                  </div>
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-slate-200/80 py-2.5 z-50 animate-fade-up">
                    
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                      <p className="text-sm font-extrabold text-slate-900 truncate">{user.name || 'Healthy Foodie'}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{user.email || user.phone || 'customer@nutrichef.health'}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black uppercase">
                          {user.role || 'Customer'}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold">● Active</span>
                      </div>
                    </div>

                    {/* Menu Links */}
                    <div className="p-1 space-y-0.5">
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition"
                      >
                        <UserIcon size={16} className="text-purple-600" />
                        <span>My Profile & Addresses</span>
                      </Link>

                      <Link
                        to="/my-orders"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition"
                      >
                        <ShoppingBag size={16} className="text-purple-600" />
                        <span>My Orders</span>
                      </Link>

                      <Link
                        to="/nutrition"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition"
                      >
                        <Activity size={16} className="text-purple-600" />
                        <span>AI Nutrition Tracker</span>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition"
                      >
                        <Settings size={16} className="text-slate-500" />
                        <span>Settings</span>
                      </Link>

                      {user.role === 'chef' && (
                        <Link
                          to="/chef"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-amber-700 bg-amber-50/60 hover:bg-amber-100 transition"
                        >
                          <ChefHat size={16} className="text-amber-600" />
                          <span>Chef Kitchen Console</span>
                        </Link>
                      )}

                      {user.role === 'delivery' && (
                        <Link
                          to="/delivery"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100 transition"
                        >
                          <Bike size={16} className="text-emerald-600" />
                          <span>Delivery Fleet Console</span>
                        </Link>
                      )}

                      {(user.role === 'admin' || user.role === 'superadmin') && (
                        <Link
                          to="/admin"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-purple-700 bg-purple-50/60 hover:bg-purple-100 transition"
                        >
                          <ShieldCheck size={16} className="text-purple-600" />
                          <span>Admin Console</span>
                        </Link>
                      )}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-slate-100 mt-1 pt-1 px-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition"
              >
                Sign In
              </Link>
            )}

          </div>

        </div>

        {/* Mobile Deliver To Bar (When on small screens) */}
        <div className="pb-1.5 pt-0.5 flex items-center justify-between md:hidden border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setIsAddingNewAddress(false);
              setAddressFeedback('');
              setShowAddressModal(true);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-purple-700 max-w-full"
          >
            <MapPin size={13} className="text-purple-600 shrink-0" />
            <span className="text-[10px] uppercase text-slate-400 font-bold shrink-0">Deliver to:</span>
            <span className="text-xs font-black truncate text-slate-900">
              {activeAddress ? `${activeAddress.city || 'Chennai'} · ${activeAddress.label || 'Home'}` : 'Chennai, Tamil Nadu'}
            </span>
            <ChevronDown size={12} className="text-slate-400 shrink-0" />
          </button>
        </div>

        {/* Mobile Search Bar Row (When on small screens) */}
        <div className="pb-3 pt-1 block sm:hidden">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              placeholder="Search dishes, macros, chefs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            />
            <Search size={15} className="absolute left-3.5 text-purple-600 pointer-events-none" />
          </form>
        </div>

      </div>

      {/* ADDRESS PICKER & MANAGER MODAL */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <MapPin size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {isAddingNewAddress ? 'Add Delivery Address' : 'Select Delivery Location'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {isAddingNewAddress ? 'Stored permanently in your profile' : 'Delivering fresh meals to your doorstep'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddressModal(false);
                  setIsAddingNewAddress(false);
                  setAddressFeedback('');
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X size={16} />
              </button>
            </div>

            {addressFeedback && (
              <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <Check size={14} className="text-emerald-600 shrink-0" />
                <span>{addressFeedback}</span>
              </div>
            )}

            {!isAddingNewAddress ? (
              <div className="space-y-3">
                {/* Address List */}
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                  {(user?.addresses?.length ? user.addresses : [activeAddress]).map((addr, idx) => {
                    const isSelected = activeAddress && (activeAddress._id === addr._id || activeAddress.id === addr.id || (activeAddress.addressLine === addr.addressLine && activeAddress.pincode === addr.pincode));

                    return (
                      <div
                        key={addr._id || idx}
                        onClick={() => {
                          selectActiveAddress(addr);
                          setAddressFeedback(`📍 Selected ${addr.label || 'Home'} as default location!`);
                          setTimeout(() => {
                            setShowAddressModal(false);
                            setAddressFeedback('');
                          }, 900);
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-500/20 shadow-xs'
                            : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                            isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {addr.label === 'Work' ? '💼' : addr.label === 'Other' ? '📍' : '🏠'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-900 uppercase">
                                {addr.label || 'Home'}
                              </span>
                              {isSelected && (
                                <span className="px-2 py-0.2 rounded-full bg-purple-600 text-white text-[9px] font-extrabold uppercase">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 font-medium line-clamp-2 mt-0.5">
                              {addr.addressLine}
                            </p>
                            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                              {addr.city || 'Chennai'}, {addr.state || 'Tamil Nadu'} - {addr.pincode || '600020'}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                            <Check size={14} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add New Address Button */}
                <button
                  type="button"
                  onClick={() => {
                    setAddressForm({
                      label: 'Home',
                      addressLine: '',
                      city: 'Chennai',
                      state: 'Tamil Nadu',
                      pincode: '600020',
                    });
                    setIsAddingNewAddress(true);
                  }}
                  className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-purple-300 hover:border-purple-600 bg-purple-50/40 hover:bg-purple-50 text-purple-700 text-xs font-black flex items-center justify-center gap-2 transition"
                >
                  <Plus size={16} />
                  <span>Add New Delivery Address</span>
                </button>
              </div>
            ) : (
              /* Add New Address Form */
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!addressForm.addressLine.trim()) return;
                  await saveUserAddress(addressForm);
                  setAddressFeedback('📍 Address saved permanently & set as default!');
                  setTimeout(() => {
                    setIsAddingNewAddress(false);
                    setShowAddressModal(false);
                    setAddressFeedback('');
                  }, 1000);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Address Label
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Home', 'Work', 'Other'].map((lbl) => (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => setAddressForm({ ...addressForm, label: lbl })}
                        className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          addressForm.label === lbl
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {lbl === 'Home' ? '🏠' : lbl === 'Work' ? '💼' : '📍'}
                        <span>{lbl}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Complete Street Address *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Flat / House No, Building, Street, Area (e.g. 14, 2nd Cross St, Gandhi Nagar, Adyar)"
                    value={addressForm.addressLine}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                      Pincode
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNewAddress(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md shadow-purple-500/25 transition active:scale-95"
                  >
                    Save & Deliver Here
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
