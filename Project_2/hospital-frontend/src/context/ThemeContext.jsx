// src/context/ThemeContext.jsx
// ─── Dark / Light mode context ────────────────────────────────────────────────
// Wrap your app in <ThemeProvider>.
// Any component can call useTheme() to get the current token set + toggle fn.

import { createContext, useContext, useState, useEffect } from "react";

// ── Dark tokens ────────────────────────────────────────────────────────────────
const DARK = {
  isDark:       true,
  bg:           "#0a0e14",
  bgSecondary:  "#0f1520",
  surface:      "rgba(255,255,255,0.03)",
  surfaceHover: "rgba(255,255,255,0.06)",
  surfaceDeep:  "rgba(255,255,255,0.02)",
  border:       "rgba(255,255,255,0.07)",
  borderHover:  "rgba(255,255,255,0.14)",
  teal:         "#00d4aa",
  blue:         "#60a5fa",
  text:         "#f1f5f9",
  textSub:      "#cbd5e1",
  muted:        "#64748b",
  dimmed:       "#475569",
  navBg:        "rgba(10,14,20,0.88)",
  inputBg:      "rgba(255,255,255,0.05)",
  selectBg:     "#0f1520",
  skeletonBg:   "rgba(255,255,255,0.03)",
  // card hover for CSS class (injected via <style>)
  cardHoverBg:  "rgba(255,255,255,0.06)",
  cardHoverShadow: "0 20px 40px rgba(0,0,0,0.45)",
  // hero gradients
  doctorHeroBg: "linear-gradient(135deg,rgba(0,212,170,0.08),rgba(0,145,255,0.06))",
  doctorHeroBorder: "1px solid rgba(0,212,170,0.2)",
  hospitalHeroBg: "linear-gradient(135deg,rgba(0,145,255,0.1),rgba(168,85,247,0.07))",
  hospitalHeroBorder: "1px solid rgba(0,145,255,0.2)",
};

// ── Light tokens ───────────────────────────────────────────────────────────────
const LIGHT = {
  isDark:       false,
  bg:           "#f0f4f8",
  bgSecondary:  "#e2e8f0",
  surface:      "#ffffff",
  surfaceHover: "#f8fafc",
  surfaceDeep:  "#f1f5f9",
  border:       "#e2e8f0",
  borderHover:  "#cbd5e1",
  teal:         "#00a887",
  blue:         "#2563eb",
  text:         "#0f172a",
  textSub:      "#334155",
  muted:        "#64748b",
  dimmed:       "#94a3b8",
  navBg:        "rgba(240,244,248,0.92)",
  inputBg:      "#ffffff",
  selectBg:     "#ffffff",
  skeletonBg:   "#e2e8f0",
  cardHoverBg:  "#f8fafc",
  cardHoverShadow: "0 12px 28px rgba(0,0,0,0.10)",
  doctorHeroBg: "linear-gradient(135deg,rgba(0,168,135,0.08),rgba(37,99,235,0.06))",
  doctorHeroBorder: "1px solid rgba(0,168,135,0.2)",
  hospitalHeroBg: "linear-gradient(135deg,rgba(37,99,235,0.08),rgba(124,58,237,0.06))",
  hospitalHeroBorder: "1px solid rgba(37,99,235,0.18)",
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Persist preference in localStorage
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem("mf-theme") !== "light"; }
    catch { return true; }
  });

  const toggle = () => setIsDark(d => {
    const next = !d;
    try { localStorage.setItem("mf-theme", next ? "dark" : "light"); } catch {}
    return next;
  });

  const T = isDark ? DARK : LIGHT;

  // Keep body background in sync
  useEffect(() => {
    document.body.style.background = T.bg;
    document.body.style.color      = T.text;
  }, [isDark, T.bg, T.text]);

  return (
    <ThemeContext.Provider value={{ T, isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Use inside any component to access { T, isDark, toggle } */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
