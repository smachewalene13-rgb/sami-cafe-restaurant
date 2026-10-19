import api from './axios';

export const adminApi = {
  // Summary & Reports
  getSummary: () => api.get('/reports/summary'),
  getSalesReport: (params) => api.get('/reports/sales', { params }),
  getTopItems: () => api.get('/reports/top-items'),

  // Menu Items CRUD
  createMenuItem: (formData) => api.post('/menu', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateMenuItem: (id, formData) => api.put(`/menu/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  toggleItemAvailability: (id, isAvailable) => api.patch(`/menu/${id}/availability`, { isAvailable }),
  deleteMenuItem: (id) => api.delete(`/menu/${id}`),

  // Categories CRUD
  getAllCategories: () => api.get('/categories/all'),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),

  // Tables CRUD
  createTable: (data) => api.post('/tables', data),
  updateTable: (id, data) => api.put(`/tables/${id}`, data),
  deleteTable: (id) => api.delete(`/tables/${id}`),

  // Inventory
  getIngredients: () => api.get('/inventory/ingredients'),
  getLowStock: () => api.get('/inventory/low-stock'),
  stockIn: (data) => api.post('/inventory/stock-in', data),
  createIngredient: (data) => api.post('/inventory/ingredients', data),

  // Promos
  getPromos: () => api.get('/promos'),
  createPromo: (data) => api.post('/promos', data),
  updatePromo: (id, data) => api.put(`/promos/${id}`, data),
  deletePromo: (id) => api.delete(`/promos/${id}`),

  // Users
  getUsers: (params) => api.get('/users', { params }),
  createUser: (data) => api.post('/users', data),
  updateUserRole: (id, data) => api.patch(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),

  // Settings & Notifications
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),
  getNotificationLogs: () => api.get('/settings/notifications/logs'),
  sendTestTelegram: (data) => api.post('/settings/notifications/test-telegram', data),
  sendTestSms: (data) => api.post('/settings/notifications/test-sms', data),
};
