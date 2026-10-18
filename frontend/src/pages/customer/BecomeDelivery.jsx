import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bike, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Wallet, 
  Clock, 
  MapPin, 
  ArrowLeft 
} from 'lucide-react';
import MobileLayout from '../../components/customer/MobileLayout';
import DesktopSidebar from '../../components/customer/DesktopSidebar';
import { deliveryApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useDeviceMode } from '../../context/DeviceModeContext';

const vehicleOptions = [
  { key: 'bike', label: 'Motorbike / Scooter' },
  { key: 'bicycle', label: 'Bicycle / EV Cycle' },
  { key: 'car', label: 'Car' },
  { key: 'on_foot', label: 'Walking / Nearby' },
];

const emptyForm = {
  vehicleType: 'bike',
  vehicleNumber: '',
  dateOfBirth: '',
  address: '',
  idProofNumber: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
};

const BecomeDelivery = () => {
  const { updateLocalUser } = useAuth();
  const navigate = useNavigate();
  const { isMobileView } = useDeviceMode();
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.address || !form.idProofNumber || !form.emergencyContactPhone) {
      setError('Address, ID proof number and an emergency contact are required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await deliveryApi.register({
        vehicleType: form.vehicleType,
        vehicleNumber: form.vehicleNumber,
        dateOfBirth: form.dateOfBirth || undefined,
        address: form.address,
        idProofNumber: form.idProofNumber,
        emergencyContact: { name: form.emergencyContactName, phone: form.emergencyContactPhone },
      });
      updateLocalUser({ role: 'delivery' });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <MobileLayout fullWidth={!isMobileView} showNav={false}>
        <div className="max-w-md mx-auto p-6 py-20 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto text-4xl shadow-sm">
            🛵
          </div>
          <h2 className="text-xl font-black text-slate-900">Application Submitted!</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your delivery partner profile has been registered and is pending verification. Once verified, you can go online and start picking up delivery orders right away.
          </p>
          <div className="pt-4 space-y-2">
            <button
              onClick={() => navigate('/delivery')}
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-500/25 transition active:scale-95"
            >
              Go to Delivery Dashboard
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
            <span>NutriFit Fleet Partner Program</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black leading-tight">
            Earn With Every Healthy Delivery
          </h1>
          <p className="text-xs sm:text-sm text-purple-200">
            Pick your own flexible hours, earn competitive per-order payouts + bonus tips, with weekly direct bank transfers.
          </p>
        </div>

        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl border-2 border-white/40 shrink-0 hidden sm:flex">
          🛵
        </div>
      </div>

      {/* 4 Feature Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-2xs text-center space-y-1">
          <Wallet size={18} className="text-purple-600 mx-auto" />
          <h4 className="text-xs font-black text-slate-900">Instant Wallet</h4>
          <p className="text-[10px] text-slate-500">Live order earnings</p>
        </div>
        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-2xs text-center space-y-1">
          <Clock size={18} className="text-amber-500 mx-auto" />
          <h4 className="text-xs font-black text-slate-900">Your Schedule</h4>
          <p className="text-[10px] text-slate-500">Part-time or full-time</p>
        </div>
        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-2xs text-center space-y-1">
          <MapPin size={18} className="text-emerald-500 mx-auto" />
          <h4 className="text-xs font-black text-slate-900">Short Radii</h4>
          <p className="text-[10px] text-slate-500">Local hyper-neighborhoods</p>
        </div>
        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-2xs text-center space-y-1">
          <ShieldCheck size={18} className="text-blue-500 mx-auto" />
          <h4 className="text-xs font-black text-slate-900">Transit Insurance</h4>
          <p className="text-[10px] text-slate-500">Safety covered on road</p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-4">
        <h3 className="text-base font-black text-slate-900 pb-2 border-b border-slate-100">
          Delivery Partner Registration
        </h3>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">Vehicle Type *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {vehicleOptions.map((v) => {
              const selected = form.vehicleType === v.key;
              return (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => setForm({ ...form, vehicleType: v.key })}
                  className={`p-2.5 rounded-xl text-xs font-bold transition border ${
                    selected
                      ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>

        {form.vehicleType !== 'on_foot' && form.vehicleType !== 'bicycle' && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Registration Number *</label>
            <input
              placeholder="e.g. TN 01 AB 1234"
              value={form.vehicleNumber}
              onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Government ID Proof (Aadhaar / DL) *</label>
            <input
              placeholder="ID number for verification"
              value={form.idProofNumber}
              onChange={(e) => setForm({ ...form, idProofNumber: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Home Address *</label>
          <input
            placeholder="Your residential address in Chennai"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact Name *</label>
            <input
              placeholder="Contact person name"
              value={form.emergencyContactName}
              onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact Phone *</label>
            <input
              placeholder="Phone number"
              value={form.emergencyContactPhone}
              onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow-md shadow-purple-500/25 transition transform active:scale-95 disabled:opacity-50 mt-2"
        >
          {submitting ? 'Submitting Registration...' : 'Register as Delivery Partner'}
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

export default BecomeDelivery;
