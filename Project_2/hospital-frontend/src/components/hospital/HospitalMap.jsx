// src/components/hospital/HospitalMap.jsx
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";

function loadLeaflet() {
  return new Promise((resolve) => {
    if (window.L) return resolve(window.L);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload = () => resolve(window.L);
    document.head.appendChild(script);
  });
}

const OSRM_PROFILES = { driving: "car", walking: "foot", cycling: "bike" };

async function fetchRoute(fromLat, fromLng, toLat, toLng, mode = "driving") {
  const profile = OSRM_PROFILES[mode] || "car";
  const url = `https://router.project-osrm.org/route/v1/${profile}/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson&steps=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Routing service unavailable");
  const data = await res.json();
  if (data.code !== "Ok") throw new Error("No route found");
  return data.routes[0];
}

function fmt(metres) { return metres >= 1000 ? `${(metres/1000).toFixed(1)} km` : `${Math.round(metres)} m`; }
function fmtT(s) { const h=Math.floor(s/3600), m=Math.floor((s%3600)/60); return h>0?`${h}h ${m}min`:`${m} min`; }

export default function HospitalMap({ latitude, longitude, name, address }) {
  const { T, isDark } = useTheme();
  const mapContainerRef = useRef(null);
  const mapRef      = useRef(null);
  const markerRef   = useRef(null);
  const userMkrRef  = useRef(null);
  const routeRef    = useRef(null);
  const tileRef     = useRef(null);

  const [mode,      setMode]      = useState("driving");
  const [routing,   setRouting]   = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeErr,  setRouteErr]  = useState(null);
  const [userPos,   setUserPos]   = useState(null);

  // ── Init map ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!latitude || !longitude) return;
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled || mapRef.current) return;
      const map = L.map(mapContainerRef.current, { center: [latitude, longitude], zoom: 15 });

      // Pick tile based on current theme
      const tileUrl = isDark
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

      tileRef.current = L.tileLayer(tileUrl, {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd", maxZoom: 19,
      }).addTo(map);

      const icon = L.divIcon({
        className: "",
        html: `<div style="width:42px;height:42px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:linear-gradient(135deg,#00d4aa,#0091ff);box-shadow:0 4px 20px rgba(0,212,170,0.5);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:18px;">🏥</span></div>`,
        iconSize: [42, 42], iconAnchor: [21, 42], popupAnchor: [0, -44],
      });

      markerRef.current = L.marker([latitude, longitude], { icon }).addTo(map)
        .bindPopup(`<div style="font-family:'Sora',sans-serif;min-width:160px;"><div style="font-weight:700;font-size:0.95rem;margin-bottom:4px;">${name}</div>${address ? `<div style="font-size:0.8rem;color:#64748b;">📍 ${address}</div>` : ""}<div style="font-size:0.78rem;color:#00d4aa;margin-top:6px;">Lat: ${latitude}, Lng: ${longitude}</div></div>`, { maxWidth: 260 });

      markerRef.current.openPopup();
      mapRef.current = map;
    });
    return () => { cancelled = true; if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  // ── Swap tile layer when theme changes ────────────────────────────────────
  useEffect(() => {
    const L = window.L;
    if (!L || !mapRef.current) return;
    if (tileRef.current) { mapRef.current.removeLayer(tileRef.current); }
    const url = isDark
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
    tileRef.current = L.tileLayer(url, { attribution: '© OpenStreetMap contributors © CARTO', subdomains: "abcd", maxZoom: 19 }).addTo(mapRef.current);
  }, [isDark]);

  // ── Re-draw when mode changes ─────────────────────────────────────────────
  useEffect(() => {
    if (userPos) drawRoute(userPos.lat, userPos.lng, mode);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  async function drawRoute(fromLat, fromLng, travelMode) {
    const L = window.L;
    if (!L || !mapRef.current) return;
    setRouting(true); setRouteErr(null);
    try {
      const route = await fetchRoute(fromLat, fromLng, latitude, longitude, travelMode);
      if (routeRef.current) mapRef.current.removeLayer(routeRef.current);
      const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      routeRef.current = L.polyline(coords, { color: T.teal, weight: 5, opacity: 0.85, lineJoin: "round" }).addTo(mapRef.current);
      mapRef.current.fitBounds(routeRef.current.getBounds(), { padding: [48, 48] });
      const steps = route.legs.flatMap(leg => leg.steps.map(s => ({
        instruction: s.maneuver?.instruction || s.name || "Continue",
        distance: fmt(s.distance), duration: fmtT(s.duration),
      })));
      setRouteInfo({ distance: fmt(route.distance), duration: fmtT(route.duration), steps });
    } catch (err) { setRouteErr(err.message); }
    finally { setRouting(false); }
  }

  function handleGetDirections() {
    const L = window.L;
    if (!L || !mapRef.current) return;
    if (!navigator.geolocation) { setRouteErr("Geolocation not supported."); return; }
    setRouting(true); setRouteErr(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: uLat, longitude: uLng } = pos.coords;
        setUserPos({ lat: uLat, lng: uLng });
        const uIcon = L.divIcon({ className: "", html: `<div style="width:16px;height:16px;border-radius:50%;background:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,0.3);"></div>`, iconSize: [16,16], iconAnchor: [8,8] });
        if (userMkrRef.current) { userMkrRef.current.setLatLng([uLat, uLng]); }
        else { userMkrRef.current = L.marker([uLat, uLng], { icon: uIcon }).addTo(mapRef.current).bindPopup("<b>You are here</b>"); }
        drawRoute(uLat, uLng, mode);
      },
      () => { setRouting(false); setRouteErr("Location access denied."); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handleClear() {
    if (routeRef.current && mapRef.current) { mapRef.current.removeLayer(routeRef.current); routeRef.current = null; }
    if (userMkrRef.current && mapRef.current) { mapRef.current.removeLayer(userMkrRef.current); userMkrRef.current = null; }
    setRouteInfo(null); setRouteErr(null); setUserPos(null);
    if (mapRef.current) mapRef.current.flyTo([latitude, longitude], 15, { duration: 1.2 });
  }

  if (!latitude || !longitude) return null;

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "16px", overflow: "hidden", marginBottom: "1.25rem", transition: "background 0.3s" }}>
      {/* Header */}
      <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>🗺️ Location & Navigation</h3>
          <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: T.dimmed }}>OpenStreetMap · Real-time routing via OSRM</p>
        </div>
        {!routeInfo ? (
          <button onClick={handleGetDirections} disabled={routing} style={{
            display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "10px",
            background: routing ? (isDark ? "rgba(0,212,170,0.08)" : "rgba(0,168,135,0.08)") : "linear-gradient(135deg,#00d4aa,#0091ff)",
            border: "none", color: routing ? T.teal : "#000",
            fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: "0.88rem",
            cursor: routing ? "not-allowed" : "pointer", transition: "all 0.2s",
            boxShadow: routing ? "none" : "0 4px 20px rgba(0,212,170,0.25)",
          }}>
            {routing ? <><span style={{ animation: "spin 1s linear infinite", display:"inline-block" }}>⟳</span> Getting route…</> : <><span>🧭</span> Get Directions</>}
          </button>
        ) : (
          <button onClick={handleClear} style={{ padding: "10px 20px", borderRadius: "10px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171", fontFamily: "'Sora',sans-serif", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>
            ✕ Clear Route
          </button>
        )}
      </div>

      {/* Mode selector */}
      {(routeInfo || routing) && (
        <div style={{ padding: "0.75rem 1.5rem", borderBottom: `1px solid ${T.border}`, display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "0.78rem", color: T.dimmed, marginRight: "4px" }}>Mode:</span>
          {[{ m: "driving", icon: "🚗", label: "Drive" }, { m: "walking", icon: "🚶", label: "Walk" }, { m: "cycling", icon: "🚲", label: "Cycle" }].map(({ m, icon, label }) => (
            <button key={m} onClick={() => setMode(m)} style={{
              display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px",
              background: mode === m ? (isDark ? "rgba(0,212,170,0.15)" : "rgba(0,168,135,0.1)") : T.surfaceDeep,
              border: mode === m ? `1px solid ${T.teal}66` : `1px solid ${T.border}`,
              color: mode === m ? T.teal : T.muted,
              fontFamily: "'Sora',sans-serif", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
            }}><span>{icon}</span>{label}</button>
          ))}
        </div>
      )}

      {/* Map */}
      <div ref={mapContainerRef} style={{ height: "420px", width: "100%" }} />

      {/* Error */}
      {routeErr && (
        <div style={{ margin: "1rem 1.5rem", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "10px", padding: "10px 14px", color: "#f87171", fontSize: "0.84rem" }}>
          ⚠️ {routeErr}
        </div>
      )}

      {/* Route summary */}
      {routeInfo && !routing && (
        <div style={{ padding: "1.25rem 1.5rem" }}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "1.25rem", flexWrap: "wrap" }}>
            {[{ icon: "📏", label: "Distance", value: routeInfo.distance }, { icon: "⏱️", label: "ETA", value: routeInfo.duration }].map(({ icon, label, value }) => (
              <div key={label} style={{ flex: 1, minWidth: "120px", background: isDark ? "rgba(0,212,170,0.06)" : "rgba(0,168,135,0.06)", border: `1px solid ${T.teal}22`, borderRadius: "12px", padding: "12px 16px" }}>
                <div style={{ fontSize: "0.72rem", color: T.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{icon} {label}</div>
                <div style={{ fontSize: "1.3rem", fontWeight: 800, color: T.teal, letterSpacing: "-0.02em" }}>{value}</div>
              </div>
            ))}
          </div>
          {routeInfo.steps?.length > 0 && (
            <details style={{ cursor: "pointer" }}>
              <summary style={{ fontSize: "0.82rem", fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", listStyle: "none", display: "flex", alignItems: "center", gap: "6px", paddingBottom: "10px", borderBottom: `1px solid ${T.border}`, marginBottom: "10px" }}>
                🗺 Turn-by-turn directions
                <span style={{ background: T.surfaceDeep, borderRadius: "100px", padding: "1px 8px", fontSize: "0.72rem", color: T.dimmed }}>{routeInfo.steps.length} steps</span>
              </summary>
              <div style={{ maxHeight: "280px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                {routeInfo.steps.map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "8px 10px", borderRadius: "8px", background: T.surfaceDeep, border: `1px solid ${T.border}` }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: i === 0 ? `${T.teal}22` : i === routeInfo.steps.length-1 ? `${T.blue}22` : T.surface, border: `1px solid ${i === 0 ? T.teal+"44" : i === routeInfo.steps.length-1 ? T.blue+"44" : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: T.muted, fontWeight: 700 }}>
                      {i+1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.83rem", color: T.text, lineHeight: 1.4 }}>{step.instruction}</div>
                      <div style={{ fontSize: "0.74rem", color: T.dimmed, marginTop: "2px" }}>{step.distance} · {step.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
