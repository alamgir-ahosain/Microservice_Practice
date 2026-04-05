// src/services/api.js
import axios from "axios";

// ── Auth Service (port 8081) ─────────────────────────────────────────
export const authAPI = axios.create({
  baseURL: "http://localhost:8081",
  headers: { "Content-Type": "application/json" },
});

// ── Hospital Service (port 8083) ─────────────────────────────────────
export const hospitalAPI = axios.create({
  baseURL: "http://localhost:8083",
  headers: { "Content-Type": "application/json" },
});

// ── Auto-attach JWT to every hospital-service request ────────────────
hospitalAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Only auto-logout on 401 (token expired), NOT 403 (forbidden) ─────
// 403 means the endpoint exists but role is wrong — handle in the component
hospitalAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired — force re-login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    // 403 and other errors — let the calling component handle them
    return Promise.reject(error);
  },
);

export const patientService = {
  getAll: () => hospitalAPI.get("/api/patients"),
  getById: (id) => hospitalAPI.get(`/api/patients/${id}`),
  create: (data) => hospitalAPI.post("/api/patients", data),
  update: (id, d) => hospitalAPI.put(`/api/patients/${id}`, d),
  delete: (id) => hospitalAPI.delete(`/api/patients/${id}`),
};

export const doctorService = {
  getAll: () => hospitalAPI.get("/api/doctors"),
  getById: (id) => hospitalAPI.get(`/api/doctors/${id}`),
  create: (data) => hospitalAPI.post("/api/doctors", data),
  update: (id, d) => hospitalAPI.put(`/api/doctors/${id}`, d),
  delete: (id) => hospitalAPI.delete(`/api/doctors/${id}`),
};

export const appointmentService = {
  getAll: () => hospitalAPI.get("/api/appointments"),
  getByPatient: (pid) => hospitalAPI.get(`/api/appointments/patient/${pid}`),
  getByDoctor: (did) => hospitalAPI.get(`/api/appointments/doctor/${did}`),
  create: (data) => hospitalAPI.post("/api/appointments", data),
  update: (id, d) => hospitalAPI.put(`/api/appointments/${id}`, d),
  delete: (id) => hospitalAPI.delete(`/api/appointments/${id}`),
};

export const hospitalService = {
  getAll: () => hospitalAPI.get("/hospital/v1"),
  getById: (id) => hospitalAPI.get(`/hospital/v1/${id}`),
  create: (data) => hospitalAPI.post("/hospital/v1/register", data),
  update: (id, d) => hospitalAPI.put(`/hospital/v1/${id}`, d),
  delete: (id) => hospitalAPI.delete(`/hospital/v1/${id}`),
};
