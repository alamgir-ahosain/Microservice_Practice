// src/services/publicApi.js
// ─── Public-facing API calls to hospital-service (port 8083) ──────────────────
// Attaches JWT from localStorage if present (works for both guests and logged-in users).

const BASE_URL = "http://localhost:8083";

async function apiFetch(path) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const publicDoctorService = {
  getAll:   ()   => apiFetch("/api/doctors"),
  getById:  (id) => apiFetch(`/api/doctors/${id}`),
};

export const publicHospitalService = {
  getAll:   ()   => apiFetch("/hospital/v1"),
  getById:  (id) => apiFetch(`/hospital/v1/${id}`),
};
