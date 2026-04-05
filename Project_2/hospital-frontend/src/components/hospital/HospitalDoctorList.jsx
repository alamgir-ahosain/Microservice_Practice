// src/components/hospital/HospitalDoctorList.jsx
import { Badge } from "../common/UI";
import { useTheme } from "../../context/ThemeContext";

export default function HospitalDoctorList({ doctors, navigate }) {
  const { T } = useTheme();
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "16px", padding: "1.5rem", transition: "background 0.3s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.25rem" }}>
        <h3 style={{ margin: 0, fontSize: "0.78rem", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
          🩺 Associated Doctors
        </h3>
        <span style={{ background: T.isDark ? "rgba(0,212,170,0.1)" : "rgba(0,168,135,0.08)", border: `1px solid ${T.teal}33`, color: T.teal, borderRadius: "100px", padding: "2px 10px", fontSize: "0.75rem", fontWeight: 700 }}>
          {doctors.length}
        </span>
      </div>
      {doctors.length === 0 ? (
        <p style={{ color: T.dimmed, fontSize: "0.875rem", margin: 0 }}>No doctors linked to this hospital yet.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "10px" }}>
          {doctors.map(doc => (
            <div key={doc.id} onClick={() => navigate({ name: "doctor-detail", id: doc.id })}
              style={{ background: T.surfaceDeep, border: `1px solid ${T.border}`, borderRadius: "12px", padding: "1rem", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${T.teal}55`; e.currentTarget.style.background = T.isDark ? "rgba(0,212,170,0.05)" : "rgba(0,168,135,0.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.surfaceDeep; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ color: T.text, fontWeight: 700, fontSize: "0.92rem", marginBottom: "4px" }}>{doc.name}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                    {(doc.specialties || []).slice(0, 2).map(s => <Badge key={s}>{s}</Badge>)}
                  </div>
                </div>
                <span style={{ color: T.teal, fontSize: "0.9rem" }}>→</span>
              </div>
              {doc.phoneNumber && <div style={{ color: T.dimmed, fontSize: "0.78rem", marginTop: "6px" }}>📞 {doc.phoneNumber}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
