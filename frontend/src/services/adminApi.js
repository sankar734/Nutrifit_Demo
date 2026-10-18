import api from './api';

export const adminApi = {
  dashboard: () => api.get('/admin/dashboard'),
  users: (params) => api.get('/admin/users', { params }),
  toggleUserActive: (id) => api.put(`/admin/users/${id}/toggle-active`),
  chefs: (params) => api.get('/admin/chefs', { params }),
  updateChefKyc: (id, kycStatus) => api.put(`/admin/chefs/${id}/kyc`, { kycStatus }),
  updateCommission: (id, commissionRate) => api.put(`/admin/chefs/${id}/commission`, { commissionRate }),
  orders: (params) => api.get('/admin/orders', { params }),
  coupons: () => api.get('/admin/coupons'),
  createCoupon: (payload) => api.post('/admin/coupons', payload),
};

export default adminApi;
