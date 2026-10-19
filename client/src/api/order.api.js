import api from './axios';

export const orderApi = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders/my'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  getAllOrders: (params = {}) => api.get('/orders', { params }),
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  cancelOrder: (id) => api.post(`/orders/${id}/cancel`),
  validatePromo: (data) => api.post('/promos/validate', data),
  initiatePayment: (data) => api.post('/payments/initiate', data),
  recordCashPayment: (data) => api.post('/payments/cash', data),
};
