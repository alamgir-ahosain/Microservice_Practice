import axios from 'axios';

const USER_BASE = 'https://user-service-nfg0.onrender.com';
const PRODUCT_BASE = 'https://product-service-ihql.onrender.com';
const ORDER_BASE = 'https://order-service-wmwh.onrender.com';

// ─── Auth ────────────────────────────────────────────────────────────────────
export const register = (data) =>
  axios.post(`${USER_BASE}/public/register`, data);

export const login = (data) =>
  axios.post(`${USER_BASE}/public/login`, data);

// ─── Products ────────────────────────────────────────────────────────────────
export const getProducts = () =>
  axios.get(`${PRODUCT_BASE}/api/products`);

export const getProduct = (id) =>
  axios.get(`${PRODUCT_BASE}/api/products/${id}`);

export const createProduct = (data, userId) =>
  axios.post(`${PRODUCT_BASE}/api/products`, data, {
    headers: { 'X-User-Id': userId, 'X-User-Role': 'ADMIN' },
  });

export const deleteProduct = (id) =>
  axios.delete(`${PRODUCT_BASE}/api/products/${id}`, {
    headers: { 'X-User-Role': 'ADMIN' },
  });

export const updateProduct = (id, data) =>
  axios.put(`${PRODUCT_BASE}/api/products/${id}`, data, {
    headers: { 'X-User-Role': 'ADMIN' },
  });

// ─── Orders ──────────────────────────────────────────────────────────────────
export const placeOrder = (data, userId, userEmail) =>
  axios.post(`${ORDER_BASE}/api/orders`, data, {
    headers: { 'X-User-Id': userId, 'X-User-Email': userEmail },
  });

export const getMyOrders = (userId) =>
  axios.get(`${ORDER_BASE}/api/orders`, {
    headers: { 'X-User-Id': userId },
  });
