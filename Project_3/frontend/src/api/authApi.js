// src/api/authApi.js
// Matches your backend endpoints exactly:
// POST /public/register  → AuthController
// POST /public/login     → AuthController
import api from "./axios";

export const authApi = {
  register: (data) => api.post("/public/register", data),
  login: (data) => api.post("/public/login", data),
  getMe: () => api.get("/api/users/me"),
  updateProfile: (data) => api.put("/api/users/me", data),

  // Admin only
  getAllUsers: () => api.get("/api/users/admin/all"),
  changeUserRole: (id, role) =>
    api.patch(`/api/users/admin/${id}/role`, { role }),
};
