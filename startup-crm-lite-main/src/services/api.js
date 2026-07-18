import axios from 'axios';
import toast from 'react-hot-toast';

/**
 * Configure default Axios API client instance with environment-provided baseURL.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000'
});

// Toast design style mapping
const DANGER_ICON = { iconTheme: { primary: '#EF4444', secondary: '#FFF' } };

// Request interceptor: attaches the JWT token from localStorage to the headers of outgoing requests.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('crm-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handles common errors globally (unauthorized/expired token, network failures).
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 1. Check if it is a network error (no response received from server)
    if (!error.response) {
      toast.error('Cannot connect to server. Check your connection.', DANGER_ICON);
      return Promise.reject(error);
    }

    const { status } = error.response;

    // 2. Clear token and redirect to login page on 401 Unauthorized/Expired responses
    if (status === 401) {
      localStorage.removeItem('crm-token');
      // Force page redirection to /login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
