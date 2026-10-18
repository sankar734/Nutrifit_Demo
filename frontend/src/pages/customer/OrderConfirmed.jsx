import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, Bell, ArrowRight, Sparkles } from 'lucide-react';
import MobileLayout from '../../components/customer/MobileLayout';
import { orderApi } from '../../services/api';
import { useDeviceMode } from '../../context/DeviceModeContext';

const OrderConfirmed = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isMobileView } = useDeviceMode();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    orderApi
      .details(id)
      .then(({ data }) => setOrder(data.data.order))
      .catch(() => {});

    const t = setTimeout(() => navigate(`/order/${id}`, { replace: true }), 5000);
    return () => clearTimeout(t);
  }, [id, navigate]);

  return (
    <MobileLayout fullWidth={!isMobileView} showNav={false}>
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-xl text-center space-y-6">
          {/* Animated Success Icon */}
          <div className="relative mx-auto w-24 h-24">
            <div className="w-24 h-24 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-5xl shadow-sm border border-emerald-100">
              🎉
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
              <CheckCircle2 size={18} />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Payment Confirmed
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Delicious Healthy Food on the Way!
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {order ? `Order #${order.orderNumber} · Amount: ₹${order.totalAmount}` : 'Your meal ticket is being dispatched to the chef kitchen.'}
            </p>
          </div>

          {/* Trust Badges */}
          <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2.5 text-xs text-slate-600 border border-slate-100">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={16} className="text-purple-600 shrink-0" />
              <span>100% Verified Homemade Kitchens</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Bell size={16} className="text-purple-600 shrink-0" />
              <span>Live SMS & WhatsApp dispatch tracking updates</span>
            </div>
          </div>

          {/* Action */}
          <button
            type="button"
            onClick={() => navigate(`/order/${id}`, { replace: true })}
            className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow-xl shadow-purple-500/25 transition transform active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Track Live Order Now</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default OrderConfirmed;
