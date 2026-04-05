// src/components/doctor/DoctorHero.jsx
import { Badge } from "../common/UI";
import { useTheme } from "../../context/ThemeContext";
import { getDocIcon } from "../../styles/theme";

export default function DoctorHero({ doctor }) {
  const { T } = useTheme();
  return (
    <div style={{
      background: T.doctorHeroBg, border: T.doctorHeroBorder,
      borderRadius: "20px", padding: "2.5rem", marginBottom: "1.5rem",
      position: "relative", overflow: "hidden", transition: "background 0.3s",
    }}>
      <div style={{ position: "absolute", top: -30, right: -30, width: 200, height: 200, background: "radial-gradient(circle,rgba(0,212,170,0.08) 0%,transparent 70%)", pointerEvents: "none" }} />
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{
          width: 80, height: 80, borderRadius: "20px", flexShrink: 0,
          background: T.isDark ? "rgba(0,212,170,0.12)" : "rgba(0,168,135,0.1)",
          border: `1px solid ${T.teal}4d`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px",
        }}>
          {getDocIcon(doctor.specialties)}
        </div>
        <div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.03em", color: T.text, marginBottom: "0.6rem", transition: "color 0.3s" }}>
            {doctor.name}
          </h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {(doctor.specialties || []).map(s => <Badge key={s}>{s}</Badge>)}
          </div>
        </div>
      </div>
    </div>
  );
}
