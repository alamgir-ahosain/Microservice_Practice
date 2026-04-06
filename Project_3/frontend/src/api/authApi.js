import api from './axios';

export const authApi = {
  // ✅ /public/register matches backend AppSecurityConfig.permitAll()
  register: (data) => api.post('/public/register', data),

  // ✅ /public/login matches backend AppSecurityConfig.permitAll()
  login:    (data) => api.post('/public/login', data),

  // Protected — needs JWT in header (interceptor handles it)
  getMe:         ()     => api.get('/api/users/me'),
  updateProfile: (data) => api.put('/api/users/me', data),

  // Admin only
  getAllUsers:    ()           => api.get('/api/users/admin/all'),
  changeUserRole:(id, role)   => api.patch(`/api/users/admin/${id}/role`, { role }),
};