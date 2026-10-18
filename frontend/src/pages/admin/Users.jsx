import { useEffect, useState, useMemo } from 'react';
import { Search, UserCheck, Shield, ChefHat, Bike, User } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../services/adminApi';
import { useDeviceMode } from '../../context/DeviceModeContext';

const roleIcons = {
  customer: User,
  chef: ChefHat,
  delivery: Bike,
  admin: Shield,
  superadmin: Shield,
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const { isMobileView } = useDeviceMode();

  const load = () => {
    adminApi
      .users({ search })
      .then(({ data }) => setUsers(data.data.users))
      .catch(() => setUsers([]));
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const toggleActive = async (id) => {
    await adminApi.toggleUserActive(id);
    load();
  };

  const filteredUsers = useMemo(() => {
    if (roleFilter === 'All') return users;
    return users.filter((u) => u.role?.toLowerCase() === roleFilter.toLowerCase());
  }, [users, roleFilter]);

  return (
    <AdminLayout title="Users">
      <div className="space-y-5">
        
        {/* Search & Filter Header */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name, email or phone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-100 focus:bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Role Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
            {['All', 'Customer', 'Chef', 'Delivery', 'Admin'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                  roleFilter === role
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
            <h3 className="text-sm font-black text-slate-900">
              User Accounts ({filteredUsers.length})
            </h3>
            <span className="text-[11px] text-slate-400 font-semibold">
              Toggle switch to activate or suspend access
            </span>
          </div>

          {!isMobileView ? (
            /* Desktop Table View */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">User</th>
                    <th className="py-3 px-3">Contact</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const RoleIcon = roleIcons[u.role] || User;
                    return (
                      <tr key={u._id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xs shrink-0">
                              {u.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <span className="font-bold text-slate-900">{u.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-slate-500 font-medium">
                          {u.email || u.phone || '—'}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-purple-50 text-purple-700 border border-purple-100">
                            <RoleIcon size={12} />
                            <span>{u.role}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              u.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {u.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => toggleActive(u._id)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              u.isActive ? 'bg-purple-600' : 'bg-slate-200'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                u.isActive ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                        No user accounts found matching your query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Mobile Card View */
            <div className="space-y-3 pt-2">
              {filteredUsers.map((u) => (
                <div
                  key={u._id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xs shrink-0">
                      {u.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 truncate">{u.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{u.email || u.phone}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-purple-100 text-purple-700">
                          {u.role}
                        </span>
                        <span className={`text-[9px] font-bold ${u.isActive ? 'text-emerald-600' : 'text-rose-500'}`}>
                          ● {u.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleActive(u._id)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      u.isActive ? 'bg-purple-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        u.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No users found.
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
};

export default Users;
