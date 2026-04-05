// src/components/hospital/HospitalHero.jsx
import { useTheme } from "../../context/ThemeContext";
import { typeStyle } from "../../styles/theme";

export default function HospitalHero({ hospital }) {
  const { T } = useTheme();
  return (
    <div style={{
      background: T.hospitalHeroBg, border: T.hospitalHeroBorder,
      borderRadius: "20px", padding: "2.5rem", marginBottom: "1.5rem",
      position: "relative", overflow: "hidden", transition: "background 0.3s",
    }}>
      <div style={{ position: "absolute", top: -40, right: -40, width: 220, height: 220, background: "radial-gradient(circle,rgba(0,145,255,0.1) 0%,transparent 70%)", pointerEvents: "none" }} />
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{
          width: 80, height: 80, borderRadius: "20px", flexShrink: 0,
          background: "linear-gradient(135deg,rgba(0,145,255,0.2),rgba(168,85,247,0.15))",
          border: "1px solid rgba(0,145,255,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px",
        }}>🏥</div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.03em", color: T.text, marginBottom: "0.6rem", transition: "color 0.3s" }}>
            {hospital.name}
          </h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "1rem" }}>
            {(hospital.types || []).map(t => {
              const ts = typeStyle(t);
              return <span key={t} style={{ background: ts.bg, border: `1px solid ${ts.border}`, color: ts.text, fontSize: "0.78rem", padding: "4px 12px", borderRadius: "100px", fontWeight: 600 }}>{t}</span>;
            })}
          </div>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            {hospital.phoneNumber && <span style={{ color: T.muted, fontSize: "0.875rem" }}>📞 {hospital.phoneNumber}</span>}
            {hospital.website && (
              <a href={hospital.website.startsWith("http") ? hospital.website : `https://${hospital.website}`} target="_blank" rel="noreferrer" className="map-link" style={{ color: T.blue, fontSize: "0.875rem", textDecoration: "none" }}>
                🌐 {hospital.website}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
