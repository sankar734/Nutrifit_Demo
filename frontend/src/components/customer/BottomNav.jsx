import { NavLink } from 'react-router-dom';
import { Home, Search, ShoppingBag, Salad, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

const navItems = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/cart', icon: ShoppingBag, label: 'Cart' },
  { to: '/nutrition', icon: Salad, label: 'Nutrition' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const BottomNav = () => {
  const { totalItems } = useCart() || { totalItems: 0 };
  const cartBadge = totalItems || 0;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 flex justify-between z-30 shadow-lg">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `relative flex flex-col items-center gap-0.5 flex-1 py-1 rounded-2xl transition-all ${
              isActive 
                ? 'text-purple-700 font-extrabold scale-105' 
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`
          }
        >
          <Icon size={20} strokeWidth={2.2} />
          <span className="text-[10px] tracking-tight">{label}</span>
          {label === 'Cart' && cartBadge > 0 && (
            <span className="absolute top-0 right-4 sm:right-6 bg-rose-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
              {cartBadge}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
