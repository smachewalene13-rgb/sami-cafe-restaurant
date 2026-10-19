import api from './axios';

export const menuApi = {
  getCategories: () => api.get('/categories'),
  getMenuItems: (params = {}) => api.get('/menu', { params }),
  getMenuItemById: (id) => api.get(`/menu/${id}`),
  addReview: (data) => api.post('/reviews', data),
};
