import { useEffect, useState, useMemo } from 'react';
import { Star, ChefHat, ShieldCheck, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../services/adminApi';
import { useDeviceMode } from '../../context/DeviceModeContext';

const kycStyle = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

const Chefs = () => {
  const [chefs, setChefs] = useState([]);
  const [filter, setFilter] = useState('All');
  const { isMobileView } = useDeviceMode();

  const load = () => {
    adminApi
      .chefs()
      .then(({ data }) => setChefs(data.data.chefs))
      .catch(() => setChefs([]));
  };

  useEffect(load, []);

  const updateKyc = async (id, kycStatus) => {
    await adminApi.updateChefKyc(id, kycStatus);
    load();
  };

  const filteredChefs = useMemo(() => {
    if (filter === 'All') return chefs;
    return chefs.filter((c) => c.kycStatus === filter.toLowerCase());
  }, [chefs, filter]);

  return (
    <AdminLayout title="Chefs">
      <div className="space-y-5">
        
        {/* Top Filter Chips */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
            {['All', 'Pending', 'Verified', 'Rejected'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                  filter === status
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {status === 'All' ? 'All Chefs' : `${status} KYC`}
              </button>
            ))}
          </div>

          <span className="text-xs font-bold text-slate-500">
            {filteredChefs.length} {filteredChefs.length === 1 ? 'Chef Kitchen' : 'Chef Kitchens'}
          </span>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
            <div>
              <h3 className="text-sm font-black text-slate-900">Registered Home Chefs</h3>
              <p className="text-xs text-slate-500 font-medium">FSSAI and kitchen hygiene verification queue</p>
            </div>
          </div>

          {!isMobileView ? (
            /* Desktop Table View */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Kitchen Name</th>
                    <th className="py-3 px-3">Chef / Owner</th>
                    <th className="py-3 px-3">Rating</th>
                    <th className="py-3 px-3">Commission</th>
                    <th className="py-3 px-3">KYC Status</th>
                    <th className="py-3 px-3 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredChefs.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                            <ChefHat size={16} />
                          </div>
                          <span className="font-bold text-slate-900">{c.kitchenName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 font-medium">
                        {c.user?.name || 'Chef'}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-slate-800">
                          <Star size={13} className="text-amber-500 fill-amber-500" />
                          <span>{c.rating?.toFixed(1) ?? '4.8'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-700">
                        {c.commissionRate}%
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${kycStyle[c.kycStatus] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                          {c.kycStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right space-x-2">
                        {c.kycStatus !== 'verified' && (
                          <button
                            type="button"
                            onClick={() => updateKyc(c._id, 'verified')}
                            className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition"
                          >
                            <CheckCircle2 size={13} />
                            <span>Verify</span>
                          </button>
                        )}
                        {c.kycStatus !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => updateKyc(c._id, 'rejected')}
                            className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
                          >
                            <XCircle size={13} />
                            <span>Reject</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredChefs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                        No chefs found in this category.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Mobile Card View */
            <div className="space-y-3 pt-2">
              {filteredChefs.map((c) => (
                <div
                  key={c._id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                        <ChefHat size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">{c.kitchenName}</h4>
                        <p className="text-[11px] text-slate-500 font-medium">{c.user?.name || 'Chef'}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${kycStyle[c.kycStatus] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      {c.kycStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 font-semibold pt-1 border-t border-slate-200/60">
                    <span className="flex items-center gap-1">
                      <Star size={13} className="text-amber-500 fill-amber-500" />
                      <span>{c.rating?.toFixed(1) ?? '4.8'} Rating</span>
                    </span>
                    <span>Commission: {c.commissionRate}%</span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    {c.kycStatus !== 'verified' && (
                      <button
                        type="button"
                        onClick={() => updateKyc(c._id, 'verified')}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                      >
                        Approve & Verify
                      </button>
                    )}
                    {c.kycStatus !== 'rejected' && (
                      <button
                        type="button"
                        onClick={() => updateKyc(c._id, 'rejected')}
                        className="flex-1 py-2 rounded-xl bg-white border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-50 transition"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {filteredChefs.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No chefs found in this category.
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
};

export default Chefs;
