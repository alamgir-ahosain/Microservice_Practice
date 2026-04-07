// src/api/productApi.js
// Phase 2: product-service on 8083 (direct)
// Phase 4: all through gateway on 8080 — axios.js baseURL already set
import api from "./axios";

export const productApi = {
  getAll: () => api.get("/api/products"),
  getOne: (id) => api.get(`/api/products/${id}`),
  create: (data) => api.post("/api/products", data),
  update: (id, d) => api.put(`/api/products/${id}`, d),
  delete: (id) => api.delete(`/api/products/${id}`),
  searchByCategory: (cat) => api.get(`/api/products?category=${cat}`),
};
