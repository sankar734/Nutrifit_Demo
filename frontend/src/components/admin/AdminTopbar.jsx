import { useState, useRef, useEffect } from 'react';
import { LogOut, Home, ShieldCheck, User as UserIcon, Settings, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminTopbar = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            System Administration & Platform Controls
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Switch to customer view */}
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition border border-purple-200"
          title="Go to Customer View"
        >
          <Home size={14} />
          <span>Customer Site</span>
        </button>

        {/* User Info & Avatar Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-purple-50 border border-transparent hover:border-purple-200 transition text-left group"
          >
            <div className="text-right hidden md:block">
              <p className="text-xs font-black text-slate-900 leading-tight group-hover:text-purple-700 transition">
                {user?.name || 'Admin User'}
              </p>
              <p className="text-[10px] text-purple-700 font-bold uppercase leading-tight">
                {user?.role || 'Admin'}
              </p>
            </div>

            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-xs ring-2 ring-purple-100">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <ChevronDown size={14} className="text-slate-400 group-hover:text-purple-600 transition hidden sm:block" />
          </button>

          {/* Admin Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-slate-200/80 py-2.5 z-50 animate-fade-up">
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                <p className="text-sm font-extrabold text-slate-900 truncate">
                  {user?.name || 'SuperAdmin'}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {user?.email || 'admin@nutrichef.demo'}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider">
                    {user?.role || 'SUPERADMIN'}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Full Access
                  </span>
                </div>
              </div>

              {/* Links */}
              <div className="p-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/profile');
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition"
                >
                  <UserIcon size={16} className="text-purple-600" />
                  <span>Admin Profile & Account</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/admin/coupons');
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition"
                >
                  <Settings size={16} className="text-purple-600" />
                  <span>Platform Discounts & Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/home');
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition"
                >
                  <Home size={16} className="text-purple-600" />
                  <span>Customer Storefront</span>
                </button>
              </div>

              {/* Sign Out */}
              <div className="border-t border-slate-100 mt-1 pt-1 px-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Direct Logout Button */}
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 flex items-center justify-center transition border border-slate-200"
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
};

export default AdminTopbar;
