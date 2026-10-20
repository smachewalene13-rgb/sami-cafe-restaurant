import axios from 'axios';

const PROD_API_URL = 'https://sami-cafe-restaurant-1.onrender.com/api/v1';

const getBaseUrl = () => {
  // If running in browser and NOT running on local development machine (localhost / 127.0.0.1)
  // ALWAYS route requests to the live production Render backend
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl && envUrl.startsWith('https://') && !envUrl.includes('localhost')) {
      return envUrl;
    }
    return PROD_API_URL;
  }

  // Local development fallback
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes('10000') && !envUrl.includes('undefined')) {
    return envUrl;
  }
  return 'http://localhost:5000/api/v1';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    // Fail-safe protection: if deployed to production (e.g. *.vercel.app), NEVER allow localhost calls
    if (
      typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      if (!config.baseURL || config.baseURL.includes('localhost')) {
        config.baseURL = PROD_API_URL;
      }
    }

    const token = localStorage.getItem('sami_cafe_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    if (error.response?.status === 401) {
      // If unauthorized token expired
      // localStorage.removeItem('sami_cafe_token');
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
