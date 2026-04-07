// src/api/orderApi.js
import api from "./axios";

export const orderApi = {
  placeOrder: (data) => api.post("/api/orders", data),
  myOrders: () => api.get("/api/orders"),
  getOrder: (id) => api.get(`/api/orders/${id}`),
  cancel: (id) => api.patch(`/api/orders/${id}/cancel`),
};
