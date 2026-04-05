// src/pages/public/HomePage.jsx
import Navbar from "../../components/common/Navbar";
import { useTheme } from "../../context/ThemeContext";

export default function HomePage({ navigate }) {
  const { T, isDark } = useTheme();
  return (
    <div style={{ minHeight: "100vh", background: T.bg, transition: "background 0.3s" }}>
      <Navbar navigate={navigate} active="home" />
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 2rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Ambient glows */}
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: "700px", height: "400px", background: "radial-gradient(ellipse, rgba(0,212,170,0.1) 0%, rgba(0,145,255,0.07) 40%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "20%", left: "15%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(0,145,255,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />

        <div style={{ animation: "fadeUp 0.7s ease both" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: isDark ? "rgba(0,212,170,0.1)" : "rgba(0,168,135,0.08)", border: `1px solid ${T.teal}44`, borderRadius: "100px", padding: "6px 16px", marginBottom: "2rem", fontSize: "0.75rem", color: T.teal, fontWeight: 600, letterSpacing: "0.06em" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.teal, display: "inline-block" }} />
            TRUSTED HEALTHCARE DIRECTORY
          </div>

          <h1 style={{ fontSize: "clamp(2.8rem,6vw,5.5rem)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.04em", marginBottom: "1.5rem" }}>
            <span style={{ background: isDark ? "linear-gradient(160deg, #fff 0%, #94a3b8 100%)" : "linear-gradient(160deg, #0f172a 0%, #475569 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Find the Right Doctor.
            </span>
            <br />
            <span style={{ background: "linear-gradient(90deg, #00d4aa, #0091ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Find the Right Hospital.
            </span>
          </h1>

          <p style={{ fontSize: "1.1rem", color: T.muted, maxWidth: "500px", lineHeight: 1.7, margin: "0 auto 3rem" }}>
            Search verified doctors by specialty and location. Explore hospitals near you with full details, maps, and contact info.
          </p>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { label: "🩺  Find Doctors",   key: "doctors",   primary: true  },
              { label: "🏥  Find Hospitals", key: "hospitals", primary: false },
            ].map(({ label, key, primary }) => (
              <button key={key} onClick={() => navigate(key)} style={{
                padding: "16px 36px", borderRadius: "12px", fontSize: "1rem", fontWeight: 600,
                cursor: "pointer", fontFamily: "'Sora',sans-serif", transition: "all 0.25s",
                background: primary ? "linear-gradient(135deg,#00d4aa,#0091ff)" : T.surface,
                color: primary ? "#000" : T.text,
                border: primary ? "none" : `1px solid ${T.border}`,
                boxShadow: primary ? "none" : "none",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = primary ? "0 12px 40px rgba(0,212,170,0.35)" : `0 8px 24px ${isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.12)"}`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >{label}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "4rem", marginTop: "6rem", flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 0.9s 0.2s ease both" }}>
          {[["500+", "Doctors"], ["80+", "Hospitals"], ["20+", "Cities"]].map(([num, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2.4rem", fontWeight: 800, color: T.text, letterSpacing: "-0.04em", transition: "color 0.3s" }}>{num}</div>
              <div style={{ fontSize: "0.82rem", color: T.dimmed, fontWeight: 500, marginTop: "4px" }}>{label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
