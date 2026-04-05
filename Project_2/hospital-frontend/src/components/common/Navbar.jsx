// src/components/common/Navbar.jsx
import { useTheme } from "../../context/ThemeContext";

export default function Navbar({ navigate, active }) {
  const { T, isDark, toggle } = useTheme();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${T.bg}; color: ${T.text}; font-family: 'Sora', sans-serif; transition: background 0.3s, color 0.3s; }
        input::placeholder { color: ${T.dimmed}; }
        input:focus, select:focus { outline: none; border-color: rgba(0,212,170,0.4) !important; }
        @keyframes pulse  { 0%,100%{opacity:.4} 50%{opacity:.7} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .card-hover { transition: all 0.25s; cursor: pointer; }
        .card-hover:hover { background: ${T.cardHoverBg} !important; transform: translateY(-4px); box-shadow: ${T.cardHoverShadow} !important; border-color: ${T.borderHover} !important; }
        .nav-btn { transition: all 0.2s; }
        .nav-btn:hover { color: ${T.text} !important; border-color: ${T.borderHover} !important; }
        .back-btn:hover { color: ${T.teal} !important; }
        .map-link:hover  { opacity: 0.85; }
        .theme-toggle:hover { opacity: 0.8; transform: scale(1.05); }
      `}</style>

      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: T.navBg, backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 2.5rem", height: "64px",
        transition: "background 0.3s, border-color 0.3s",
      }}>
        {/* Logo */}
        <button
          onClick={() => navigate("home")}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: "8px",
            background: "linear-gradient(135deg,#00d4aa,#0091ff)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px",
          }}>⚕</div>
          <span style={{ color: T.text, fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.02em", transition: "color 0.3s" }}>MediFind</span>
        </button>

        {/* Right side */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {/* Nav links */}
          {[
            { label: "Find Doctors",   key: "doctors"   },
            { label: "Find Hospitals", key: "hospitals" },
          ].map(({ label, key }) => (
            <button
              key={key}
              onClick={() => navigate(key)}
              className="nav-btn"
              style={{
                background: active === key ? (isDark ? "rgba(0,212,170,0.1)" : "rgba(0,168,135,0.08)") : "none",
                border:     active === key ? `1px solid ${T.teal}55` : "1px solid transparent",
                color:      active === key ? T.teal : T.muted,
                padding: "8px 20px", borderRadius: "8px",
                fontFamily: "'Sora',sans-serif", fontWeight: 500, fontSize: "0.9rem", cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {label}
            </button>
          ))}

          {/* Dark / Light toggle */}
          <button
            onClick={toggle}
            className="theme-toggle"
            title={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 38, height: 38, borderRadius: "10px",
              background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
              border: `1px solid ${T.border}`,
              cursor: "pointer", fontSize: "17px",
              transition: "all 0.2s", marginLeft: "4px",
            }}
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </nav>
    </>
  );
}
