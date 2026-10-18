import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../../../components/customer/MobileLayout';
import { notificationApi } from '../../../services/api';

const initialPrefs = [
  { key: 'orderUpdates', label: 'Order Updates', desc: 'Real-time chef, pickup & delivery status alerts', enabled: true },
  { key: 'paymentReceipts', label: 'Payment & Receipt Notifications', desc: 'Instant confirmations on online & COD orders', enabled: true },
  { key: 'promotions', label: 'Promotions & Discounts', desc: 'Special discount coupons and chef kitchen specials', enabled: true },
  { key: 'mealReminders', label: 'Healthy Meal Reminders', desc: 'Nutritional nudges for lunch and dinner schedules', enabled: false },
];

const Toggle = ({ enabled, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative w-12 h-6.5 rounded-full transition-colors duration-200 ease-in-out focus:outline-none p-0.5 ${
      enabled ? 'bg-purple-600' : 'bg-slate-200'
    }`}
  >
    <span
      className={`inline-block w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
        enabled ? 'translate-x-5.5' : 'translate-x-0'
      }`}
    />
  </button>
);

const NotificationSettings = () => {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState(initialPrefs);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationApi
      .list()
      .then(({ data }) => {
        setNotifications(data.data.notifications || []);
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key) => {
    setPrefs((p) => p.map((item) => (item.key === key ? { ...item, enabled: !item.enabled } : item)));
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (_) {}
  };

  return (
    <MobileLayout showNav={false}>
      <div className="max-w-md mx-auto p-4 space-y-5">
        {/* Top Header */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-50 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-base font-black text-slate-900">Notifications & Alerts</h1>
          <div className="w-10" />
        </div>

        {/* Hero banner */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-5 shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase bg-white/20 px-2.5 py-0.5 rounded-full tracking-wider">
              Alerts & Notifications
            </span>
            <h2 className="text-base font-black leading-snug">Order Updates & SMS</h2>
            <p className="text-xs text-purple-200">Instant notification when your order is delivered & paid.</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shrink-0">
            🔔
          </div>
        </div>

        {/* Preferences Toggle Card */}
        <div className="bg-white rounded-3xl p-2 border border-slate-100 shadow-xs divide-y divide-slate-100">
          <div className="p-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider text-purple-700">
              Notification Preferences
            </h3>
          </div>
          {prefs.map((p) => (
            <div key={p.key} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition">
              <div className="pr-4 space-y-0.5">
                <p className="text-xs font-extrabold text-slate-900">{p.label}</p>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{p.desc}</p>
              </div>
              <Toggle enabled={p.enabled} onChange={() => toggle(p.key)} />
            </div>
          ))}
        </div>

        {/* Live Notification History */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider text-purple-700">
              Recent Alerts
            </h3>
            {notifications.some((n) => !n.isRead) && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] text-purple-600 hover:text-purple-800 font-extrabold flex items-center gap-1"
              >
                <Check size={12} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 font-medium">No order notifications yet.</p>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div key={n._id} className="py-3 flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm ${
                    n.title?.includes('Received') || n.title?.includes('Done')
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {n.title?.includes('Received') || n.title?.includes('Done') ? '🎉' : '🍱'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900">{n.title}</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-relaxed">{n.body}</p>
                    <span className="text-[9px] text-slate-400 font-bold block mt-1">
                      {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default NotificationSettings;
