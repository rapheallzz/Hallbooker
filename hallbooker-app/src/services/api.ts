import axios from 'axios';

const api = axios.create({
  baseURL: '// https://hallbooker.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// https://hallbooker.onrender.com/api/v1
// https://qspfh08j-8000.uks1.devtunnels.ms/api/v1

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;