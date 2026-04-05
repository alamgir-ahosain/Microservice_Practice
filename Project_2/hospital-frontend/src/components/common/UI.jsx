// src/components/common/UI.jsx
import { useTheme } from "../../context/ThemeContext";

export function InfoRow({ label, value }) {
  const { T } = useTheme();
  if (!value && value !== 0) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
      <span style={{ color: T.dimmed, fontSize: "0.83rem", flexShrink: 0 }}>{label}</span>
      <span style={{ color: T.textSub, fontSize: "0.83rem", fontWeight: 500, textAlign: "right" }}>{value}</span>
    </div>
  );
}

export function InfoCard({ title, icon, children }) {
  const { T } = useTheme();
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: "16px", padding: "1.5rem",
      transition: "background 0.3s, border-color 0.3s",
    }}>
      <h3 style={{ margin: "0 0 1rem", fontSize: "0.78rem", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
        {icon} {title}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>{children}</div>
    </div>
  );
}

export function Badge({ children, color = "teal" }) {
  const { T } = useTheme();
  const c = color === "blue"
    ? { bg: "rgba(37,99,235,0.1)", border: "rgba(37,99,235,0.25)", text: T.blue }
    : { bg: T.isDark ? "rgba(0,212,170,0.12)" : "rgba(0,168,135,0.1)", border: T.isDark ? "rgba(0,212,170,0.25)" : "rgba(0,168,135,0.25)", text: T.teal };
  return (
    <span style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text, fontSize: "0.72rem", padding: "3px 10px", borderRadius: "100px", fontWeight: 600 }}>
      {children}
    </span>
  );
}

export function FilterBar({ search, setSearch, searchPlaceholder, selects, onClear, count, noun }) {
  const { T } = useTheme();
  const hasFilter = search || selects.some(s => s.value);
  return (
    <>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "1rem" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={searchPlaceholder}
          style={{
            background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: "10px",
            padding: "10px 16px", color: T.text, fontFamily: "'Sora',sans-serif",
            fontSize: "0.88rem", minWidth: "200px", transition: "background 0.3s, border-color 0.3s",
          }}
        />
        {selects.map(s => (
          <select key={s.label} value={s.value} onChange={e => s.setter(e.target.value)} style={{
            background: T.selectBg, border: `1px solid ${T.border}`, borderRadius: "10px",
            padding: "10px 16px", color: T.muted, fontFamily: "'Sora',sans-serif",
            fontSize: "0.88rem", cursor: "pointer", transition: "background 0.3s",
          }}>
            <option value="">{s.label}</option>
            {s.options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
        {hasFilter && (
          <button onClick={onClear} style={{
            background: "none", border: `1px solid ${T.border}`, borderRadius: "10px",
            padding: "10px 16px", color: T.muted, fontFamily: "'Sora',sans-serif",
            fontSize: "0.85rem", cursor: "pointer",
          }}>✕ Clear</button>
        )}
      </div>
      <div style={{ color: T.dimmed, fontSize: "0.82rem", marginBottom: "1.5rem" }}>
        {count} {noun}{count !== 1 ? "s" : ""} found
      </div>
    </>
  );
}

export function SkeletonGrid() {
  const { T } = useTheme();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1.25rem" }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ height: "200px", borderRadius: "16px", background: T.skeletonBg, animation: "pulse 1.5s infinite" }} />
      ))}
    </div>
  );
}

export function ErrorBox({ message }) {
  return (
    <div style={{ color: "#f87171", padding: "2rem", textAlign: "center", background: "rgba(248,113,113,0.08)", borderRadius: "12px" }}>
      {message}
    </div>
  );
}

export function BackButton({ label, onClick }) {
  const { T } = useTheme();
  return (
    <button className="back-btn" onClick={onClick} style={{
      background: "none", border: "none", color: T.muted, cursor: "pointer",
      fontFamily: "'Sora',sans-serif", fontSize: "0.88rem",
      display: "flex", alignItems: "center", gap: "6px",
      marginBottom: "2rem", transition: "color 0.2s",
    }}>
      ← {label}
    </button>
  );
}

export function PageHeader({ badge, badgeColor = "teal", title, subtitle }) {
  const { T } = useTheme();
  const badgeStyle = badgeColor === "blue"
    ? { bg: T.isDark ? "rgba(0,145,255,0.1)" : "rgba(37,99,235,0.08)", border: T.isDark ? "rgba(0,145,255,0.25)" : "rgba(37,99,235,0.2)", text: T.blue }
    : { bg: T.isDark ? "rgba(0,212,170,0.1)" : "rgba(0,168,135,0.08)", border: T.isDark ? "rgba(0,212,170,0.25)" : "rgba(0,168,135,0.2)", text: T.teal };
  return (
    <div style={{ marginBottom: "2.5rem" }}>
      <div style={{ display: "inline-block", background: badgeStyle.bg, border: `1px solid ${badgeStyle.border}`, borderRadius: "100px", padding: "5px 14px", fontSize: "0.72rem", color: badgeStyle.text, fontWeight: 600, letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
        {badge}
      </div>
      <h1 style={{ fontSize: "2.8rem", fontWeight: 800, letterSpacing: "-0.04em", color: T.text, transition: "color 0.3s" }}>{title}</h1>
      <p style={{ color: T.muted, fontSize: "0.95rem", marginTop: "0.4rem" }}>{subtitle}</p>
    </div>
  );
}
