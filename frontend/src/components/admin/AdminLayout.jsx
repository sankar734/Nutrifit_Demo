import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  Users, 
  ChefHat, 
  ReceiptText, 
  Tag, 
  ShieldCheck, 
  LogOut, 
  Home 
} from 'lucide-react';
import MobileLayout from '../customer/MobileLayout';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import { useDeviceMode } from '../../context/DeviceModeContext';
import { useAuth } from '../../context/AuthContext';

const mobileNavTabs = [
  { to: '/admin', end: true, icon: LayoutGrid, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/chefs', icon: ChefHat, label: 'Chefs' },
  { to: '/admin/orders', icon: ReceiptText, label: 'Orders' },
  { to: '/admin/coupons', icon: Tag, label: 'Coupons' },
];

const AdminLayout = ({ title, children }) => {
  const { isMobileView } = useDeviceMode();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <MobileLayout fullWidth={!isMobileView} showNav={false}>
      {!isMobileView ? (
        /* ========================================================================= */
        /* 1. DESKTOP VIEW LAYOUT (Matches Home Page Desktop Max-W-1440 Structure)    */
        /* ========================================================================= */
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-8 items-start">
            {/* LEFT SIDEBAR NAVIGATION */}
            <AdminSidebar />

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 min-w-0 space-y-6">
              <AdminTopbar title={title} />
              <main>{children}</main>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 2. MOBILE VIEW LAYOUT (Matches Home Page Mobile Layout)                   */
        /* ========================================================================= */
        <div className="p-4 space-y-4 max-w-md mx-auto pb-20">
          {/* Mobile Top Bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <ShieldCheck size={18} />
              </div>
              <div>
                <span className="text-sm font-black text-slate-900 leading-none block">
                  NutriFit Admin
                </span>
                <span className="text-[10px] text-purple-700 font-bold uppercase leading-none">
                  {title}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                title="Go to Customer View"
              >
                <Home size={16} />
              </button>
              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>

          {/* Horizontal Scrollable Subnav Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
            {mobileNavTabs.map(({ to, end, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`
                }
              >
                <Icon size={13} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>

          {/* Mobile Main Content */}
          <main className="space-y-4">{children}</main>
        </div>
      )}
    </MobileLayout>
  );
};

export default AdminLayout;
