import api from './axios';

export const reservationApi = {
  checkAvailability: (params) => api.get('/reservations/availability', { params }),
  createReservation: (data) => api.post('/reservations', data),
  getMyReservations: () => api.get('/reservations/my'),
  getAllReservations: (params = {}) => api.get('/reservations', { params }),
  updateStatus: (id, status, tableId) => api.patch(`/reservations/${id}/status`, { status, tableId }),
  getTables: () => api.get('/tables'),
  updateTableStatus: (id, status) => api.patch(`/tables/${id}/status`, { status }),
};
