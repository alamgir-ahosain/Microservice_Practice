// src/styles/theme.js
// ─── Static helpers that don't depend on dark/light mode ─────────────────────
// Colour tokens are now in ThemeContext — use useTheme() to get T.

export const TYPE_COLORS = {
  GENERAL:     { bg: "rgba(0,145,255,0.12)",   border: "rgba(0,145,255,0.25)",   text: "#60a5fa" },
  SPECIALIZED: { bg: "rgba(168,85,247,0.12)",  border: "rgba(168,85,247,0.25)",  text: "#c084fc" },
  CLINIC:      { bg: "rgba(0,212,170,0.12)",   border: "rgba(0,212,170,0.25)",   text: "#00d4aa" },
  DIAGNOSTIC:  { bg: "rgba(251,146,60,0.12)",  border: "rgba(251,146,60,0.25)",  text: "#fb923c" },
};

export const SPECIALTY_ICONS = {
  Cardiology:    "❤️",
  Neurology:     "🧠",
  Orthopedics:   "🦴",
  Pediatrics:    "👶",
  Dermatology:   "🔬",
  Ophthalmology: "👁️",
  Oncology:      "🎗️",
};

export function typeStyle(t) {
  return TYPE_COLORS[(t || "").toUpperCase()] || {
    bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.1)", text: "#94a3b8",
  };
}

export function getDocIcon(specialties = []) {
  for (const s of specialties) {
    for (const [key, icon] of Object.entries(SPECIALTY_ICONS)) {
      if (s.toLowerCase().includes(key.toLowerCase())) return icon;
    }
  }
  return "🩺";
}
