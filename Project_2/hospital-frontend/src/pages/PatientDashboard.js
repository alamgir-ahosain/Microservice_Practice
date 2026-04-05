import { useEffect, useState } from "react";
import axios from "axios";

export default function PatientDashboard() {
  const [userData, setUserData] = useState(null);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("patients");

  useEffect(() => {
    // Check token on load
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      window.location.href = "/login";
      return;
    }

    setUserData(JSON.parse(user));
    fetchData(token);
  }, []);

  const fetchData = async (token) => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [pRes, aRes] = await Promise.all([
        axios.get("http://localhost:8083/api/patients", { headers }),
        axios.get("http://localhost:8083/api/appointments", { headers }),
      ]);
      setPatients(pRes.data);
      setAppointments(aRes.data);
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err.message);
      if (err.response?.status === 403) {
        alert("Access denied. Please login again.");
        localStorage.clear();
        window.location.href = "/login";
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  if (!userData) return <p style={{ padding: "2rem" }}>Loading...</p>;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8" }}>
      {/* Navbar */}
      <nav
        style={{
          background: "#2b6cb0",
          color: "#fff",
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: "1.2rem" }}>
          🏥 Hospital Management
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span>
            👤 {userData.name} ({userData.role})
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: "0.4rem 1rem",
              background: "#e53e3e",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div style={{ padding: "2rem", maxWidth: "1100px", margin: "0 auto" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {["patients", "appointments"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "0.5rem 1.2rem",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 500,
                background: activeTab === tab ? "#2b6cb0" : "#fff",
                color: activeTab === tab ? "#fff" : "#000",
                border: "1px solid #cbd5e0",
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Patients Tab */}
        {activeTab === "patients" && (
          <div>
            <h3>Patients ({patients.length})</h3>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "#fff",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <thead>
                <tr style={{ background: "#ebf4ff" }}>
                  {["Id", "Name", "Email", "Phone", "Blood Group", "Age"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "0.75rem",
                          textAlign: "left",
                          borderBottom: "2px solid #bee3f8",
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {patients.map((p, i) => (
                  <tr
                    key={p.id}
                    style={{ background: i % 2 === 0 ? "#fff" : "#f7fafc" }}
                  >
                    <td style={{ padding: "0.65rem" }}>{p.id}</td>
                    <td style={{ padding: "0.65rem" }}>{p.name}</td>
                    <td style={{ padding: "0.65rem" }}>{p.email}</td>
                    <td style={{ padding: "0.65rem" }}>{p.phone}</td>
                    <td style={{ padding: "0.65rem" }}>{p.bloodGroup}</td>
                    <td style={{ padding: "0.65rem" }}>{p.age}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <div>
            <h3>Appointments ({appointments.length})</h3>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "#fff",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <thead>
                <tr style={{ background: "#ebf4ff" }}>
                  {["Id", "Patient", "Doctor", "Time", "Status"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "0.75rem",
                        textAlign: "left",
                        borderBottom: "2px solid #bee3f8",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointments.map((a, i) => (
                  <tr
                    key={a.id}
                    style={{ background: i % 2 === 0 ? "#fff" : "#f7fafc" }}
                  >
                    <td style={{ padding: "0.65rem" }}>{a.id}</td>
                    <td style={{ padding: "0.65rem" }}>{a.patient?.name}</td>
                    <td style={{ padding: "0.65rem" }}>{a.doctor?.name}</td>
                    <td style={{ padding: "0.65rem" }}>{a.appointmentTime}</td>
                    <td style={{ padding: "0.65rem" }}>{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
