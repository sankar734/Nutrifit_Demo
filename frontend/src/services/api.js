import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nutrichef_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  try {
    const userJson = localStorage.getItem('nutrichef_user');
    if (userJson) {
      const u = JSON.parse(userJson);
      if (u?._id) config.headers['x-user-id'] = u._id;
    }
  } catch (_) {}
  return config;
});

export const authApi = {
  sendRegisterOtp: (payload) => api.post('/auth/register/send-otp', payload),
  register: (payload) => api.post('/auth/register', payload),
  login: (identifier, password) => api.post('/auth/login', { identifier, password }),
  resendLoginOtp: (email) => api.post('/auth/login/resend-otp', { email }),
  sendOtp: (phone) => api.post('/auth/otp/send', { phone }),
  verifyOtp: (phone, code) => api.post('/auth/otp/verify', { phone, code }),
  sendEmailOtp: (email, name) => api.post('/auth/email-otp/send', { email, name }),
  verifyEmailOtp: (email, code) => api.post('/auth/email-otp/verify', { email, code }),
  me: () => api.get('/auth/me'),
};

export const chefApi = {
  nearby: (params) => api.get('/chefs/nearby', { params }),
  details: (id) => api.get(`/chefs/${id}`),
  register: (payload) => api.post('/chefs/register', payload),
  updateProfile: (payload) => api.put('/chefs/profile', payload),
  dashboard: () => api.get('/chefs/me/dashboard'),
};

export const foodApi = {
  list: (params) => api.get('/foods', { params }),
  details: (id) => api.get(`/foods/${id}`),
  create: (payload) => api.post('/foods', payload),
  update: (id, payload) => api.put(`/foods/${id}`, payload),
  remove: (id) => api.delete(`/foods/${id}`),
};

export const cartApi = {
  get: () => api.get('/cart'),
  add: (foodId, quantity = 1, foodObj = {}) =>
    api.post('/cart/add', {
      foodId,
      quantity,
      name: foodObj?.name,
      price: foodObj?.discountPrice || foodObj?.price,
      images: foodObj?.images,
      isVeg: foodObj?.isVeg,
      nutrition: foodObj?.nutrition,
    }),
  update: (foodId, quantity) => api.put('/cart/update', { foodId, quantity }),
  clear: () => api.delete('/cart/clear'),
};

export const orderApi = {
  place: (payload) => api.post('/orders', payload),
  myOrders: () => api.get('/orders/my'),
  details: (id) => api.get(`/orders/${id}`),
  chefOrders: (params) => api.get('/orders/chef', { params }),
  updateStatus: (id, payload) => api.put(`/orders/${id}/status`, payload),
};

export const deliveryApi = {
  register: (payload) => api.post('/delivery/register', payload),
  toggleOnline: () => api.put('/delivery/toggle-online'),
  updateLocation: (lat, lng) => api.put('/delivery/location', { lat, lng }),
  availableOrders: () => api.get('/delivery/available-orders'),
  accept: (orderId) => api.put(`/delivery/accept/${orderId}`),
  myDeliveries: (params) => api.get('/delivery/my-deliveries', { params }),
  dashboard: () => api.get('/delivery/dashboard'),
};

export const aiApi = {
  healthMetrics: (payload) => api.post('/ai/health-metrics', payload),
  mealRecommendation: (payload) => api.post('/ai/meal-recommendation', payload),
  chat: (message) => api.post('/ai/chat', { message }),
};

export const userApi = {
  updateProfile: (payload) => api.put('/users/profile', payload),
  addAddress: (payload) => api.post('/users/addresses', payload),
  updateAddress: (addressId, payload) => api.put(`/users/addresses/${addressId}`, payload),
  setDefaultAddress: (addressId) => api.put(`/users/addresses/${addressId}/default`),
  deleteAddress: (addressId) => api.delete(`/users/addresses/${addressId}`),
};

export const paymentApi = {
  createOrder: (orderId) => api.post('/payments/create-order', { orderId }),
  verify: (payload) => api.post('/payments/verify', payload),
};

export const notificationApi = {
  list: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export default api;
