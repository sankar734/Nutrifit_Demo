import { useEffect, useState } from 'react';
import { Plus, X, Tag, Sparkles, Percent, Calendar, CheckCircle2 } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../services/adminApi';
import { useDeviceMode } from '../../context/DeviceModeContext';

const emptyForm = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: 10,
  minOrderValue: 0,
  usageLimit: 100,
};

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const { isMobileView } = useDeviceMode();

  const load = () => {
    adminApi
      .coupons()
      .then(({ data }) => setCoupons(data.data.coupons))
      .catch(() => setCoupons([]));
  };

  useEffect(load, []);

  const handleCreate = async () => {
    if (!form.code) return;
    await adminApi.createCoupon(form);
    setOpen(false);
    setForm(emptyForm);
    load();
  };

  return (
    <AdminLayout title="Coupons">
      <div className="space-y-5">
        
        {/* Top Header Row with Create Button */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900">Promotion Coupons</h3>
            <p className="text-xs text-slate-500 font-medium">Manage discount codes and customer vouchers</p>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md shadow-purple-500/25 transition active:scale-95"
          >
            <Plus size={16} />
            <span>New Coupon</span>
          </button>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs">
          {!isMobileView ? (
            /* Desktop Table View */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Coupon Code</th>
                    <th className="py-3 px-3">Discount</th>
                    <th className="py-3 px-3">Min Order</th>
                    <th className="py-3 px-3">Used / Limit</th>
                    <th className="py-3 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {coupons.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 font-black tracking-wide border border-purple-200 text-xs">
                            {c.code}
                          </span>
                          <span className="text-xs text-slate-500 font-medium truncate max-w-xs">
                            {c.description}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-extrabold text-slate-900">
                        {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 font-semibold">
                        ₹{c.minOrderValue}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 font-medium">
                        {c.usedCount} / {c.usageLimit}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          c.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {c.isActive ? 'Active' : 'Expired'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {coupons.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                        No coupons found. Click "New Coupon" to add promotional codes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Mobile Card View */
            <div className="space-y-3">
              {coupons.map((c) => (
                <div
                  key={c._id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-xl bg-purple-100 text-purple-800 font-black text-xs">
                      {c.code}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      c.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {c.isActive ? 'Active' : 'Expired'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium">{c.description || 'NutriFit discount coupon'}</p>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                    <span className="font-black text-purple-700">
                      {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Min: ₹{c.minOrderValue} · Used: {c.usedCount}/{c.usageLimit}
                    </span>
                  </div>
                </div>
              ))}
              {coupons.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No coupons found.
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Modern Create Coupon Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Tag size={18} className="text-purple-600" />
                <h3 className="font-black text-slate-900 text-sm">Create New Coupon</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Coupon Code</label>
                <input
                  placeholder="e.g. HEALTHY50"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Description</label>
                <input
                  placeholder="e.g. 50% discount on first nutritious meal"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Value</label>
                  <input
                    type="number"
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={form.minOrderValue}
                    onChange={(e) => setForm({ ...form, minOrderValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreate}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-500/25 transition active:scale-95 mt-2"
              >
                Create Promotion Coupon
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
};

export default Coupons;
