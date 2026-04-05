// src/components/hospital/HospitalCard.jsx
import { useTheme } from "../../context/ThemeContext";
import { typeStyle } from "../../styles/theme";

export default function HospitalCard({ hospital, onClick }) {
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
          background: "linear-gradient(135deg,rgba(0,145,255,0.15),rgba(168,85,247,0.1))",
          border: "1px solid rgba(0,145,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px",
        }}>🏥</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: "1rem", color: T.text, marginBottom: "6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", transition: "color 0.3s" }}>
            {hospital.name}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {(hospital.types || []).slice(0, 2).map(t => {
              const ts = typeStyle(t);
              return <span key={t} style={{ background: ts.bg, border: `1px solid ${ts.border}`, color: ts.text, fontSize: "0.7rem", padding: "2px 8px", borderRadius: "100px", fontWeight: 600 }}>{t}</span>;
            })}
          </div>
        </div>
      </div>
      <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "4px" }}>
        {hospital.locationResponse?.city && <span style={{ color: T.muted, fontSize: "0.81rem" }}>📍 {hospital.locationResponse.city}{hospital.locationResponse.thana ? `, ${hospital.locationResponse.thana}` : ""}</span>}
        {hospital.phoneNumber && <span style={{ color: T.muted, fontSize: "0.81rem" }}>📞 {hospital.phoneNumber}</span>}
        {hospital.website && <span style={{ color: T.muted, fontSize: "0.81rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>🌐 {hospital.website}</span>}
      </div>
      <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: T.dimmed, fontSize: "0.78rem" }}>View full details</span>
        <span style={{ color: T.blue }}>→</span>
      </div>
    </div>
  );
}
