import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Pegawai API
export const pegawaiAPI = {
  getAll: (params) => api.get('/pegawai', { params }),
  getById: (id) => api.get(`/pegawai/${id}`),
  create: (data) => api.post('/pegawai', data),
  update: (id, data) => api.put(`/pegawai/${id}`, data),
  delete: (id) => api.delete(`/pegawai/${id}`),
  getDepartemen: () => api.get('/pegawai/departemen'),
};

// Absensi API
export const absensiAPI = {
  checkIn: (data) => api.post('/absensi/check-in', data),
  checkOut: (data) => api.post('/absensi/check-out', data),
  getTodayStatus: (pegawaiId) => api.get(`/absensi/today/${pegawaiId}`),
  getTodayAll: () => api.get('/absensi/today'),
  getHistory: (params) => api.get('/absensi/history', { params }),
  update: (id, data) => api.put(`/absensi/${id}`, data),
};

// Laporan API
export const laporanAPI = {
  getMonthly: (params) => api.get('/laporan/monthly', { params }),
  getDashboard: () => api.get('/laporan/dashboard'),
  exportCSV: (params) => api.get('/laporan/export/csv', { params, responseType: 'blob' }),
  exportPDF: (params) => api.get('/laporan/export/pdf', { params, responseType: 'blob' }),
};

// Hari Libur API
export const hariLiburAPI = {
  getAll: (params) => api.get('/hari-libur', { params }),
  create: (data) => api.post('/hari-libur', data),
  delete: (id) => api.delete(`/hari-libur/${id}`),
};

export default api;
