import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

// Interceptor to attach JWT Bearer token
API.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        if (parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch (err) {
        console.error('Failed to parse token from localStorage:', err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
