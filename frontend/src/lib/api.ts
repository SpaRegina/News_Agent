import axios from 'axios';

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

const api = axios.create({
  baseURL: apiBaseUrl ? `${apiBaseUrl}/api/v1` : '/api/v1',
});

function getAuthToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('token');
}

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { email: string; full_name?: string; password: string }) =>
    api.post('auth/register', data),

  login: (email: string, password: string) => {
    const form = new FormData();
    form.append('username', email);
    form.append('password', password);
    return api.post<{ access_token: string }>('auth/login', form);
  },

  me: () => api.get('auth/me'),
};

export const tasksApi = {
  list: () => api.get('tasks/'),
  get: (id: number) => api.get(`tasks/${id}`),
  create: (data: any) => api.post('tasks/', data),
  update: (id: number, data: any) => api.put(`tasks/${id}`, data),
  delete: (id: number) => api.delete(`tasks/${id}`),
  pause: (id: number) => api.post(`tasks/${id}/pause`),
  resume: (id: number) => api.post(`tasks/${id}/resume`),
  runNow: (id: number) => api.post(`tasks/${id}/run`),
  getRuns: (id: number) => api.get(`tasks/${id}/runs`),
};

export default api;
