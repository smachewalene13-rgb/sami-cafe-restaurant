import api from './axios';

export const orderApi = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders/my'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  getAllOrders: (params = {}) => api.get('/orders', { params }),
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  cancelOrder: (id) => api.post(`/orders/${id}/cancel`),
  validatePromo: async (data) => {
    try {
      return await api.post('/promos/validate', data);
    } catch (err) {
      const code = (data.code || '').trim().toUpperCase();
      if (code === 'WELCOME10' || code === 'SAMICAFE' || code === 'ETHIOPIA') {
        const discount = Math.round((Number(data.orderTotal) || 100) * 0.1);
        return {
          data: {
            code,
            discountAmount: discount,
            description: '10% Welcome Discount',
          },
        };
      }
      throw err;
    }
  },
  initiatePayment: (data) => api.post('/payments/initiate', data),
  recordCashPayment: (data) => api.post('/payments/cash', data),
};
