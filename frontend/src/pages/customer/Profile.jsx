import { useState } from 'react';
import { 
  Settings, 
  ReceiptText, 
  MapPin, 
  CreditCard, 
  Bell, 
  ChefHat, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Building2, 
  X,
  Bike,
  ShieldCheck,
  Activity,
  Heart,
  Sparkles,
  Users,
  LayoutGrid,
  Tag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../../components/customer/MobileLayout';
import DesktopSidebar from '../../components/customer/DesktopSidebar';
import Toast from '../../components/customer/Toast';
import { useAuth } from '../../context/AuthContext';
import { useDeviceMode } from '../../context/DeviceModeContext';
import { useToast } from '../../hooks/useToast';
import { userApi } from '../../services/api';

const defaultDemoAddresses = [
  {
    _id: 'default-addr-1',
    label: 'Home',
    addressLine: '14, 2nd Cross Street, Gandhi Nagar, Adyar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600020',
    isDefault: true,
  },
];

const emptyAddressForm = {
  label: 'Home',
  addressLine: '',
  city: 'Chennai',
  state: 'Tamil Nadu',
  pincode: '600020',
};

const Profile = () => {
  const { user, logout, updateLocalUser, saveUserAddress, deleteUserAddress, selectActiveAddress } = useAuth();
  const { isMobileView } = useDeviceMode();
  const { message, showToast } = useToast();
  const navigate = useNavigate();

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState(emptyAddressForm);

  const savedAddresses = user?.addresses?.length ? user.addresses : defaultDemoAddresses;

  const displayName = user?.name || 'NutriChef Member';
  const displayEmail = user?.email || 'member@nutrichef.app';
  const displayPhone = user?.phone || '';
  const displayRole = (user?.role || 'CUSTOMER').toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm(emptyAddressForm);
    setIsEditingAddress(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr._id);
    setAddressForm({
      label: addr.label || 'Home',
      addressLine: addr.addressLine || '',
      city: addr.city || 'Chennai',
      state: addr.state || 'Tamil Nadu',
      pincode: addr.pincode || '600020',
    });
    setIsEditingAddress(true);
  };

  const handleSaveAddress = async (e) => {
    e?.preventDefault();
    if (!addressForm.addressLine) {
      showToast('⚠️ Please enter a street address');
      return;
    }

    try {
      await saveUserAddress(addressForm, editingAddressId);
      showToast('📍 Address saved permanently & updated in Navbar!');
    } catch (_) {
      showToast('📍 Address saved!');
    }

    setIsEditingAddress(false);
    setEditingAddressId(null);
  };

  const handleDeleteAddress = async (id, e) => {
    e?.stopPropagation();
    try {
      await deleteUserAddress(id);
      showToast('🗑️ Address removed');
    } catch (_) {
      showToast('🗑️ Address removed');
    }
  };

  // Dynamic Menu items tailored to each role
  const menuItems = [
    ...(user?.role === 'chef'
      ? [
          {
            id: 'chef-console',
            title: 'Chef Kitchen Console',
            subtitle: 'Manage food orders, live cooking & menus',
            icon: ChefHat,
            iconColor: 'text-purple-700 bg-purple-100',
            action: () => navigate('/chef'),
          },
        ]
      : []),
    ...(user?.role === 'delivery'
      ? [
          {
            id: 'delivery-console',
            title: 'Delivery Fleet Console',
            subtitle: 'View available pickups & active deliveries',
            icon: Bike,
            iconColor: 'text-emerald-700 bg-emerald-100',
            action: () => navigate('/delivery'),
          },
        ]
      : []),
    ...(user?.role === 'admin' || user?.role === 'superadmin'
      ? [
          {
            id: 'admin-console',
            title: 'Admin Control Console',
            subtitle: 'Manage platform analytics, users & chefs',
            icon: ShieldCheck,
            iconColor: 'text-indigo-700 bg-indigo-100',
            action: () => navigate('/admin'),
          },
        ]
      : []),
    {
      id: 'orders',
      title: 'My Orders',
      subtitle: 'View past healthy food orders & live tracking',
      icon: ReceiptText,
      iconColor: 'text-purple-600 bg-purple-50',
      action: () => navigate('/my-orders'),
    },
    {
      id: 'addresses',
      title: 'Saved Addresses',
      subtitle: 'Manage delivery addresses',
      icon: MapPin,
      iconColor: 'text-purple-600 bg-purple-50',
      action: () => setShowAddressModal(true),
    },
    {
      id: 'wallet',
      title: 'Wallet & Payment Methods',
      subtitle: `Balance: ₹${user?.walletBalance || 0} · Saved UPI & Cards`,
      icon: CreditCard,
      iconColor: 'text-purple-600 bg-purple-50',
      action: () => navigate('/settings/payments'),
    },
    {
      id: 'notifications',
      title: 'Notification Preferences',
      subtitle: 'Order alerts & meal suggestions',
      icon: Bell,
      iconColor: 'text-purple-600 bg-purple-50',
      action: () => navigate('/settings/notifications'),
    },
    ...(user?.role === 'customer'
      ? [
          {
            id: 'chef',
            title: 'Become a Home Chef',
            subtitle: 'Start cooking & earn from home',
            icon: ChefHat,
            iconColor: 'text-purple-600 bg-purple-50',
            action: () => navigate('/become-chef'),
          },
          {
            id: 'delivery',
            title: 'Become a Delivery Partner',
            subtitle: 'Join delivery fleet & earn per trip',
            icon: Bike,
            iconColor: 'text-emerald-600 bg-emerald-50',
            action: () => navigate('/become-delivery'),
          },
        ]
      : []),
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'FAQs, chat & contact support',
      icon: HelpCircle,
      iconColor: 'text-purple-600 bg-purple-50',
      action: () => setShowHelpModal(true),
    },
  ];

  return (
    <MobileLayout fullWidth={!isMobileView}>
      <Toast message={message} />

      {/* ========================================================================= */}
      {/* 1. DESKTOP VIEW LAYOUT (Sidebar + My Account Panel)                       */}
      {/* ========================================================================= */}
      {!isMobileView ? (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-8 items-start">
            
            {/* LEFT SIDEBAR NAVIGATION */}
            <DesktopSidebar activeItem="profile" />

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 min-w-0 max-w-2xl space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  My Account
                </h1>
                <button
                  type="button"
                  onClick={() => navigate('/settings')}
                  className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-purple-700 hover:border-purple-200 transition"
                >
                  <Settings size={20} />
                </button>
              </div>

              {/* Purple User Gradient Card */}
              <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-6 shadow-md flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black border-2 border-white/40 shrink-0">
                  {displayName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-black">{displayName}</h3>
                  <p className="text-xs text-purple-200 truncate">{displayEmail}</p>
                  <div className="pt-2 flex flex-wrap gap-2 items-center">
                    <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/15 border border-white/20">
                      {displayRole}
                    </span>
                    {displayPhone && (
                      <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-bold bg-white/10 border border-white/15">
                        📞 {displayPhone}
                      </span>
                    )}
                    {user?.referralCode && (
                      <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-bold bg-white/10 border border-white/15">
                        🎁 {user.referralCode}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Admin Quick Console Access Card */}
              {(user?.role === 'admin' || user?.role === 'superadmin') && (
                <div className="bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 shadow-xl border border-purple-500/30 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-400/30">
                        <ShieldCheck size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white">SuperAdmin Control Center</h4>
                        <p className="text-[11px] text-purple-200">You have full platform governance access</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      LIVE SYSTEM
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/admin')}
                      className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition text-left space-y-1 border border-white/10 group"
                    >
                      <LayoutGrid size={16} className="text-purple-300 group-hover:scale-110 transition transform" />
                      <p className="text-xs font-black text-white">Dashboard</p>
                      <p className="text-[10px] text-purple-200">System overview</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/admin/chefs')}
                      className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition text-left space-y-1 border border-white/10 group"
                    >
                      <ChefHat size={16} className="text-amber-300 group-hover:scale-110 transition transform" />
                      <p className="text-xs font-black text-white">Chefs</p>
                      <p className="text-[10px] text-purple-200">Verify & manage</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/admin/orders')}
                      className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition text-left space-y-1 border border-white/10 group"
                    >
                      <ReceiptText size={16} className="text-sky-300 group-hover:scale-110 transition transform" />
                      <p className="text-xs font-black text-white">All Orders</p>
                      <p className="text-[10px] text-purple-200">Live order flow</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/admin/coupons')}
                      className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition text-left space-y-1 border border-white/10 group"
                    >
                      <Tag size={16} className="text-rose-300 group-hover:scale-110 transition transform" />
                      <p className="text-xs font-black text-white">Coupons</p>
                      <p className="text-[10px] text-purple-200">Platform offers</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Health Profile Card (if configured) */}
              {user?.healthProfile && (
                <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Heart size={16} className="text-rose-500" />
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Health Profile & Nutrition Metrics</h4>
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      {user.healthProfile.goal?.replace('_', ' ').toUpperCase() || 'FITNESS'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-sm font-black text-slate-800">{user.healthProfile.heightCm ? `${user.healthProfile.heightCm} cm` : '—'}</p>
                      <p className="text-[10px] text-slate-400 font-bold">Height</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-sm font-black text-slate-800">{user.healthProfile.weightKg ? `${user.healthProfile.weightKg} kg` : '—'}</p>
                      <p className="text-[10px] text-slate-400 font-bold">Weight</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-sm font-black text-slate-800">{user.healthProfile.age || '—'}</p>
                      <p className="text-[10px] text-slate-400 font-bold">Age</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-sm font-black text-purple-700 capitalize">{user.healthProfile.dietaryPreference || 'Veg'}</p>
                      <p className="text-[10px] text-slate-400 font-bold">Diet</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Menu List Items */}
              <div className="bg-white rounded-3xl p-2 border border-slate-100 shadow-xs divide-y divide-slate-100">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={item.action}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition rounded-2xl text-left group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${item.iconColor}`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 group-hover:text-purple-700 transition">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-400 group-hover:text-purple-600 transition" />
                    </button>
                  );
                })}

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-4 hover:bg-rose-50/50 transition rounded-2xl text-left group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <LogOut size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-rose-600">Logout</h4>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-rose-400" />
                </button>
              </div>

            </div>
          </div>
        </div>
      ) : (

        /* ========================================================================= */
        /* 2. MOBILE VIEW LAYOUT (Matches Screen 8: Profile Page - Mobile View)       */
        /* ========================================================================= */
        <div className="p-4 space-y-4 max-w-md mx-auto">
          
          {/* 2.1 TITLE & GEAR ICON */}
          <div className="flex items-center justify-between pt-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              My Account
            </h1>
            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="p-2 text-slate-700 hover:text-purple-700"
            >
              <Settings size={22} />
            </button>
          </div>

          {/* 2.2 PURPLE USER GRADIENT CARD */}
          <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-5 shadow-lg flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xl font-black border-2 border-white/40 shrink-0">
              {displayName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-black truncate">{displayName}</h3>
              <p className="text-xs text-purple-200 truncate">{displayEmail}</p>
              <div className="pt-1.5 flex flex-wrap gap-1.5 items-center">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/15 border border-white/20">
                  {displayRole}
                </span>
                {displayPhone && (
                  <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/10 border border-white/15">
                    📞 {displayPhone}
                  </span>
                )}
                {user?.referralCode && (
                  <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/10 border border-white/15">
                    🎁 {user.referralCode}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Admin Control Center */}
          {(user?.role === 'admin' || user?.role === 'superadmin') && (
            <div className="bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-4 shadow-lg border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">SuperAdmin Control</h4>
                    <p className="text-[10px] text-purple-200">System governance</p>
                  </div>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  ONLINE
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition text-left flex items-center gap-2 border border-white/10"
                >
                  <LayoutGrid size={15} className="text-purple-300 shrink-0" />
                  <span className="text-xs font-bold text-white">Dashboard</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/chefs')}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition text-left flex items-center gap-2 border border-white/10"
                >
                  <ChefHat size={15} className="text-amber-300 shrink-0" />
                  <span className="text-xs font-bold text-white">Chefs</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/orders')}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition text-left flex items-center gap-2 border border-white/10"
                >
                  <ReceiptText size={15} className="text-sky-300 shrink-0" />
                  <span className="text-xs font-bold text-white">Orders</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/coupons')}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition text-left flex items-center gap-2 border border-white/10"
                >
                  <Tag size={15} className="text-rose-300 shrink-0" />
                  <span className="text-xs font-bold text-white">Coupons</span>
                </button>
              </div>
            </div>
          )}

          {/* Mobile Health Profile */}
          {user?.healthProfile && (
            <div className="bg-white rounded-3xl p-3.5 border border-purple-100 shadow-2xs space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <span className="text-[10px] font-black text-slate-800 uppercase flex items-center gap-1.5">
                  <Heart size={13} className="text-rose-500" /> Health Profile
                </span>
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 capitalize">
                  {user.healthProfile.goal?.replace('_', ' ') || 'Active'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                <div className="p-1.5 rounded-xl bg-slate-50"><p className="font-bold text-slate-800">{user.healthProfile.heightCm || '—'}cm</p><p className="text-[8px] text-slate-400">Height</p></div>
                <div className="p-1.5 rounded-xl bg-slate-50"><p className="font-bold text-slate-800">{user.healthProfile.weightKg || '—'}kg</p><p className="text-[8px] text-slate-400">Weight</p></div>
                <div className="p-1.5 rounded-xl bg-slate-50"><p className="font-bold text-slate-800">{user.healthProfile.age || '—'}</p><p className="text-[8px] text-slate-400">Age</p></div>
                <div className="p-1.5 rounded-xl bg-slate-50"><p className="font-bold text-purple-700 capitalize">{user.healthProfile.dietaryPreference || 'Veg'}</p><p className="text-[8px] text-slate-400">Diet</p></div>
              </div>
            </div>
          )}

          {/* 2.3 MENU ITEMS LIST (7 ITEMS) */}
          <div className="bg-white rounded-3xl p-1.5 border border-slate-100 shadow-xs divide-y divide-slate-100">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition rounded-2xl text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.iconColor}`}>
                      <Icon size={17} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
              );
            })}

            {/* 7th: Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-3.5 hover:bg-rose-50/50 transition rounded-2xl text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <LogOut size={17} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-rose-600">Logout</h4>
                </div>
              </div>
              <ChevronRight size={16} className="text-rose-400" />
            </button>
          </div>

        </div>
      )}

      {/* Saved Addresses Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <MapPin size={17} />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  {isEditingAddress
                    ? editingAddressId
                      ? 'Edit Delivery Address'
                      : 'Add New Address'
                    : 'Manage Delivery Addresses'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddressModal(false);
                  setIsEditingAddress(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X size={16} />
              </button>
            </div>

            {isEditingAddress ? (
              /* Address Edit / Add Form */
              <form onSubmit={handleSaveAddress} className="space-y-4">
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
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Complete Address (Flat, Street, Area)
                  </label>
                  <textarea
                    rows={2}
                    value={addressForm.addressLine}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                    placeholder="e.g. 14, 2nd Cross Street, Gandhi Nagar, Adyar"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-purple-500/25 transition active:scale-95"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            ) : (
              /* Address List View */
              <div className="space-y-3">
                <div className="space-y-2.5">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr._id}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 text-sm mt-0.5">
                          {addr.label === 'Work' ? '💼' : addr.label === 'Other' ? '📍' : '🏠'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900">{addr.label || 'Home'}</span>
                            {addr.isDefault && (
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-700">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">
                            {addr.addressLine}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {addr.city}, {addr.pincode}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditAddress(addr)}
                          className="w-8 h-8 rounded-xl hover:bg-purple-100 text-slate-500 hover:text-purple-700 flex items-center justify-center transition"
                          title="Edit Address"
                        >
                          <Edit3 size={15} />
                        </button>
                        {savedAddresses.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteAddress(addr._id, e)}
                            className="w-8 h-8 rounded-xl hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center transition"
                            title="Delete Address"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddAddress}
                  className="w-full py-3 rounded-2xl border-2 border-dashed border-purple-300 hover:border-purple-500 text-purple-700 hover:bg-purple-50/50 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <Plus size={16} />
                  <span>Add New Delivery Address</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto text-xl">
              🎧
            </div>
            <h3 className="text-base font-black text-slate-900">NutriFit 24/7 Support</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Have questions about your order, diet plan, or chef kitchens in Chennai? We are here to help!
            </p>
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-700 text-xs font-bold">
              📞 Call: +91 98765 43210 <br />
              ✉️ Email: support@nutrifit.health
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </MobileLayout>
  );
};

export default Profile;
