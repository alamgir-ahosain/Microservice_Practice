import axios from 'axios';
// Phase 2: product-service is on port 8083
// We will merge all these into ONE axios instance pointing to 8080 in Phase 4
const productAxios = axios.create({
baseURL: 'http://localhost:8083',
headers: { 'Content-Type': 'application/json' },
});
// Attach JWT + role headers so product-service can verify admin access
productAxios.interceptors.request.use((config) => {
const token = localStorage.getItem('accessToken');
const user = JSON.parse(localStorage.getItem('user') || '{}');
if (token) {
config.headers.Authorization = `Bearer ${token}`;
config.headers['X-User-Id'] = user.userId;
config.headers['X-User-Role'] = user.role;
}
return config;
});
export const productApi = {
getAll: () => productAxios.get('/api/products'),
getOne: (id) => productAxios.get(`/api/products/${id}`),
create: (data) => productAxios.post('/api/products', data),
update: (id, d) => productAxios.put(`/api/products/${id}`, d),
delete: (id) => productAxios.delete(`/api/products/${id}`),
};
