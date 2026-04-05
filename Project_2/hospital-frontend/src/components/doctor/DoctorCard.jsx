// src/components/doctor/DoctorCard.jsx
import { Badge } from "../common/UI";
import { useTheme } from "../../context/ThemeContext";
import { getDocIcon } from "../../styles/theme";

export default function DoctorCard({ doctor, onClick }) {
  const { T } = useTheme();
  return (
    <div className="card-hover" onClick={onClick} style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: "16px", padding: "1.5rem",
      transition: "background 0.3s, border-color 0.3s",
    }}>
      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
        <div style={{
          width: 52, height: 52, borderRadius: "14px", flexShrink: 0,
          background: "linear-gradient(135deg,rgba(0,212,170,0.15),rgba(0,145,255,0.15))",
          border: "1px solid rgba(0,212,170,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px",
        }}>
          {getDocIcon(doctor.specialties)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: "1rem", color: T.text, marginBottom: "6px", transition: "color 0.3s" }}>
            {doctor.name}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {(doctor.specialties || []).slice(0, 2).map(s => <Badge key={s}>{s}</Badge>)}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "4px" }}>
        {doctor.locationResponse?.city && (
          <span style={{ color: T.muted, fontSize: "0.81rem" }}>
            📍 {doctor.locationResponse.city}{doctor.locationResponse.thana ? `, ${doctor.locationResponse.thana}` : ""}
          </span>
        )}
        {doctor.phoneNumber && <span style={{ color: T.muted, fontSize: "0.81rem" }}>📞 {doctor.phoneNumber}</span>}
        {doctor.doctorHospitals?.length > 0 && (
          <span style={{ color: T.muted, fontSize: "0.81rem" }}>
            🏥 {doctor.doctorHospitals.length} hospital{doctor.doctorHospitals.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: T.dimmed, fontSize: "0.78rem" }}>View full profile</span>
        <span style={{ color: T.teal }}>→</span>
      </div>
    </div>
  );
}
