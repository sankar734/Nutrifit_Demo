import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, Users, ChefHat, ReceiptText, Tag, ArrowRight, ShieldCheck, Home } from 'lucide-react';

const navItems = [
  { to: '/admin', end: true, icon: LayoutGrid, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/chefs', icon: ChefHat, label: 'Chefs' },
  { to: '/admin/orders', icon: ReceiptText, label: 'Orders' },
  { to: '/admin/coupons', icon: Tag, label: 'Coupons' },
];

const AdminSidebar = () => {
  const navigate = useNavigate();

  return (
    <aside className="w-56 shrink-0 hidden lg:block select-none">
      <div className="sticky top-28 space-y-4 pr-3 border-r border-slate-100 py-2">
        {/* Admin Badge Header */}
        <div className="px-3 py-2 bg-purple-50/70 border border-purple-100 rounded-2xl flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
            <ShieldCheck size={16} />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 leading-tight">Admin Console</h4>
            <p className="text-[10px] text-purple-700 font-bold">NutriFit SuperAdmin</p>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="space-y-1.5">
          {navItems.map(({ to, end, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 active:scale-95'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Quick Customer App Switcher */}
        <div className="pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs group"
          >
            <div className="flex items-center gap-2">
              <Home size={15} className="text-purple-400" />
              <span>Customer App</span>
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover:text-white transition" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
