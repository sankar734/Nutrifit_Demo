import { useEffect, useState, useMemo } from 'react';
import { 
  ChefHat, 
  Wallet, 
  ReceiptText, 
  Clock, 
  Home, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Phone, 
  MapPin, 
  AlertCircle,
  Plus,
  Salad,
  Bell
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import MobileLayout from '../../components/customer/MobileLayout';
import ChefDesktopSidebar from '../../components/chef/ChefDesktopSidebar';
import { chefApi, orderApi } from '../../services/api';
import { getSocket } from '../../services/socket';
import { useDeviceMode } from '../../context/DeviceModeContext';
import { useAuth } from '../../context/AuthContext';
import sampleFoods from '../../data/sampleFoods';

const nextStatusMap = {
  placed: 'accepted',
  accepted: 'preparing',
  preparing: 'ready',
};

const statusLabel = {
  placed: 'New Order',
  accepted: 'Accepted',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  picked_up: 'Picked Up',
  on_the_way: 'On the Way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
};

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

const ChefDashboard = () => {
  const navigate = useNavigate();
  const { isMobileView } = useDeviceMode();
  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('active');
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'menu' | 'earnings'
  const [liveNotice, setLiveNotice] = useState('');

  const load = () => {
    chefApi.dashboard().then(({ data }) => setDashboard(data.data)).catch(() => {});
    orderApi
      .chefOrders(filter === 'active' ? {} : { status: filter })
      .then(({ data }) => setOrders(data.data.orders))
      .catch(() => setOrders([]));
  };

  useEffect(() => {
    load();
    const socket = getSocket();
    if (dashboard?.chef?._id) socket.emit('join_chef', dashboard.chef._id);
    const handleNewOrder = (payload) => {
      setLiveNotice(`🔔 New incoming order received!`);
      load();
      setTimeout(() => setLiveNotice(''), 6000);
    };
    const handleOrderCancelled = (payload) => {
      setLiveNotice(`⚠️ Order #${payload.orderNumber || ''} was cancelled by customer.`);
      load();
      setTimeout(() => setLiveNotice(''), 8000);
    };
    socket.on('new_order', handleNewOrder);
    socket.on('order_cancelled', handleOrderCancelled);
    socket.on('order_status_update', load);
    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('order_cancelled', handleOrderCancelled);
      socket.off('order_status_update', load);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, dashboard?.chef?._id]);

  const advanceStatus = async (order) => {
    const next = nextStatusMap[order.status];
    if (!next) return;
    await orderApi.updateStatus(order._id, { status: next });
    load();
  };

  const rejectOrder = async (order) => {
    await orderApi.updateStatus(order._id, { status: 'rejected', cancellationReason: 'Kitchen unavailable' });
    load();
  };

  const activeOrders = useMemo(() => {
    return orders.filter((o) => !['delivered', 'cancelled', 'rejected'].includes(o.status));
  }, [orders]);

  const { user } = useAuth();
  const displayedOrders = filter === 'active' ? activeOrders : orders;
  const kitchenName = dashboard?.chef?.kitchenName || (user?.name ? `${user.name}'s Healthy Kitchen` : "My Healthy Kitchen");
  const chefName = dashboard?.chef?.user?.name || user?.name || 'Chef';
  const chefEmail = dashboard?.chef?.user?.email || user?.email || '';
  const chefSpecialties = dashboard?.chef?.specialties?.join(' · ') || 'South Indian · Diabetic Friendly · High Protein';

  return (
    <MobileLayout fullWidth={!isMobileView} showNav={false}>
      {!isMobileView ? (
        /* ========================================================================= */
        /* 1. DESKTOP VIEW LAYOUT (Matches Home Page Max-W-1440 Structure)           */
        /* ========================================================================= */
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-8 items-start">
            
            {/* LEFT SIDEBAR NAVIGATION */}
            <ChefDesktopSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 min-w-0 space-y-6">
              
              {/* 1.1 HERO BANNER (MATCHES HOME PAGE BANNER) */}
              <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-6 sm:p-8 shadow-md flex items-center justify-between relative overflow-hidden">
                <div className="space-y-3 z-10 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wide">
                    <ShieldCheck size={14} className="text-emerald-300" />
                    <span>FSSAI Verified Home Kitchen</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
                    <span className="text-emerald-300">Live & Taking Orders</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black leading-tight">
                    {kitchenName}
                  </h1>

                  <p className="text-xs sm:text-sm text-purple-200 font-medium">
                    Chef: <b className="text-white">{chefName}</b> {chefEmail && `(${chefEmail})`} · {chefSpecialties}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-white font-bold border border-white/20">
                      ★ {dashboard?.chef?.rating || 4.8} ({dashboard?.chef?.totalReviews || 128} reviews)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-purple-200 font-medium">
                      📍 {dashboard?.chef?.address || 'Chennai, Tamil Nadu'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 font-bold border border-emerald-400/30">
                      KYC: {dashboard?.chef?.kycStatus?.toUpperCase() || 'VERIFIED'}
                    </span>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-3 z-10">
                  <button
                    onClick={() => navigate('/home')}
                    className="px-4 py-2.5 rounded-xl bg-white text-purple-700 font-black text-xs shadow-md transition hover:bg-purple-50 active:scale-95 flex items-center gap-1.5"
                  >
                    <Home size={14} />
                    <span>Customer Site</span>
                  </button>
                </div>
              </div>

              {/* 1.2 LIVE NOTIFICATION BANNER */}
              {liveNotice && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 flex items-center justify-between animate-fade-in shadow-xs">
                  <div className="flex items-center gap-2.5 text-xs font-bold">
                    <Bell size={16} className="text-amber-600 animate-bounce" />
                    <span>{liveNotice}</span>
                  </div>
                  <button
                    onClick={() => setLiveNotice('')}
                    className="text-xs text-amber-600 font-bold hover:underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* 1.3 FOUR VALUE PROPOSITION / STATS PILLS (MATCHES HOME PAGE) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:shadow-xs transition">
                  <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <ReceiptText size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 leading-tight">
                      {dashboard?.stats?.totalOrders ?? 0}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">Total Orders</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:shadow-xs transition">
                  <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 leading-tight">
                      {dashboard?.stats?.pendingOrders ?? activeOrders.length}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">Active Cooking</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:shadow-xs transition">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 leading-tight">
                      ₹{dashboard?.stats?.totalEarnings ?? 1850}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">Kitchen Earnings</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:shadow-xs transition">
                  <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 leading-tight">4.9 ★</h4>
                    <p className="text-xs text-slate-500 font-medium">Hygiene Rating</p>
                  </div>
                </div>
              </div>

              {/* 1.4 TAB 1: KITCHEN ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {/* Status Filters Bar */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                      {[
                        { id: 'active', label: 'Active Kitchen Tickets' },
                        { id: 'delivered', label: 'Completed' },
                        { id: 'cancelled', label: 'Cancelled' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setFilter(t.id)}
                          className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap ${
                            filter === t.id
                              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 scale-102'
                              : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    <span className="text-xs font-bold text-slate-500">
                      {displayedOrders.length} {displayedOrders.length === 1 ? 'Order' : 'Orders'}
                    </span>
                  </div>

                  {/* Orders Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {displayedOrders.map((o) => (
                      <div
                        key={o._id}
                        className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4 group"
                      >
                        <div>
                          {/* Order Header */}
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                              <span className="text-xs font-black text-purple-700">
                                {o.orderNumber}
                              </span>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {new Date(o.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${statusStyle[o.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                              {statusLabel[o.status] || o.status}
                            </span>
                          </div>

                          {/* Customer info */}
                          <div className="py-2.5 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-slate-800">{o.customer?.name || 'Customer'}</p>
                              <p className="text-slate-500 text-[11px]">{o.customer?.phone || '+91 98765 43210'}</p>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                              📍 {o.deliveryAddress?.city || 'Chennai'}
                            </span>
                          </div>

                          {/* Items Breakdown */}
                          <div className="bg-slate-50/70 rounded-2xl p-3 space-y-1.5 text-xs">
                            {o.items?.map((it, idx) => (
                              <div key={idx} className="flex justify-between items-center text-slate-700">
                                <span className="font-semibold">
                                  {it.quantity} × {it.name || 'Homemade Bowl'}
                                </span>
                                <span className="font-bold text-slate-900">₹{(it.price || 180) * (it.quantity || 1)}</span>
                              </div>
                            ))}
                            <div className="border-t border-slate-200/60 pt-2 mt-1 flex justify-between font-black text-slate-900 text-xs sm:text-sm">
                              <span>Total Payout</span>
                              <span className="text-purple-700">₹{o.totalAmount}</span>
                            </div>
                          </div>
                        </div>

                        {/* Order Actions */}
                        <div>
                          {['placed', 'accepted', 'preparing'].includes(o.status) ? (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => advanceStatus(o)}
                                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md shadow-purple-500/25 transition active:scale-95"
                              >
                                Mark as {statusLabel[nextStatusMap[o.status]]}
                              </button>
                              {o.status === 'placed' && (
                                <button
                                  type="button"
                                  onClick={() => rejectOrder(o)}
                                  className="px-4 py-3 rounded-xl bg-white border border-rose-200 text-rose-600 font-bold text-xs hover:bg-rose-50 transition"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => navigate(`/order/${o._id}`)}
                              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                            >
                              View Ticket Details
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {displayedOrders.length === 0 && (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-2">
                      <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto text-2xl">
                        🍳
                      </div>
                      <h4 className="text-sm font-black text-slate-900">No active kitchen orders</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Your kitchen is online and ready. New incoming customer orders will pop up here in real time.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 1.5 TAB 2: MENU & RECIPES */}
              {activeTab === 'menu' && (
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-black text-slate-900">Kitchen Menu Dishes</h3>
                      <p className="text-xs text-slate-500">Live dishes currently being cooked in your kitchen</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(dashboard?.foods?.length ? dashboard.foods : sampleFoods).map((f) => (
                      <div key={f._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3 hover:shadow-xs transition">
                        <img src={f.images?.[0] || '/food-images/grilled-chicken-breast-1.jpg'} alt={f.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${f.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <h4 className="text-xs font-black text-slate-900 truncate">{f.name}</h4>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            {f.nutrition?.calories || 320} kcal · {f.nutrition?.protein || 18}g protein · ₹{f.discountPrice || f.price}
                          </p>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                            ● Live on Menu
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 1.6 TAB 3: EARNINGS & PAYOUTS */}
              {activeTab === 'earnings' && (
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-black text-slate-900">Kitchen Financial Overview</h3>
                      <p className="text-xs text-slate-500">Weekly payouts deposited directly to your bank account</p>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      Standard Payout Rate: 85% Net
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-center">
                      <span className="text-xs font-bold text-slate-500">Total Net Earnings</span>
                      <p className="text-2xl font-black text-purple-700 mt-1">₹{dashboard?.stats?.totalEarnings ?? 0}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center">
                      <span className="text-xs font-bold text-slate-500">Delivered Orders</span>
                      <p className="text-2xl font-black text-emerald-700 mt-1">{dashboard?.stats?.deliveredCount ?? 0}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 text-center">
                      <span className="text-xs font-bold text-slate-500">Pending Cooking Tickets</span>
                      <p className="text-2xl font-black text-amber-700 mt-1">{dashboard?.stats?.pendingOrders ?? 0}</p>
                    </div>
                  </div>

                  {/* Earnings Table */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-sm font-black text-slate-900">Delivered Orders Breakdown</h4>
                    {dashboard?.deliveredOrders?.length ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                              <th className="py-2.5 px-3">Order #</th>
                              <th className="py-2.5 px-3">Gross Total</th>
                              <th className="py-2.5 px-3">Platform Fee (15%)</th>
                              <th className="py-2.5 px-3 text-right">Net Chef Payout</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {dashboard.deliveredOrders.map((o) => (
                              <tr key={o._id} className="hover:bg-slate-50/70 transition">
                                <td className="py-3 px-3 font-black text-purple-700">{o.orderNumber}</td>
                                <td className="py-3 px-3 font-bold text-slate-800">₹{o.subtotal || o.totalAmount}</td>
                                <td className="py-3 px-3 text-rose-500 font-semibold">-₹{o.chefCommission || Math.round((o.subtotal || o.totalAmount) * 0.15)}</td>
                                <td className="py-3 px-3 text-right font-black text-emerald-600">+₹{o.chefEarning || Math.round((o.subtotal || o.totalAmount) * 0.85)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        No delivered orders settled yet. Cook and hand over orders to delivery partners to record payouts!
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      ) : (

        /* ========================================================================= */
        /* 2. MOBILE VIEW LAYOUT (Matches Home Page Mobile View)                     */
        /* ========================================================================= */
        <div className="p-4 space-y-4 max-w-md mx-auto pb-24">
          
          {/* 2.1 MOBILE TOP BAR */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👨‍🍳</span>
              <div>
                <span className="text-sm font-black text-slate-900 leading-tight block truncate max-w-[200px]">
                  {kitchenName}
                </span>
                <span className="text-[10px] text-purple-700 font-extrabold uppercase">
                  Chef Kitchen Console
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="p-2 rounded-xl bg-slate-100 text-slate-700"
                title="Go to Customer View"
              >
                <Home size={16} />
              </button>
            </div>
          </div>

          {/* 2.2 MOBILE HERO BANNER (MATCHES HOME PAGE PURPLE BANNER) */}
          <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden flex items-center justify-between">
            <div className="space-y-1.5 max-w-[210px] z-10">
              <span className="text-[9px] font-extrabold uppercase bg-white/20 px-2 py-0.5 rounded-full tracking-wide">
                FSSAI Verified Kitchen
              </span>
              <h2 className="text-base font-black leading-snug">
                {activeOrders.length} Active Cooking Tickets
              </h2>
              <p className="text-[10px] text-purple-200 leading-tight">
                Fresh ingredients • 100% Homemade
              </p>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl border border-white/30 shrink-0">
              🥘
            </div>
          </div>

          {/* 2.3 4 PILL FEATURE ICONS (MATCHES HOME PAGE) */}
          <div className="grid grid-cols-3 gap-2 py-1">
            <div className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-white border border-slate-100 shadow-2xs text-center">
              <ReceiptText size={18} className="text-purple-600" />
              <span className="text-sm font-black text-slate-900 leading-none">{dashboard?.stats?.totalOrders ?? 0}</span>
              <span className="text-[9px] font-bold text-slate-500">Orders</span>
            </div>

            <div className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-white border border-slate-100 shadow-2xs text-center">
              <Clock size={18} className="text-amber-500" />
              <span className="text-sm font-black text-slate-900 leading-none">{activeOrders.length}</span>
              <span className="text-[9px] font-bold text-slate-500">Active</span>
            </div>

            <div className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-white border border-slate-100 shadow-2xs text-center">
              <Wallet size={18} className="text-emerald-500" />
              <span className="text-sm font-black text-slate-900 leading-none">₹{dashboard?.stats?.totalEarnings ?? 0}</span>
              <span className="text-[9px] font-bold text-slate-500">Earnings</span>
            </div>
          </div>

          {/* 2.4 FILTER PILLS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
            {['active', 'delivered', 'cancelled'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                  filter === f
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f === 'active' ? 'Active Orders' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* 2.5 MOBILE ORDERS LIST */}
          <div className="space-y-3 pt-1">
            {displayedOrders.map((o) => (
              <div
                key={o._id}
                className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-purple-700">{o.orderNumber}</span>
                    <p className="text-[10px] text-slate-400">Customer: {o.customer?.name || 'Foodie'}</p>
                  </div>
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${statusStyle[o.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                    {statusLabel[o.status] || o.status}
                  </span>
                </div>

                {/* Items */}
                <div className="bg-slate-50 rounded-2xl p-2.5 text-xs space-y-1">
                  {o.items?.map((it, i) => (
                    <div key={i} className="flex justify-between text-slate-700">
                      <span>{it.quantity} × {it.name}</span>
                      <span className="font-bold">₹{(it.price || 180) * (it.quantity || 1)}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-200/60 pt-1.5 mt-1 flex justify-between font-black text-slate-900">
                    <span>Payout</span>
                    <span className="text-purple-700">₹{o.totalAmount}</span>
                  </div>
                </div>

                {/* Status Advancement Action */}
                {['placed', 'accepted', 'preparing'].includes(o.status) ? (
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => advanceStatus(o)}
                      className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white font-extrabold text-xs shadow-xs active:scale-95 transition"
                    >
                      Mark as {statusLabel[nextStatusMap[o.status]]}
                    </button>
                    {o.status === 'placed' && (
                      <button
                        type="button"
                        onClick={() => rejectOrder(o)}
                        className="px-3 py-2.5 rounded-xl bg-white border border-rose-200 text-rose-600 font-bold text-xs"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate(`/order/${o._id}`)}
                    className="w-full py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                  >
                    View Details
                  </button>
                )}
              </div>
            ))}

            {displayedOrders.length === 0 && (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 space-y-2">
                <span className="text-3xl">🍲</span>
                <p className="text-xs font-bold text-slate-700">No active kitchen orders</p>
                <p className="text-[11px] text-slate-400">All caught up! New orders will notify you automatically.</p>
              </div>
            )}
          </div>

        </div>
      )}
    </MobileLayout>
  );
};

export default ChefDashboard;
