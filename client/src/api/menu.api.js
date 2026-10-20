import api from './axios';
import { INITIAL_CATEGORIES, INITIAL_MENU_ITEMS } from '../data/initialMenuData';

export const menuApi = {
  getCategories: async () => {
    try {
      const res = await api.get('/categories');
      if (res?.data && res.data.length > 0) return res;
      return { data: INITIAL_CATEGORIES };
    } catch (err) {
      console.warn('Backend unavailable, using initial categories:', err.message);
      return { data: INITIAL_CATEGORIES };
    }
  },

  getMenuItems: async (params = {}) => {
    try {
      const res = await api.get('/menu', { params });
      if (res?.data?.items && res.data.items.length > 0) return res;
      // Filter initial items
      let items = [...INITIAL_MENU_ITEMS];
      if (params.categoryId) {
        items = items.filter((i) => String(i.category_id) === String(params.categoryId));
      }
      if (params.q) {
        const q = params.q.toLowerCase();
        items = items.filter(
          (i) => i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)
        );
      }
      if (params.vegetarian === 'true') {
        items = items.filter((i) => i.is_vegetarian);
      }
      if (params.fasting === 'true') {
        items = items.filter((i) => i.is_fasting);
      }
      return { data: { items, total: items.length } };
    } catch (err) {
      console.warn('Backend unavailable, using initial menu items:', err.message);
      let items = [...INITIAL_MENU_ITEMS];
      if (params.categoryId) {
        items = items.filter((i) => String(i.category_id) === String(params.categoryId));
      }
      if (params.q) {
        const q = params.q.toLowerCase();
        items = items.filter(
          (i) => i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)
        );
      }
      if (params.vegetarian === 'true') {
        items = items.filter((i) => i.is_vegetarian);
      }
      if (params.fasting === 'true') {
        items = items.filter((i) => i.is_fasting);
      }
      return { data: { items, total: items.length } };
    }
  },

  getMenuItemById: async (id) => {
    try {
      return await api.get(`/menu/${id}`);
    } catch (err) {
      const item = INITIAL_MENU_ITEMS.find((i) => String(i.id) === String(id));
      return { data: item || null };
    }
  },

  addReview: (data) => api.post('/reviews', data),
};
