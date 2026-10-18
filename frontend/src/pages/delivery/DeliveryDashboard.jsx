import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bike, 
  Package, 
  Wallet, 
  CheckCircle2, 
  Home, 
  ChevronRight, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Clock, 
  Navigation, 
  Power,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import MobileLayout from '../../components/customer/MobileLayout';
import DeliveryDesktopSidebar from '../../components/delivery/DeliveryDesktopSidebar';
import { deliveryApi, orderApi } from '../../services/api';
import { getSocket } from '../../services/socket';
import { useDeviceMode } from '../../context/DeviceModeContext';
import { useAuth } from '../../context/AuthContext';

const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const { isMobileView } = useDeviceMode();
  const [dashboard, setDashboard] = useState(null);
  const [available, setAvailable] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [tab, setTab] = useState('available'); // 'available' | 'active' | 'earnings'
  const [notice, setNotice] = useState('');

  const load = () => {
    deliveryApi.dashboard().then(({ data }) => setDashboard(data.data)).catch(() => {});
    deliveryApi.availableOrders().then(({ data }) => setAvailable(data.data.orders)).catch(() => setAvailable([]));
    deliveryApi
      .myDeliveries({ status: 'picked_up,on_the_way' })
      .then(({ data }) => setMyDeliveries(data.data.orders))
      .catch(() => setMyDeliveries([]));
  };

  useEffect(() => {
    load();
    const socket = getSocket();
    socket.emit('join_delivery_pool');
    const onAvailable = (payload) => {
      setNotice(`⚡ New order ${payload.orderNumber} is ready for pickup!`);
      load();
      setTimeout(() => setNotice(''), 6000);
    };
    socket.on('order_available_for_pickup', onAvailable);
    return () => socket.off('order_available_for_pickup', onAvailable);
  }, []);

  const toggleOnline = async () => {
    const { data } = await deliveryApi.toggleOnline();
    setDashboard((d) => ({ ...d, partner: data.data.partner }));
  };

  const acceptOrder = async (e, orderId) => {
    e?.stopPropagation();
    await deliveryApi.accept(orderId);
    setTab('active');
    load();
  };

  const markDelivered = async (e, orderId) => {
    e?.stopPropagation();
    await orderApi.updateStatus(orderId, { status: 'delivered' });
    load();
  };

  const { user } = useAuth();
  const isOnline = dashboard?.partner?.isOnline;
  const partnerName = dashboard?.partner?.user?.name || user?.name || 'Rider';
  const partnerEmail = dashboard?.partner?.user?.email || user?.email || '';
  const partnerPhone = dashboard?.partner?.user?.phone || user?.phone || '+91 98765 43210';
  const vehicleNumber = dashboard?.partner?.vehicleNumber || 'TN 07 AB 1234';
  const vehicleType = (dashboard?.partner?.vehicleType || 'Bike').toUpperCase();

  return (
    <MobileLayout fullWidth={!isMobileView} showNav={false}>
      {!isMobileView ? (
        /* ========================================================================= */
        /* 1. DESKTOP VIEW LAYOUT (Matches Home Page Max-W-1440 Structure)           */
        /* ========================================================================= */
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-8 items-start">
            
            {/* LEFT SIDEBAR NAVIGATION */}
            <DeliveryDesktopSidebar activeTab={tab} onSelectTab={setTab} />

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 min-w-0 space-y-6">
              
              {/* 1.1 HERO BANNER (PURPLE WITH ONLINE/OFFLINE TOGGLE) */}
              <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-6 sm:p-8 shadow-md flex items-center justify-between relative overflow-hidden">
                <div className="space-y-3 z-10 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wide">
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
                    <span>{isOnline ? 'Online · Receiving Pickup Alerts' : 'Offline · Tap to Go Online'}</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black leading-tight">
                    {partnerName} · Delivery Fleet Console
                  </h1>

                  <p className="text-xs sm:text-sm text-purple-200 font-medium">
                    Pickup freshly prepared healthy meals from certified home kitchens and deliver directly to customers across Chennai.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-white font-bold border border-white/20">
                      🛵 {vehicleType} · {vehicleNumber}
                    </span>
                    {partnerEmail && (
                      <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-purple-200 font-medium">
                        ✉️ {partnerEmail}
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 font-bold border border-emerald-400/30">
                      🛡️ Fleet KYC Verified
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 z-10">
                  <button
                    type="button"
                    onClick={toggleOnline}
                    className={`px-5 py-3 rounded-2xl font-black text-xs shadow-md transition active:scale-95 flex items-center gap-2 ${
                      isOnline
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                        : 'bg-white hover:bg-slate-100 text-slate-900'
                    }`}
                  >
                    <Power size={15} />
                    <span>{isOnline ? 'Duty Active (Online)' : 'Go Online'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/home')}
                    className="px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 transition active:scale-95"
                  >
                    Customer Site
                  </button>
                </div>
              </div>

              {/* 1.2 REAL-TIME DISPATCH NOTICE */}
              {notice && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 flex items-center justify-between animate-fade-in shadow-xs">
                  <div className="flex items-center gap-2.5 text-xs font-bold">
                    <Package size={16} className="text-amber-600 animate-bounce" />
                    <span>{notice}</span>
                  </div>
                  <button
                    onClick={() => setNotice('')}
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
                    <Package size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 leading-tight">
                      {available.length}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">Ready for Pickup</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:shadow-xs transition">
                  <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Navigation size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 leading-tight">
                      {dashboard?.stats?.activeOrders ?? myDeliveries.length}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">Active Deliveries</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:shadow-xs transition">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 leading-tight">
                      {dashboard?.stats?.deliveredOrders ?? 12}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">Completed Deliveries</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs hover:shadow-xs transition">
                  <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 leading-tight">
                      ₹{dashboard?.stats?.walletBalance ?? 450}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">Wallet Balance</p>
                  </div>
                </div>
              </div>

              {/* 1.4 DISPATCH ORDERS SECTION */}
              <div className="space-y-4">
                {/* Segmented Filter Pills */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTab('available')}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                        tab === 'available'
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 scale-102'
                          : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
                      }`}
                    >
                      Available for Pickup ({available.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTab('active')}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                        tab === 'active'
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 scale-102'
                          : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
                      }`}
                    >
                      My Active Dispatches ({myDeliveries.length})
                    </button>
                  </div>
                </div>

                {/* Tab: Available Orders */}
                {tab === 'available' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {available.map((o) => (
                      <div
                        key={o._id}
                        className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                              <span className="text-xs font-black text-purple-700">{o.orderNumber}</span>
                              <p className="text-[11px] text-slate-400">Freshly Prepared Meal</p>
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase border border-emerald-200">
                              Ready for Pickup
                            </span>
                          </div>

                          {/* Pickup Chef */}
                          <div className="flex items-start gap-2.5 text-xs">
                            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                              <MapPin size={14} />
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Pickup Kitchen:</span>
                              <p className="font-bold text-slate-800">{o.chef?.kitchenName || 'Verified Home Kitchen'}</p>
                            </div>
                          </div>

                          {/* Delivery Drop */}
                          <div className="flex items-start gap-2.5 text-xs">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                              <Navigation size={14} />
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Deliver To:</span>
                              <p className="font-bold text-slate-800">{o.deliveryAddress?.addressLine || 'Customer Address'}, {o.deliveryAddress?.city || 'Chennai'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={(e) => acceptOrder(e, o._id)}
                            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-500/25 transition active:scale-95 flex items-center justify-center gap-1.5"
                          >
                            <span>Accept Delivery Dispatch</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {available.length === 0 && (
                      <div className="col-span-2 bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-2">
                        <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto text-2xl">
                          🛵
                        </div>
                        <h4 className="text-sm font-black text-slate-900">No pending pickups right now</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          Stay online! When home chefs pack and mark dishes as ready, they will instantly appear on your radar.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: My Active Deliveries */}
                {tab === 'active' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {myDeliveries.map((o) => (
                      <div
                        key={o._id}
                        className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                              <span className="text-xs font-black text-purple-700">{o.orderNumber}</span>
                              <p className="text-[11px] text-slate-400">On The Way</p>
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase border border-blue-200">
                              Picked Up · In Transit
                            </span>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1">
                            <p className="font-bold text-slate-800">Customer: {o.customer?.name || 'Customer'}</p>
                            <p className="text-slate-500">{o.customer?.phone || '+91 98765 43210'}</p>
                            <p className="text-slate-600 pt-1">
                              📍 {o.deliveryAddress?.addressLine}, {o.deliveryAddress?.city}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={(e) => markDelivered(e, o._id)}
                            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/25 transition active:scale-95"
                          >
                            Mark as Delivered & Collect Payout
                          </button>
                        </div>
                      </div>
                    ))}

                    {myDeliveries.length === 0 && (
                      <div className="col-span-2 bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-2">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
                          🏁
                        </div>
                        <h4 className="text-sm font-black text-slate-900">No active delivery runs</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          Check the "Available for Pickup" tab to claim orders and start earning delivery payouts.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: Earnings & Partner Profile */}
                {tab === 'earnings' && (
                  <div className="space-y-6">
                    {/* 1. Fleet Profile & Earnings Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                          <span>Wallet Balance</span>
                          <Wallet size={16} className="text-purple-600" />
                        </div>
                        <p className="text-3xl font-black text-purple-700">₹{dashboard?.partner?.walletBalance ?? dashboard?.stats?.walletBalance ?? 0}</p>
                        <p className="text-[11px] text-slate-400 font-medium">Credited instantly upon each delivery</p>
                      </div>

                      <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                          <span>Completed Deliveries</span>
                          <CheckCircle2 size={16} className="text-emerald-600" />
                        </div>
                        <p className="text-3xl font-black text-emerald-700">{dashboard?.stats?.deliveredOrders ?? dashboard?.partner?.totalDeliveries ?? 0}</p>
                        <p className="text-[11px] text-slate-400 font-medium">Standard rate: ₹40 per trip</p>
                      </div>

                      <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                          <span>Rider Rating</span>
                          <Sparkles size={16} className="text-amber-500" />
                        </div>
                        <p className="text-3xl font-black text-slate-900">{dashboard?.partner?.rating ?? 4.8} ★</p>
                        <p className="text-[11px] text-slate-400 font-medium">Top 5% fleet performance tier</p>
                      </div>
                    </div>

                    {/* 2. Partner Profile Details Card */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Bike size={18} className="text-purple-600" />
                          <h3 className="text-base font-black text-slate-900">Delivery Partner Profile</h3>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200">
                          Active & Verified Partner
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div className="p-3.5 rounded-2xl bg-slate-50">
                          <p className="text-slate-400 font-bold">Partner Name</p>
                          <p className="font-black text-slate-900 text-sm mt-0.5">{partnerName}</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-50">
                          <p className="text-slate-400 font-bold">Registered Email</p>
                          <p className="font-bold text-slate-800 truncate mt-0.5">{partnerEmail}</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-50">
                          <p className="text-slate-400 font-bold">Vehicle Info</p>
                          <p className="font-black text-purple-700 mt-0.5">{vehicleType} · {vehicleNumber}</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-50">
                          <p className="text-slate-400 font-bold">Mobile Phone</p>
                          <p className="font-bold text-slate-800 mt-0.5">{partnerPhone}</p>
                        </div>
                      </div>
                    </div>

                    {/* 3. Recent Delivery Trips History Table */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                          <h3 className="text-base font-black text-slate-900">Recent Completed Trips</h3>
                          <p className="text-xs text-slate-500">Trip payouts deposited to your wallet balance</p>
                        </div>
                        <span className="text-xs font-bold text-purple-700">₹40 / Completed Trip</span>
                      </div>

                      {dashboard?.recentDeliveries?.length ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                <th className="py-2.5 px-3">Order #</th>
                                <th className="py-2.5 px-3">Kitchen</th>
                                <th className="py-2.5 px-3">Customer</th>
                                <th className="py-2.5 px-3">Dropoff Address</th>
                                <th className="py-2.5 px-3 text-right">Trip Earning</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {dashboard.recentDeliveries.map((o) => (
                                <tr key={o._id} className="hover:bg-slate-50/70 transition">
                                  <td className="py-3 px-3 font-black text-purple-700">{o.orderNumber}</td>
                                  <td className="py-3 px-3 font-bold text-slate-800">{o.chef?.kitchenName || 'Home Kitchen'}</td>
                                  <td className="py-3 px-3 text-slate-700">{o.customer?.name || 'Customer'}</td>
                                  <td className="py-3 px-3 text-slate-500 truncate max-w-xs">{o.deliveryAddress?.addressLine || 'Chennai'}</td>
                                  <td className="py-3 px-3 text-right font-black text-emerald-600">+₹40</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="py-8 text-center text-slate-400 text-xs">
                          No trip history yet. Accept ready pickups to complete deliveries and earn payouts!
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

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
              <span className="text-2xl">🛵</span>
              <div>
                <span className="text-sm font-black text-slate-900 leading-tight block">
                  {partnerName}
                </span>
                <span className="text-[10px] text-purple-700 font-extrabold uppercase">
                  Delivery Partner Console
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
                {isOnline ? 'Active on Fleet Duty' : 'Currently Offline'}
              </span>
              <h2 className="text-base font-black leading-snug">
                {available.length} Orders Available
              </h2>
              <button
                type="button"
                onClick={toggleOnline}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white text-purple-700 font-extrabold text-xs shadow-md transition active:scale-95 mt-1"
              >
                <Power size={12} />
                <span>{isOnline ? 'Go Offline' : 'Go Online'}</span>
              </button>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl border border-white/30 shrink-0">
              ⚡
            </div>
          </div>

          {/* 2.3 3 PILL STATS ROW */}
          <div className="grid grid-cols-3 gap-2 py-1">
            <div className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-white border border-slate-100 shadow-2xs text-center">
              <Package size={18} className="text-purple-600" />
              <span className="text-sm font-black text-slate-900 leading-none">{available.length}</span>
              <span className="text-[9px] font-bold text-slate-500">Available</span>
            </div>

            <div className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-white border border-slate-100 shadow-2xs text-center">
              <Navigation size={18} className="text-amber-500" />
              <span className="text-sm font-black text-slate-900 leading-none">{myDeliveries.length}</span>
              <span className="text-[9px] font-bold text-slate-500">Active</span>
            </div>

            <div className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-white border border-slate-100 shadow-2xs text-center">
              <Wallet size={18} className="text-emerald-500" />
              <span className="text-sm font-black text-slate-900 leading-none">₹{dashboard?.stats?.walletBalance ?? 450}</span>
              <span className="text-[9px] font-bold text-slate-500">Wallet</span>
            </div>
          </div>

          {/* 2.4 SEGMENTED TAB BUTTONS */}
          <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setTab('available')}
              className={`py-2 rounded-xl text-xs font-black transition truncate px-1 ${
                tab === 'available'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pickups ({available.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('active')}
              className={`py-2 rounded-xl text-xs font-black transition truncate px-1 ${
                tab === 'active'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Runs ({myDeliveries.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('earnings')}
              className={`py-2 rounded-xl text-xs font-black transition truncate px-1 ${
                tab === 'earnings'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Earnings & Profile
            </button>
          </div>

          {/* 2.5 MOBILE ORDERS / EARNINGS LIST */}
          <div className="space-y-3 pt-1">
            {tab === 'available' &&
              available.map((o) => (
                <div
                  key={o._id}
                  className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-700">{o.orderNumber}</span>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Ready for Pickup
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <p className="font-semibold text-slate-700">
                      🍳 <b>Pickup:</b> {o.chef?.kitchenName || 'Verified Home Kitchen'}
                    </p>
                    <p className="font-semibold text-slate-700">
                      📍 <b>Deliver:</b> {o.deliveryAddress?.city || 'Chennai'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => acceptOrder(e, o._id)}
                    className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-extrabold text-xs shadow-xs active:scale-95 transition"
                  >
                    Accept Delivery
                  </button>
                </div>
              ))}

            {tab === 'active' &&
              myDeliveries.map((o) => (
                <div
                  key={o._id}
                  className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-700">{o.orderNumber}</span>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      In Transit
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-800">Customer: {o.customer?.name}</p>
                    <p className="text-slate-500">{o.deliveryAddress?.addressLine}, {o.deliveryAddress?.city}</p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => markDelivered(e, o._id)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-xs active:scale-95 transition"
                  >
                    Mark as Delivered & Collect Payout
                  </button>
                </div>
              ))}

            {tab === 'earnings' && (
              <div className="space-y-3">
                <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Wallet Balance</span>
                    <span className="text-xs font-bold text-purple-700">₹40 / trip</span>
                  </div>
                  <p className="text-2xl font-black text-purple-700">₹{dashboard?.partner?.walletBalance ?? dashboard?.stats?.walletBalance ?? 0}</p>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="p-2 rounded-xl bg-slate-50">
                      <p className="text-[10px] text-slate-400">Completed Trips</p>
                      <p className="font-black text-slate-900">{dashboard?.stats?.deliveredOrders ?? dashboard?.partner?.totalDeliveries ?? 0}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50">
                      <p className="text-[10px] text-slate-400">Fleet Rating</p>
                      <p className="font-black text-slate-900">{dashboard?.partner?.rating ?? 4.8} ★</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-2 text-xs">
                  <h4 className="font-black text-slate-900">Partner Details</h4>
                  <div className="space-y-1 text-slate-600">
                    <p><b>Name:</b> {partnerName}</p>
                    <p><b>Email:</b> {partnerEmail}</p>
                    <p><b>Vehicle:</b> {vehicleType} ({vehicleNumber})</p>
                    <p><b>Mobile:</b> {partnerPhone}</p>
                  </div>
                </div>
              </div>
            )}

            {((tab === 'available' && available.length === 0) || (tab === 'active' && myDeliveries.length === 0)) && (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 space-y-2">
                <span className="text-3xl">🛵</span>
                <p className="text-xs font-bold text-slate-700">No orders in this queue</p>
                <p className="text-[11px] text-slate-400">Keep GPS active to receive instant pickups.</p>
              </div>
            )}
          </div>

        </div>
      )}
    </MobileLayout>
  );
};

export default DeliveryDashboard;
