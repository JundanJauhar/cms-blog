import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Automatically inject Authorization Bearer Token if present in localStorage
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('blog_cms_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle global response errors (e.g., token expiration / database reset)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend returns 401 (Unauthorized) and it's not a login request
    if (
      error.response &&
      error.response.status === 401 &&
      error.config &&
      !error.config.url.endsWith('/login')
    ) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('blog_cms_token');
        localStorage.removeItem('blog_cms_user');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
