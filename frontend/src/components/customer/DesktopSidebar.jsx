import React from 'react';
import { 
  Home, 
  Compass, 
  Salad, 
  Tag, 
  Package, 
  User,
  ChefHat,
  Bike,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const sidebarItems = [
  { id: 'home', label: 'Home', icon: Home, path: '/home' },
  { id: 'explore', label: 'Explore', icon: Compass, path: '/search' },
  { id: 'nutrition', label: 'Nutrition Hub', icon: Salad, path: '/nutrition' },
  { id: 'offers', label: 'Offers', icon: Tag, path: '/settings' },
  { id: 'orders', label: 'Orders', icon: Package, path: '/my-orders' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

const DesktopSidebar = ({ activeItem }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const getIsActive = (item) => {
    if (activeItem) return activeItem === item.id;
    if (item.id === 'home' && location.pathname === '/home') return true;
    if (item.id === 'explore' && location.pathname === '/search') return true;
    if (item.id === 'nutrition' && location.pathname === '/nutrition') return true;
    if (item.id === 'orders' && location.pathname === '/my-orders') return true;
    if (item.id === 'profile' && location.pathname === '/profile') return true;
    return false;
  };

  return (
    <aside className="w-56 shrink-0 hidden lg:block select-none">
      <div className="sticky top-28 space-y-4 pr-3 border-r border-slate-100 py-2">
        {/* Main Navigation Items */}
        <div className="space-y-1.5">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = getIsActive(item);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 active:scale-95'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-600'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Role Console Switcher or Partner Cards */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          {user?.role === 'chef' && (
            <button
              type="button"
              onClick={() => navigate('/chef')}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition"
            >
              <div className="flex items-center gap-2">
                <ChefHat size={16} className="text-amber-600" />
                <span>Chef Kitchen</span>
              </div>
              <ArrowRight size={14} className="text-amber-600" />
            </button>
          )}

          {user?.role === 'delivery' && (
            <button
              type="button"
              onClick={() => navigate('/delivery')}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold transition"
            >
              <div className="flex items-center gap-2">
                <Bike size={16} className="text-emerald-600" />
                <span>Delivery Fleet</span>
              </div>
              <ArrowRight size={14} className="text-emerald-600" />
            </button>
          )}

          {(user?.role === 'admin' || user?.role === 'superadmin') && (
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 text-xs font-bold transition"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-purple-600" />
                <span>Admin Console</span>
              </div>
              <ArrowRight size={14} className="text-purple-600" />
            </button>
          )}

          {user?.role !== 'chef' && user?.role !== 'delivery' && (
            <div className="p-3 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100/80 rounded-2xl space-y-2">
              <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider">
                Earn with NutriFit
              </span>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => navigate('/become-chef')}
                  className="w-full text-left text-xs font-bold text-slate-700 hover:text-purple-700 flex items-center justify-between py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <ChefHat size={13} className="text-purple-600" />
                    <span>Become a Chef</span>
                  </span>
                  <ArrowRight size={12} className="text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/become-delivery')}
                  className="w-full text-left text-xs font-bold text-slate-700 hover:text-purple-700 flex items-center justify-between py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <Bike size={13} className="text-emerald-600" />
                    <span>Become a Rider</span>
                  </span>
                  <ArrowRight size={12} className="text-slate-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
