import axios from 'axios';

const api = axios.create({
  baseURL: 'https://hallbooker.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Set the token from localStorage if it exists
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.Authorization = `Bearer ${token}`;
  }
}

api.interceptors.request.use(
  (config) => {
    // Re-verify the token from localStorage on each request to ensure it's up-to-date
    if (typeof window !== 'undefined') {
      const currentToken = localStorage.getItem('token');
      if (currentToken && config.headers.Authorization !== `Bearer ${currentToken}`) {
        config.headers.Authorization = `Bearer ${currentToken}`;
      } else if (!currentToken) {
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