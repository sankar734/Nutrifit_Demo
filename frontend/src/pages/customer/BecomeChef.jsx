import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChefHat, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Leaf, 
  Wallet, 
  Clock, 
  ArrowLeft 
} from 'lucide-react';
import MobileLayout from '../../components/customer/MobileLayout';
import DesktopSidebar from '../../components/customer/DesktopSidebar';
import { chefApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useDeviceMode } from '../../context/DeviceModeContext';

const specialtyOptions = ['South Indian', 'North Indian', 'Continental', 'Vegan', 'Diabetic Friendly', 'Millets', 'Bakery', 'Salads & Bowls'];

const emptyForm = {
  kitchenName: '',
  bio: '',
  address: '',
  phone: '',
  yearsOfExperience: '',
  foodLicenseNumber: '',
  specialties: [],
};

const BecomeChef = () => {
  const { user, updateLocalUser } = useAuth();
  const navigate = useNavigate();
  const { isMobileView } = useDeviceMode();
  const [form, setForm] = useState({ ...emptyForm, phone: user?.phone || '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const toggleSpecialty = (s) => {
    setForm((f) => ({
      ...f,
      specialties: f.specialties.includes(s) ? f.specialties.filter((x) => x !== s) : [...f.specialties, s],
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.kitchenName || !form.address || !form.phone) {
      setError('Kitchen name, contact number and address are required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await chefApi.register({ ...form, yearsOfExperience: Number(form.yearsOfExperience) || 0 });
      updateLocalUser({ role: 'chef' });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit chef application');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <MobileLayout fullWidth={!isMobileView} showNav={false}>
        <div className="max-w-md mx-auto p-6 py-20 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto text-4xl shadow-sm">
            👨‍🍳
          </div>
          <h2 className="text-xl font-black text-slate-900">Application Submitted!</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your kitchen "{form.kitchenName}" is under verification. Our team will verify your FSSAI details and activate your kitchen console within 24 hours.
          </p>
          <div className="pt-4 space-y-2">
            <button
              onClick={() => navigate('/chef')}
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-500/25 transition active:scale-95"
            >
              Go to Chef Dashboard
            </button>
            <button
              onClick={() => navigate('/home')}
              className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
            >
              Continue Browsing Dishes
            </button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  const formContent = (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-6 sm:p-8 shadow-md flex items-center justify-between relative overflow-hidden">
        <div className="space-y-2.5 max-w-lg z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[10px] font-extrabold uppercase">
            <ShieldCheck size={14} className="text-emerald-300" />
            <span>FSSAI Home Chef Partner Program</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black leading-tight">
            Turn Your Home Cooking into a Thriving Business
          </h1>
          <p className="text-xs sm:text-sm text-purple-200">
            Cook healthy meals from your home kitchen and earn ₹25,000–₹60,000/month with zero marketing hassle.
          </p>
        </div>

        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl border-2 border-white/40 shrink-0 hidden sm:flex">
          👨‍🍳
        </div>
      </div>

      {/* 4 Feature Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-2xs text-center space-y-1">
          <Wallet size={18} className="text-purple-600 mx-auto" />
          <h4 className="text-xs font-black text-slate-900">Weekly Payouts</h4>
          <p className="text-[10px] text-slate-500">Direct to your bank</p>
        </div>
        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-2xs text-center space-y-1">
          <Clock size={18} className="text-amber-500 mx-auto" />
          <h4 className="text-xs font-black text-slate-900">Flexible Timings</h4>
          <p className="text-[10px] text-slate-500">Cook when you want</p>
        </div>
        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-2xs text-center space-y-1">
          <Leaf size={18} className="text-emerald-500 mx-auto" />
          <h4 className="text-xs font-black text-slate-900">NutriFit AI Help</h4>
          <p className="text-[10px] text-slate-500">Automated calorie counts</p>
        </div>
        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-2xs text-center space-y-1">
          <ShieldCheck size={18} className="text-blue-500 mx-auto" />
          <h4 className="text-xs font-black text-slate-900">FSSAI Guidance</h4>
          <p className="text-[10px] text-slate-500">Free registration support</p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-4">
        <h3 className="text-base font-black text-slate-900 pb-2 border-b border-slate-100">
          Kitchen Onboarding Application
        </h3>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kitchen Name *</label>
            <input
              placeholder="e.g. Lakshmi's Healthy Kitchen"
              value={form.kitchenName}
              onChange={(e) => setForm({ ...form, kitchenName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone *</label>
            <input
              placeholder="Phone number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Kitchen Address *</label>
          <input
            placeholder="Full kitchen address where food is prepared"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Cooking Experience (Years)</label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 5"
              value={form.yearsOfExperience}
              onChange={(e) => setForm({ ...form, yearsOfExperience: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">FSSAI License / Registration No.</label>
            <input
              placeholder="14-digit FSSAI number (optional)"
              value={form.foodLicenseNumber}
              onChange={(e) => setForm({ ...form, foodLicenseNumber: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Kitchen Bio & Cooking Philosophy</label>
          <textarea
            placeholder="Tell us about the ingredients you use, special spices, or dietary focus..."
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">Specialties</label>
          <div className="flex flex-wrap gap-2">
            {specialtyOptions.map((s) => {
              const selected = form.specialties.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpecialty(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                    selected
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow-md shadow-purple-500/25 transition transform active:scale-95 disabled:opacity-50 mt-2"
        >
          {submitting ? 'Submitting Application...' : 'Submit Chef Application'}
        </button>
      </form>
    </div>
  );

  return (
    <MobileLayout fullWidth={!isMobileView} showNav={false}>
      {!isMobileView ? (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-8 items-start">
            <DesktopSidebar activeItem="profile" />
            <div className="flex-1 min-w-0 max-w-3xl">
              {formContent}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 max-w-md mx-auto pb-20">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-3"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
          {formContent}
        </div>
      )}
    </MobileLayout>
  );
};

export default BecomeChef;
