// src/components/doctor/DoctorHospitalList.jsx
import { useTheme } from "../../context/ThemeContext";

export default function DoctorHospitalList({ hospitals, navigate }) {
  const { T } = useTheme();
  if (!hospitals?.length) return null;
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "16px", padding: "1.5rem", transition: "background 0.3s" }}>
      <h3 style={{ margin: "0 0 1.25rem", fontSize: "0.78rem", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
        🏥 Associated Hospitals
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {hospitals.map(h => (
          <div key={h.id} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: T.surfaceDeep, border: `1px solid ${T.border}`,
            borderRadius: "12px", padding: "12px 16px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: 36, height: 36, borderRadius: "10px", background: "rgba(0,145,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>🏥</div>
              <span style={{ color: T.text, fontWeight: 600 }}>{h.hospitalName}</span>
            </div>
            <button onClick={() => navigate({ name: "hospital-detail", id: h.hospitalId })} style={{
              background: "rgba(0,145,255,0.1)", border: "1px solid rgba(0,145,255,0.25)",
              color: T.blue, borderRadius: "8px", padding: "6px 14px",
              fontFamily: "'Sora',sans-serif", fontSize: "0.78rem", cursor: "pointer",
            }}>View →</button>
          </div>
        ))}
      </div>
    </div>
  );
}
