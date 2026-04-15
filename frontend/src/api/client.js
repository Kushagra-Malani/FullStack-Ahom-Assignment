import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE}/auth/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem('access_token', res.data.access);
          localStorage.setItem('refresh_token', res.data.refresh);
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  githubLogin: (code) => api.post('/auth/github/', { code }),
  googleLogin: (code, redirectUri) => api.post('/auth/google/', { code, redirect_uri: redirectUri }),
  demoLogin: (role) => api.post('/auth/demo-login/', { role }),
  getProfile: () => api.get('/auth/me/'),
  updateProfile: (data) => api.patch('/auth/me/', data),
  refreshToken: (refresh) => api.post('/auth/refresh/', { refresh }),
};

// Sessions
export const sessionsAPI = {
  list: (params = {}) => api.get('/sessions/', { params }),
  get: (id) => api.get(`/sessions/${id}/`),
  create: (data) => api.post('/sessions/', data),
  update: (id, data) => api.patch(`/sessions/${id}/`, data),
  delete: (id) => api.delete(`/sessions/${id}/`),
  // Creator endpoints
  creatorList: () => api.get('/sessions/creator/'),
  creatorCreate: (data) => api.post('/sessions/creator/', data),
  creatorUpdate: (id, data) => api.patch(`/sessions/creator/${id}/`, data),
  creatorDelete: (id) => api.delete(`/sessions/creator/${id}/`),
};

// Bookings
export const bookingsAPI = {
  list: (params = {}) => api.get('/bookings/', { params }),
  create: (sessionId) => api.post('/bookings/', { session: sessionId }),
  cancel: (id) => api.post(`/bookings/${id}/cancel/`),
  // Creator endpoints
  creatorList: () => api.get('/bookings/creator/'),
};

export default api;
