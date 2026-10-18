import React from 'react';
import { ChefHat, ReceiptText, Salad, Wallet, Home, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChefDesktopSidebar = ({ activeTab = 'orders', onSelectTab }) => {
  const navigate = useNavigate();

  const items = [
    { id: 'orders', label: 'Kitchen Orders', icon: ReceiptText },
    { id: 'menu', label: 'Menu & Recipes', icon: Salad },
    { id: 'earnings', label: 'Kitchen Earnings', icon: Wallet },
  ];

  return (
    <aside className="w-56 shrink-0 hidden lg:block select-none">
      <div className="sticky top-28 space-y-4 pr-3 border-r border-slate-100 py-2">
        {/* Chef Badge Header */}
        <div className="px-3.5 py-2.5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
            <ChefHat size={18} />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 leading-tight">Chef Kitchen</h4>
            <p className="text-[10px] text-purple-700 font-bold">FSSAI Certified</p>
          </div>
        </div>

        {/* Tab Items */}
        <nav className="space-y-1.5">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab?.(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 active:scale-95'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Switch to Customer App */}
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

export default ChefDesktopSidebar;
