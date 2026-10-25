import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  ChefHat, 
  Bike, 
  PackageCheck, 
  ArrowLeft, 
  Clock, 
  Sparkles,
  AlertTriangle,
  XCircle,
  Wallet,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import MobileLayout from '../../components/customer/MobileLayout';
import DesktopSidebar from '../../components/customer/DesktopSidebar';
import CancelOrderModal from '../../components/customer/CancelOrderModal';
import Toast from '../../components/customer/Toast';
import { orderApi } from '../../services/api';
import { getSocket } from '../../services/socket';
import { useDeviceMode } from '../../context/DeviceModeContext';
import { useToast } from '../../hooks/useToast';

const steps = [
  { key: 'placed', label: 'Order Confirmed', desc: 'Order received & assigned to kitchen', icon: CheckCircle2 },
  { key: 'preparing', label: 'Chef is Preparing', desc: 'Fresh ingredients being cooked with care', icon: ChefHat },
  { key: 'on_the_way', label: 'Out for Delivery', desc: 'Rider picked up and on route', icon: Bike },
  { key: 'delivered', label: 'Delivered Hot', desc: 'Enjoy your nutritious homemade meal', icon: PackageCheck },
];

const stepIndex = {
  placed: 0,
  accepted: 0,
  preparing: 1,
  ready: 1,
  picked_up: 2,
  on_the_way: 2,
  delivered: 3,
};

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isMobileView } = useDeviceMode();
  const { message, showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    const load = () =>
      orderApi
        .details(id)
        .then(({ data }) => setOrder(data.data.order))
        .catch(() => {});
    load();

    const socket = getSocket();
    socket.emit('join_order', id);

    const handleStatusUpdate = (payload) => {
      if (payload.orderId === id || payload.orderId?.toString() === id) {
        load();
      }
    };
    socket.on('order_status_update', handleStatusUpdate);

    const interval = setInterval(load, 7000);
    return () => {
      clearInterval(interval);
      socket.off('order_status_update', handleStatusUpdate);
    };
  }, [id]);

  const currentStep = stepIndex[order?.status] ?? 0;
  const isCancelled = ['cancelled', 'rejected'].includes(order?.status);
  const canCancel = ['placed', 'accepted', 'preparing', 'ready'].includes(order?.status);
  const isPreCooking = ['placed', 'accepted'].includes(order?.status);

  const handleCancelSuccess = (updatedOrder, msg) => {
    setOrder(updatedOrder);
    showToast(msg || 'Order has been cancelled successfully.');
  };

  return (
    <MobileLayout fullWidth={!isMobileView} showNav={false}>
      <Toast message={message} />

      {/* Cancellation Modal */}
      {order && (
        <CancelOrderModal
          order={order}
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onSuccess={handleCancelSuccess}
        />
      )}

      {!isMobileView ? (
        /* ========================================================================= */
        /* 1. DESKTOP VIEW LAYOUT                                                    */
        /* ========================================================================= */
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-8 items-start">
            
            {/* LEFT SIDEBAR NAVIGATION */}
            <DesktopSidebar activeItem="orders" />

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 min-w-0 max-w-3xl space-y-6">
              
              {/* Back Link */}
              <button
                type="button"
                onClick={() => navigate('/my-orders')}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-purple-700 transition"
              >
                <ArrowLeft size={14} />
                <span>Back to My Orders</span>
              </button>

              {/* Hero Banner (Dynamic for Active vs Cancelled) */}
              {!isCancelled ? (
                <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-6 sm:p-8 shadow-md flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[10px] font-extrabold uppercase">
                      <Clock size={12} />
                      <span>Estimated Delivery: 30-40 mins</span>
                    </div>
                    <h1 className="text-2xl font-black">
                      Tracking Order #{order?.orderNumber || id?.slice(-6) || '20491'}
                    </h1>
                    <p className="text-xs text-purple-200">
                      Live GPS tracking and kitchen status updates
                    </p>
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl border border-white/30 shrink-0">
                    🛵
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-rose-700 via-red-700 to-rose-800 text-white rounded-3xl p-6 sm:p-8 shadow-md flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[10px] font-extrabold uppercase">
                      <XCircle size={12} />
                      <span>Order Cancelled</span>
                    </div>
                    <h1 className="text-2xl font-black">
                      Order #{order?.orderNumber || id?.slice(-6)} Was Cancelled
                    </h1>
                    <p className="text-xs text-rose-200">
                      Refund credited to your NutriChef wallet
                    </p>
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl border border-white/30 shrink-0">
                    💳
                  </div>
                </div>
              )}

              {/* CANCELLED STATE: REFUND DETAILS CARD */}
              {isCancelled && (
                <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Wallet size={16} className="text-rose-600" />
                      <span>Refund & Cancellation Breakdown</span>
                    </h3>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      {order?.refundPercentage || 100}% Refund Applied
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-50 rounded-2xl p-3.5 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Total Paid</span>
                      <p className="text-base font-black text-slate-900">₹{order?.totalAmount || 0}</p>
                    </div>

                    <div className="bg-emerald-50 rounded-2xl p-3.5 space-y-1 border border-emerald-100">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">Refunded to Wallet</span>
                      <p className="text-base font-black text-emerald-700">₹{order?.refundAmount || order?.totalAmount || 0}</p>
                    </div>

                    <div className="bg-rose-50 rounded-2xl p-3.5 space-y-1 border border-rose-100">
                      <span className="text-[10px] font-bold text-rose-600 uppercase">Kitchen Prep Fee</span>
                      <p className="text-base font-black text-rose-700">₹{order?.cancellationFee || 0}</p>
                    </div>
                  </div>

                  {order?.cancellationReason && (
                    <div className="text-xs text-slate-600 bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100">
                      <span className="font-bold text-slate-900">Reason: </span>
                      <span>{order.cancellationReason}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <Link
                      to="/profile"
                      className="flex-1 py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center gap-2 transition"
                    >
                      <Wallet size={14} />
                      <span>View Wallet Balance</span>
                    </Link>

                    <Link
                      to="/search"
                      className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
                    >
                      <RotateCcw size={14} />
                      <span>Order Fresh Food</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* ACTIVE ORDER: CANCELLATION ACTION CARD WITH POLICY */}
              {!isCancelled && canCancel && (
                <div className={`rounded-3xl p-5 border shadow-xs space-y-3 ${
                  isPreCooking 
                    ? 'bg-emerald-50/40 border-emerald-200' 
                    : 'bg-amber-50/40 border-amber-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isPreCooking ? (
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                      )}
                      <div>
                        <h4 className="text-xs font-black text-slate-900">
                          {isPreCooking ? '100% Full Refund Cancellation Available' : 'Chef is Preparing Your Food (50% Refund Policy)'}
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {isPreCooking
                            ? `Kitchen hasn't started cooking yet. If you cancel now, you get a full 100% refund of ₹${order?.totalAmount} credited to your wallet.`
                            : `Chef is actively cooking. If you cancel now, 50% refund (₹${Math.round((order?.totalAmount || 0) * 0.5)}) will be credited to your wallet (50% deducted for kitchen prep).`}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowCancelModal(true)}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-rose-200 font-black text-xs transition active:scale-95 shrink-0 shadow-2xs"
                    >
                      Cancel Order
                    </button>
                  </div>
                </div>
              )}

              {/* Live Tracking Timeline (Only when not cancelled) */}
              {!isCancelled && (
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
                  <h3 className="text-sm font-black text-slate-900 pb-3 border-b border-slate-100">
                    Live Dispatch Status
                  </h3>

                  <div className="space-y-6">
                    {steps.map((step, i) => {
                      const Icon = step.icon;
                      const isDone = i <= currentStep;
                      const isCurrent = i === currentStep;

                      return (
                        <div key={step.key} className="flex gap-4 items-start relative">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                                isDone
                                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 scale-105'
                                  : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              <Icon size={20} />
                            </div>
                            {i < steps.length - 1 && (
                              <div className={`w-0.5 h-12 my-1 ${i < currentStep ? 'bg-purple-600' : 'bg-slate-100'}`} />
                            )}
                          </div>

                          <div className="pt-1 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className={`text-sm font-black ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                                {step.label}
                              </h4>
                              {isCurrent && (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 animate-pulse">
                                  In Progress
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Kitchen & Delivery Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                    <ChefHat size={16} className="text-purple-600" />
                    <span>Home Kitchen</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">{order?.chef?.kitchenName || "Lakshmi's Healthy Kitchen"}</p>
                  <p className="text-[11px] text-slate-500">Certified FSSAI Hygiene Home Kitchen</p>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                    <Bike size={16} className="text-emerald-600" />
                    <span>Delivery Fleet</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">NutriFit Express Delivery</p>
                  <p className="text-[11px] text-slate-500">Contactless doorstep delivery</p>
                </div>
              </div>

              {/* Order Items Breakdown */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-3">
                <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100">
                  Ordered Dishes
                </h3>

                <div className="space-y-2 text-xs">
                  {order?.items?.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-700">
                      <span className="font-semibold">{it.quantity} × {it.name || 'Homemade Bowl'}</span>
                      <span className="font-bold text-slate-900">₹{(it.price || 180) * (it.quantity || 1)}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-100 pt-3 flex justify-between font-black text-sm text-slate-900">
                    <span>Total Amount Paid</span>
                    <span className="text-purple-700">₹{order?.totalAmount || 360}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      ) : (

        /* ========================================================================= */
        /* 2. MOBILE VIEW LAYOUT                                                     */
        /* ========================================================================= */
        <div className="p-4 space-y-4 max-w-md mx-auto pb-24">
          
          {/* Top Bar with Back */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => navigate('/my-orders')}
              className="p-2 rounded-xl bg-slate-100 text-slate-700"
            >
              <ArrowLeft size={18} />
            </button>
            <span className="text-sm font-black text-slate-900">
              {isCancelled ? 'Cancelled Order' : 'Live Order Tracking'}
            </span>
            <div className="w-8" />
          </div>

          {/* Hero Banner */}
          {!isCancelled ? (
            <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden flex items-center justify-between">
              <div className="space-y-1.5 max-w-[210px] z-10">
                <span className="text-[9px] font-extrabold uppercase bg-white/20 px-2 py-0.5 rounded-full">
                  Estimated 30-40 mins
                </span>
                <h2 className="text-base font-black leading-snug">
                  Order #{order?.orderNumber || id?.slice(-6) || '20491'}
                </h2>
                <p className="text-[10px] text-purple-200">
                  Fresh homemade food on its way!
                </p>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl border border-white/30 shrink-0">
                🛵
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-rose-700 via-red-700 to-rose-800 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden flex items-center justify-between">
              <div className="space-y-1.5 max-w-[210px] z-10">
                <span className="text-[9px] font-extrabold uppercase bg-white/20 px-2 py-0.5 rounded-full">
                  Order Cancelled
                </span>
                <h2 className="text-base font-black leading-snug">
                  Order #{order?.orderNumber || id?.slice(-6)}
                </h2>
                <p className="text-[10px] text-rose-200">
                  Refund credited to your wallet
                </p>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl border border-white/30 shrink-0">
                💳
              </div>
            </div>
          )}

          {/* CANCELLED STATE: MOBILE REFUND BREAKDOWN */}
          {isCancelled && (
            <div className="bg-white rounded-3xl p-4 border border-rose-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-black text-slate-900">Refund Summary</span>
                <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                  {order?.refundPercentage || 100}% Refunded
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-emerald-50 rounded-xl p-2.5">
                  <span className="text-[10px] font-bold text-emerald-700 block">Wallet Refund</span>
                  <span className="text-sm font-black text-emerald-700">₹{order?.refundAmount || order?.totalAmount || 0}</span>
                </div>
                <div className="bg-rose-50 rounded-xl p-2.5">
                  <span className="text-[10px] font-bold text-rose-600 block">Kitchen Fee</span>
                  <span className="text-sm font-black text-rose-700">₹{order?.cancellationFee || 0}</span>
                </div>
              </div>

              {order?.cancellationReason && (
                <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl">
                  {order.cancellationReason}
                </p>
              )}

              <Link
                to="/profile"
                className="w-full py-2.5 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Wallet size={13} />
                <span>Check Wallet Balance</span>
              </Link>
            </div>
          )}

          {/* ACTIVE ORDER: MOBILE CANCELLATION NOTICE & BUTTON */}
          {!isCancelled && canCancel && (
            <div className={`rounded-3xl p-4 border shadow-xs space-y-2.5 ${
              isPreCooking ? 'bg-emerald-50/50 border-emerald-200' : 'bg-amber-50/50 border-amber-200'
            }`}>
              <div className="flex items-start gap-2">
                {isPreCooking ? (
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="text-[11px]">
                  <strong className="font-black text-slate-900 block">
                    {isPreCooking ? '100% Full Refund Cancellation' : 'Food in Preparation (50% Refund)'}
                  </strong>
                  <span className="text-slate-600">
                    {isPreCooking
                      ? `Cancel before cooking starts to get ₹${order?.totalAmount} back into your wallet.`
                      : `Chef is cooking! Cancelling now gives 50% (₹${Math.round((order?.totalAmount || 0) * 0.5)}) refund.`}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-black text-xs shadow-2xs"
              >
                Cancel Order
              </button>
            </div>
          )}

          {/* Stepper Card */}
          {!isCancelled && (
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-xs font-black text-slate-900">Order Progress</h3>

              <div className="space-y-4">
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  const isDone = i <= currentStep;
                  const isCurrent = i === currentStep;

                  return (
                    <div key={step.key} className="flex gap-3 items-start relative">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            isDone ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        {i < steps.length - 1 && (
                          <div className={`w-0.5 h-8 my-1 ${i < currentStep ? 'bg-purple-600' : 'bg-slate-100'}`} />
                        )}
                      </div>

                      <div className="pt-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                            {step.label}
                          </span>
                          {isCurrent && (
                            <span className="text-[8px] font-bold uppercase px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dishes Summary */}
          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-2">
            <h4 className="text-xs font-black text-slate-900 pb-1 border-b border-slate-100">
              Meal Summary
            </h4>
            <div className="text-xs space-y-1">
              {order?.items?.map((it, idx) => (
                <div key={idx} className="flex justify-between text-slate-600">
                  <span>{it.quantity} × {it.name || 'Homemade Bowl'}</span>
                  <span className="font-bold text-slate-900">₹{(it.price || 180) * (it.quantity || 1)}</span>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-2 flex justify-between font-black text-slate-900">
                <span>Total</span>
                <span className="text-purple-700">₹{order?.totalAmount || 360}</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </MobileLayout>
  );
};

export default OrderTracking;
