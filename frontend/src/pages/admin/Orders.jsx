import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ReceiptText, ChevronRight, Clock, ChefHat, Bike, CheckCircle2 } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../services/adminApi';
import { useDeviceMode } from '../../context/DeviceModeContext';

const statusList = ['', 'placed', 'preparing', 'ready', 'on_the_way', 'delivered', 'cancelled'];

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

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const { isMobileView } = useDeviceMode();
  const navigate = useNavigate();

  useEffect(() => {
    adminApi
      .orders(status ? { status } : {})
      .then(({ data }) => setOrders(data.data.orders))
      .catch(() => setOrders([]));
  }, [status]);

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter(
      (o) =>
        o.orderNumber?.toLowerCase().includes(q) ||
        o.customer?.name?.toLowerCase().includes(q) ||
        o.chef?.kitchenName?.toLowerCase().includes(q)
    );
  }, [orders, search]);

  return (
    <AdminLayout title="Orders">
      <div className="space-y-5">
        
        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, customer or chef..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-100 focus:bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
            {statusList.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                  status === s
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {s === '' ? 'All Orders' : s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Customer Orders ({filteredOrders.length})
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Live dispatch timeline and order tracking
              </p>
            </div>
          </div>

          {!isMobileView ? (
            /* Desktop Table View */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Order Number</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Chef Kitchen</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-3 font-black text-purple-700">
                        {o.orderNumber}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-800">
                        {o.customer?.name || 'Customer'}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 font-medium">
                        {o.chef?.kitchenName || 'Chef Kitchen'}
                      </td>
                      <td className="py-3.5 px-3 font-extrabold text-slate-900">
                        ₹{o.totalAmount}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${statusStyle[o.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                          {o.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => navigate(`/order/${o._id}`)}
                          className="px-3 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition"
                        >
                          Track
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                        No orders found in this view.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Mobile Card View */
            <div className="space-y-3 pt-2">
              {filteredOrders.map((o) => (
                <div
                  key={o._id}
                  onClick={() => navigate(`/order/${o._id}`)}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 cursor-pointer active:scale-98 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-700">{o.orderNumber}</span>
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${statusStyle[o.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      {o.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div>
                      <p className="font-bold text-slate-800">{o.customer?.name || 'Customer'}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{o.chef?.kitchenName || 'Kitchen'}</p>
                    </div>
                    <span className="text-sm font-black text-slate-900">₹{o.totalAmount}</span>
                  </div>
                </div>
              ))}
              {filteredOrders.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No orders found.
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
};

export default Orders;
