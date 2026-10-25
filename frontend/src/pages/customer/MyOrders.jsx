import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  RotateCcw, 
  ReceiptText, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight, 
  ShieldCheck, 
  ShoppingBag,
  Sparkles,
  MapPin,
  AlertTriangle,
  XCircle,
  Wallet
} from 'lucide-react';
import MobileLayout from '../../components/customer/MobileLayout';
import DesktopSidebar from '../../components/customer/DesktopSidebar';
import CancelOrderModal from '../../components/customer/CancelOrderModal';
import Toast from '../../components/customer/Toast';
import { orderApi, cartApi } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useDeviceMode } from '../../context/DeviceModeContext';
import { useToast } from '../../hooks/useToast';

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

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [orderToCancel, setOrderToCancel] = useState(null);
  const { isMobileView } = useDeviceMode();
  const { refresh, addToCart } = useCart() || {};
  const { message, showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    orderApi
      .myOrders()
      .then(({ data }) => setOrders(data.data.orders))
      .catch(() => setOrders([]));
  }, []);

  const handleCancelSuccess = (updatedOrder, msg) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
    );
    showToast(msg || `Order #${updatedOrder.orderNumber} cancelled successfully.`);
  };

  const reorder = async (order) => {
    try {
      await cartApi.clear();
      for (const item of order.items) {
        // eslint-disable-next-line no-await-in-loop
        await cartApi.add(item.food, item.quantity);
      }
      await refresh?.();
      showToast('🛒 Meal re-added to cart!');
      navigate('/cart');
    } catch {
      showToast('⚠️ Could not reorder items right now');
    }
  };

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'All') return orders;
    if (statusFilter === 'Active') {
      return orders.filter((o) => !['delivered', 'cancelled', 'rejected'].includes(o.status));
    }
    if (statusFilter === 'Delivered') {
      return orders.filter((o) => o.status === 'delivered');
    }
    if (statusFilter === 'Cancelled') {
      return orders.filter((o) => ['cancelled', 'rejected'].includes(o.status));
    }
    return orders;
  }, [orders, statusFilter]);

  const activeCount = orders.filter((o) => !['delivered', 'cancelled', 'rejected'].includes(o.status)).length;

  return (
    <MobileLayout fullWidth={!isMobileView}>
      <Toast message={message} />

      {/* Cancellation Modal */}
      {orderToCancel && (
        <CancelOrderModal
          order={orderToCancel}
          isOpen={!!orderToCancel}
          onClose={() => setOrderToCancel(null)}
          onSuccess={handleCancelSuccess}
        />
      )}

      {!isMobileView ? (
        /* ========================================================================= */
        /* 1. DESKTOP VIEW LAYOUT (Matches Home Page Desktop Max-W-1440 Structure)    */
        /* ========================================================================= */
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-8 items-start">
            
            {/* LEFT SIDEBAR NAVIGATION */}
            <DesktopSidebar activeItem="orders" />

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 min-w-0 space-y-6">
              
              {/* 1.1 HERO BANNER */}
              <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-6 sm:p-8 shadow-md flex items-center justify-between relative overflow-hidden">
                <div className="space-y-3 z-10 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wide">
                    <ShieldCheck size={14} className="text-emerald-300" />
                    <span>FSSAI Certified Delivery Tracking</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black leading-tight">
                    My Nutritious Orders
                  </h1>

                  <p className="text-xs sm:text-sm text-purple-200 font-medium">
                    {activeCount > 0
                      ? `You currently have ${activeCount} active healthy meal delivery on the way!`
                      : 'Track live dispatches, review calorie breakdowns, and reorder favourite meals in one click.'}
                  </p>
                </div>

                <div className="hidden md:flex items-center gap-3 z-10">
                  <Link
                    to="/search"
                    className="px-5 py-3 rounded-2xl bg-white text-purple-700 font-black text-xs shadow-md transition hover:bg-purple-50 active:scale-95 flex items-center gap-1.5"
                  >
                    <span>Order More Dishes</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* 1.2 STATUS FILTER TABS */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                  {['All', 'Active', 'Delivered', 'Cancelled'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setStatusFilter(tab)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap ${
                        statusFilter === tab
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 scale-102'
                          : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {tab === 'All' ? 'All Orders' : `${tab} Orders`}
                    </button>
                  ))}
                </div>

                <span className="text-xs font-bold text-slate-500">
                  {filteredOrders.length} {filteredOrders.length === 1 ? 'Meal Order' : 'Meal Orders'}
                </span>
              </div>

              {/* 1.3 ORDERS GRID */}
              {filteredOrders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredOrders.map((o) => {
                    const isCancellable = ['placed', 'accepted', 'preparing', 'ready'].includes(o.status);
                    const isPreCooking = ['placed', 'accepted'].includes(o.status);
                    const isCancelled = ['cancelled', 'rejected'].includes(o.status);

                    return (
                      <div
                        key={o._id}
                        className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
                      >
                        <div>
                          {/* Header */}
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                              <span className="text-xs font-black text-purple-700">{o.orderNumber}</span>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {new Date(o.createdAt || Date.now()).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${statusStyle[o.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                              {o.status.replace('_', ' ')}
                            </span>
                          </div>

                          {/* Chef Kitchen */}
                          <div className="py-2.5">
                            <h4 className="text-sm font-black text-slate-900">
                              {o.chef?.kitchenName || 'Paradise Homemade Kitchen'}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {o.items?.length || 1} {o.items?.length === 1 ? 'healthy item' : 'healthy items'} · Total: <span className="font-black text-slate-900">₹{o.totalAmount}</span>
                            </p>
                          </div>

                          {/* Items preview */}
                          <div className="bg-slate-50/70 rounded-2xl p-3 space-y-1 text-xs">
                            {o.items?.map((it, idx) => (
                              <div key={idx} className="flex justify-between text-slate-600">
                                <span>{it.quantity} × {it.name || 'Homemade Bowl'}</span>
                                <span className="font-bold text-slate-800">₹{(it.price || 180) * (it.quantity || 1)}</span>
                              </div>
                            ))}
                          </div>

                          {/* Refund details badge if cancelled */}
                          {isCancelled && (
                            <div className="mt-3 bg-rose-50/70 border border-rose-100 rounded-2xl p-2.5 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5 text-rose-700 font-bold">
                                <Wallet size={13} />
                                <span>Refunded: <strong>₹{o.refundAmount || o.totalAmount}</strong></span>
                              </div>
                              <span className="text-[10px] font-black uppercase text-rose-700 bg-white px-2 py-0.5 rounded-full border border-rose-200">
                                {o.refundPercentage || 100}% Wallet Credit
                              </span>
                            </div>
                          )}

                          {/* Policy hint for active cancellable orders */}
                          {isCancellable && (
                            <div className="mt-2.5">
                              {isPreCooking ? (
                                <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                  <CheckCircle2 size={11} />
                                  <span>100% full refund available before cooking</span>
                                </p>
                              ) : (
                                <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                                  <AlertTriangle size={11} />
                                  <span>Chef is preparing · 50% refund policy applies</span>
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/order/${o._id}`)}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center gap-1 transition"
                          >
                            <span>Track Live Order</span>
                            <ChevronRight size={14} />
                          </button>

                          {isCancellable && (
                            <button
                              type="button"
                              onClick={() => setOrderToCancel(o)}
                              className="py-2.5 px-3 rounded-xl bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1 transition active:scale-95"
                            >
                              <span>Cancel</span>
                            </button>
                          )}

                          {o.status === 'delivered' && (
                            <button
                              type="button"
                              onClick={() => reorder(o)}
                              className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1 transition shadow-xs"
                            >
                              <RotateCcw size={13} />
                              <span>Reorder</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto text-3xl">
                    🧾
                  </div>
                  <h3 className="text-base font-black text-slate-900">No Orders in this category</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Explore freshly prepared meals cooked with calibrated macros and zero preservatives.
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/search"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-md shadow-purple-500/25 hover:bg-purple-700 transition"
                    >
                      <span>Explore Healthy Dishes</span>
                      <ArrowRight size={14} />
                    </Link>
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
          
          {/* 2.1 TITLE */}
          <div className="pt-1 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                My Orders
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Track active deliveries & order history
              </p>
            </div>
            <Link to="/cart" className="relative p-2 text-slate-700">
              <ShoppingBag size={20} />
            </Link>
          </div>

          {/* 2.2 MOBILE HERO BANNER */}
          <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden flex items-center justify-between">
            <div className="space-y-1.5 max-w-[210px] z-10">
              <span className="text-[9px] font-extrabold uppercase bg-white/20 px-2 py-0.5 rounded-full tracking-wide">
                FSSAI Certified
              </span>
              <h2 className="text-base font-black leading-snug">
                {activeCount > 0 ? `${activeCount} Order On The Way` : 'Healthy Meals Delivered'}
              </h2>
              <p className="text-[10px] text-purple-200 leading-tight">
                Fresh • Nutritious • Hygienic
              </p>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl border border-white/30 shrink-0">
              🥗
            </div>
          </div>

          {/* 2.3 FILTER CHIPS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
            {['All', 'Active', 'Delivered', 'Cancelled'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                  statusFilter === tab
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* 2.4 MOBILE ORDERS LIST */}
          <div className="space-y-3 pt-1">
            {filteredOrders.map((o) => {
              const isCancellable = ['placed', 'accepted', 'preparing', 'ready'].includes(o.status);
              const isPreCooking = ['placed', 'accepted'].includes(o.status);
              const isCancelled = ['cancelled', 'rejected'].includes(o.status);

              return (
                <div
                  key={o._id}
                  className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-purple-700">{o.orderNumber}</span>
                      <p className="text-[10px] text-slate-400">
                        {new Date(o.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${statusStyle[o.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      {o.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-slate-900">{o.chef?.kitchenName || 'Home Kitchen'}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {o.items?.length || 1} items · Total: <span className="font-extrabold text-slate-900">₹{o.totalAmount}</span>
                    </p>
                  </div>

                  {/* Refund info badge on mobile if cancelled */}
                  {isCancelled && (
                    <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-2 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-rose-700">Refunded: ₹{o.refundAmount || o.totalAmount}</span>
                      <span className="text-[9px] font-black uppercase text-rose-700 bg-white px-2 py-0.2 rounded-full border border-rose-200">
                        {o.refundPercentage || 100}% Wallet
                      </span>
                    </div>
                  )}

                  {/* Cancellation policy hint on mobile */}
                  {isCancellable && (
                    <div className="text-[10px]">
                      {isPreCooking ? (
                        <span className="text-emerald-600 font-bold">● Free cancellation (100% full refund)</span>
                      ) : (
                        <span className="text-amber-600 font-bold">● Preparing: 50% refund on cancel</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => navigate(`/order/${o._id}`)}
                      className="flex-1 py-2 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs"
                    >
                      Track Order
                    </button>

                    {isCancellable && (
                      <button
                        type="button"
                        onClick={() => setOrderToCancel(o)}
                        className="py-2 px-3 rounded-xl bg-white text-rose-600 border border-rose-200 font-bold text-xs active:scale-95"
                      >
                        Cancel
                      </button>
                    )}

                    {o.status === 'delivered' && (
                      <button
                        type="button"
                        onClick={() => reorder(o)}
                        className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1"
                      >
                        <RotateCcw size={12} />
                        <span>Reorder</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredOrders.length === 0 && (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 space-y-2">
                <span className="text-3xl">🧾</span>
                <p className="text-xs font-bold text-slate-700">No orders placed</p>
                <p className="text-[11px] text-slate-400">Browse dishes to order your first meal!</p>
              </div>
            )}
          </div>

        </div>
      )}
    </MobileLayout>
  );
};

export default MyOrders;
