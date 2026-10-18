import { useEffect, useState } from 'react';
import { 
  Users, 
  ChefHat, 
  ReceiptText, 
  Wallet, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import StatCard from '../../components/admin/StatCard';
import { adminApi } from '../../services/adminApi';
import { useDeviceMode } from '../../context/DeviceModeContext';

const statusStyle = {
  placed: 'bg-slate-100 text-slate-700 border-slate-200',
  accepted: 'bg-blue-50 text-blue-700 border-blue-200',
  preparing: 'bg-amber-50 text-amber-700 border-amber-200',
  ready: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  picked_up: 'bg-purple-50 text-purple-700 border-purple-200',
  on_the_way: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const { isMobileView } = useDeviceMode();
  const navigate = useNavigate();

  useEffect(() => {
    adminApi
      .dashboard()
      .then(({ data }) => setStats(data.data))
      .catch(() => setStats(null));
  }, []);

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        
        {/* 1. HERO BANNER (MATCHES HOME PAGE GRADIENT) */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 z-10 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wide">
              <ShieldCheck size={14} className="text-emerald-300" />
              <span>Platform Health: 100% Operational</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black leading-snug">
              NutriFit Kitchens & Delivery Network
            </h2>
            <p className="text-xs text-purple-200 font-medium">
              Real-time monitoring of customer orders, home chefs, and active delivery partners across Chennai.
            </p>
          </div>

          <div className="flex items-center gap-2 z-10">
            <button
              onClick={() => navigate('/admin/chefs')}
              className="px-4 py-2.5 rounded-xl bg-white text-purple-700 font-black text-xs shadow-md transition hover:bg-purple-50 active:scale-95 flex items-center gap-1.5"
            >
              <span>Review Chefs</span>
              <ArrowRight size={13} />
            </button>
            <button
              onClick={() => navigate('/admin/orders')}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-black text-xs border border-white/20 transition active:scale-95"
            >
              Live Orders
            </button>
          </div>
        </div>

        {/* 2. STATS CARDS GRID (4 CARDS MATCHING HOME PAGE VALUE PILLS) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label="Total Customers"
            value={stats?.totalUsers ?? '—'}
            icon={Users}
            accent="#8B5CF6"
          />
          <StatCard
            label="Verified Chefs"
            value={stats?.totalChefs ?? '—'}
            icon={ChefHat}
            accent="#10B981"
          />
          <StatCard
            label="Total Orders"
            value={stats?.totalOrders ?? '—'}
            icon={ReceiptText}
            accent="#F59E0B"
          />
          <StatCard
            label="Total Revenue"
            value={stats?.totalRevenue ? `₹${stats.totalRevenue}` : '—'}
            icon={Wallet}
            accent="#6366F1"
          />
        </div>

        {/* 3. RECENT ORDERS SECTION */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">Recent Orders</h3>
              <p className="text-xs text-slate-500 font-medium">Latest incoming meals and live status</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1"
            >
              <span>View all orders</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {stats?.recentOrders?.length ? (
            !isMobileView ? (
              /* Desktop Table View */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">Order #</th>
                      <th className="py-3 px-3">Customer</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recentOrders.map((o) => (
                      <tr key={o._id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-3 font-black text-purple-700">{o.orderNumber}</td>
                        <td className="py-3.5 px-3 font-bold text-slate-800">{o.customer?.name || 'Customer'}</td>
                        <td className="py-3.5 px-3 font-extrabold text-slate-900">₹{o.totalAmount}</td>
                        <td className="py-3.5 px-3">
                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${statusStyle[o.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                            {o.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => navigate(`/order/${o._id}`)}
                            className="text-xs font-bold text-purple-700 hover:text-purple-800 hover:underline"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Mobile Card View */
              <div className="space-y-3">
                {stats.recentOrders.map((o) => (
                  <div
                    key={o._id}
                    onClick={() => navigate(`/order/${o._id}`)}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between cursor-pointer active:scale-98 transition"
                  >
                    <div>
                      <p className="text-xs font-black text-purple-700">{o.orderNumber}</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">{o.customer?.name || 'Customer'}</p>
                      <p className="text-xs font-extrabold text-slate-900 mt-0.5">₹{o.totalAmount}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${statusStyle[o.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {o.status.replace('_', ' ')}
                      </span>
                      <ChevronRight size={16} className="text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              No recent orders found.
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
};

export default Dashboard;
