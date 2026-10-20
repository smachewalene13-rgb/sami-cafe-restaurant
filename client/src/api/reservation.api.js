import api from './axios';
import { getMatchingTables } from '../data/initialTablesData';

export const reservationApi = {
  checkAvailability: async (params = {}) => {
    try {
      const res = await api.get('/reservations/availability', { params });
      if (res?.data?.tables && res.data.tables.length > 0) {
        return res;
      }
      const fallback = getMatchingTables(params.guests);
      return { data: { available: true, count: fallback.length, tables: fallback } };
    } catch (err) {
      console.warn('Live availability endpoint warning, using initial table setup:', err.message);
      const fallback = getMatchingTables(params.guests);
      return { data: { available: true, count: fallback.length, tables: fallback } };
    }
  },
  createReservation: (data) => api.post('/reservations', data),
  getMyReservations: () => api.get('/reservations/my'),
  getAllReservations: (params = {}) => api.get('/reservations', { params }),
  updateStatus: (id, status, tableId) => api.patch(`/reservations/${id}/status`, { status, tableId }),
  getTables: () => api.get('/tables'),
  updateTableStatus: (id, status) => api.patch(`/tables/${id}/status`, { status }),
};
