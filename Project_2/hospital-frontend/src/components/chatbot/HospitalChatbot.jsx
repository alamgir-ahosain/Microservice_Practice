import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useChatbot } from "../../context/ChatbotContext";

const CHAT_SERVICE_URL = "http://localhost:8085";

// Stable guest ID per browser session
const getGuestId = () => {
  let id = sessionStorage.getItem("mf_guest_id");
  if (!id) {
    id = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem("mf_guest_id", id);
  }
  return id;
};

const SUGGESTIONS = [
  "Find low cost hospitals",
  "Which hospitals have blood tests?",
  "Show me public hospitals",
  "Find cardiologists near me",
  "Hospitals with ICU beds",
  "Heart test options",
];

export default function HospitalChatbot() {
  const { T, isDark } = useTheme();
  const { isOpen, toggle, close } = useChatbot();

  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [unread, setUnread]       = useState(0);
  const [userId]                  = useState(getGuestId);

  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);
  const prevOpen    = useRef(false);

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // ── Clear unread on open ───────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && !prevOpen.current) setUnread(0);
    prevOpen.current = isOpen;
  }, [isOpen]);

  // ── Auto-resize textarea ──────────────────────────────────────────────────
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
  }, [input]);

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg = { role: "user", content: msg, id: `u_${Date.now()}`, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`${CHAT_SERVICE_URL}/chat/v1/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          message: msg,
          role: "user",
          createdAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const botMsg = { role: "assistant", content: data.content, id: data.id, createdAt: data.createdAt };
      setMessages(prev => [...prev, botMsg]);
      if (!isOpen) setUnread(n => n + 1);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "⚠️ Service unavailable. Please ensure the chat service is running on port 8085.", id: `err_${Date.now()}`, createdAt: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, userId, isOpen]);

  // ── Clear session ─────────────────────────────────────────────────────────
  const clearChat = async () => {
    try {
      await fetch(`${CHAT_SERVICE_URL}/chat/v1/session/${userId}`, { method: "DELETE" });
    } catch (_) { /* ignore */ }
    setMessages([]);
    setUnread(0);
  };

  // ── Key handler ──────────────────────────────────────────────────────────
  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Markdown-lite renderer ────────────────────────────────────────────────
  const renderContent = (text) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**"))
        return <p key={i} style={{ fontWeight: 700, margin: "4px 0" }}>{line.slice(2, -2)}</p>;
      if (line.startsWith("- ") || line.startsWith("• "))
        return (
          <div key={i} style={{ display: "flex", gap: 6, margin: "2px 0" }}>
            <span style={{ color: T.teal, flexShrink: 0 }}>•</span>
            <span dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
          </div>
        );
      if (line.trim() === "") return <br key={i} />;
      return <p key={i} style={{ margin: "2px 0" }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />;
    });
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const S = {
    fab: {
      position: "fixed", bottom: 28, right: 28, zIndex: 9998,
      width: 56, height: 56, borderRadius: "50%",
      background: `linear-gradient(135deg, ${T.teal}, ${T.blue})`,
      border: "none", cursor: "pointer", boxShadow: `0 4px 20px ${T.teal}55`,
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "transform 0.2s, box-shadow 0.2s",
      fontSize: 24,
    },
    badge: {
      position: "absolute", top: -4, right: -4,
      background: "#ef4444", color: "#fff",
      borderRadius: "50%", width: 20, height: 20,
      fontSize: 11, fontWeight: 700,
      display: "flex", alignItems: "center", justifyContent: "center",
    },
    window: {
      position: "fixed", bottom: 96, right: 28, zIndex: 9999,
      width: 380, maxWidth: "calc(100vw - 56px)",
      height: 560, maxHeight: "calc(100vh - 120px)",
      background: isDark ? "#0f1520" : "#ffffff",
      border: `1px solid ${T.border}`,
      borderRadius: 20, overflow: "hidden",
      display: "flex", flexDirection: "column",
      boxShadow: `0 24px 60px rgba(0,0,0,${isDark ? 0.5 : 0.15})`,
      animation: "chatSlideIn 0.25s ease",
    },
    header: {
      padding: "14px 18px",
      background: `linear-gradient(135deg, ${T.teal}22, ${T.blue}22)`,
      borderBottom: `1px solid ${T.border}`,
      display: "flex", alignItems: "center", gap: 10,
    },
    avatar: {
      width: 36, height: 36, borderRadius: "50%",
      background: `linear-gradient(135deg, ${T.teal}, ${T.blue})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 18, flexShrink: 0,
    },
    msgs: {
      flex: 1, overflowY: "auto", padding: "14px 14px 8px",
      display: "flex", flexDirection: "column", gap: 10,
    },
    bubble: (role) => ({
      maxWidth: "85%", padding: "10px 13px",
      borderRadius: role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
      background: role === "user"
        ? `linear-gradient(135deg, ${T.teal}, ${T.blue})`
        : isDark ? "#1a2236" : "#f0f4f8",
      color: role === "user" ? "#fff" : T.text,
      alignSelf: role === "user" ? "flex-end" : "flex-start",
      fontSize: 13.5, lineHeight: 1.55,
      boxShadow: `0 2px 8px rgba(0,0,0,${isDark ? 0.25 : 0.08})`,
    }),
    time: {
      fontSize: 10, opacity: 0.5, marginTop: 3,
      textAlign: "right", color: T.muted,
    },
    suggestions: {
      padding: "0 14px 10px",
      display: "flex", flexWrap: "wrap", gap: 6,
    },
    chip: {
      padding: "5px 11px", borderRadius: 20,
      background: "transparent",
      border: `1px solid ${T.teal}66`,
      color: T.teal, fontSize: 12, cursor: "pointer",
      transition: "all 0.15s",
    },
    inputRow: {
      padding: "10px 12px",
      borderTop: `1px solid ${T.border}`,
      display: "flex", gap: 8, alignItems: "flex-end",
      background: isDark ? "#0d1422" : "#f8fafc",
    },
    textarea: {
      flex: 1, resize: "none", minHeight: 38, maxHeight: 120,
      background: isDark ? "#1a2236" : "#fff",
      border: `1px solid ${T.border}`,
      borderRadius: 12, padding: "9px 12px",
      color: T.text, fontSize: 13.5, outline: "none",
      fontFamily: "inherit", lineHeight: 1.5,
    },
    sendBtn: {
      width: 38, height: 38, borderRadius: "50%",
      background: loading || !input.trim()
        ? (isDark ? "#1e2d45" : "#e2e8f0")
        : `linear-gradient(135deg, ${T.teal}, ${T.blue})`,
      border: "none", cursor: loading || !input.trim() ? "not-allowed" : "pointer",
      color: "#fff", fontSize: 16, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "all 0.2s",
    },
    dot: { width: 7, height: 7, borderRadius: "50%", background: T.teal, animation: "dotBounce 1.2s infinite" },
  };

  const fmtTime = (iso) => {
    try { return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
    catch { return ""; }
  };

  return (
    <>
      <style>{`
        @keyframes chatSlideIn { from { opacity:0; transform:translateY(16px) scale(0.97); } to { opacity:1; transform:none; } }
        @keyframes dotBounce   { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        .mf-chip:hover { background: ${T.teal}22 !important; transform: scale(1.04); }
        .mf-fab:hover  { transform: scale(1.08); box-shadow: 0 6px 28px ${T.teal}88 !important; }
        .mf-send:hover:not(:disabled) { transform: scale(1.06); }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }
      `}</style>

      {/* FAB */}
      <button style={S.fab} className="mf-fab" onClick={toggle} title="Chat with MediBot">
        {isOpen ? "✕" : "💬"}
        {!isOpen && unread > 0 && <span style={S.badge}>{unread}</span>}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={S.window}>

          {/* Header */}
          <div style={S.header}>
            <div style={S.avatar}>🏥</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>MediBot</div>
              <div style={{ fontSize: 11, color: T.teal }}>● AI Health Assistant</div>
            </div>
            <button
              onClick={clearChat}
              title="Clear chat"
              style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: 15, padding: 4 }}
            >🗑</button>
            <button
              onClick={close}
              style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: 18, padding: 4 }}
            >✕</button>
          </div>

          {/* Messages */}
          <div style={S.msgs}>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", color: T.muted, fontSize: 13, padding: "20px 0" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🏥</div>
                <div style={{ fontWeight: 600, color: T.text, marginBottom: 4 }}>Hello! I'm MediBot</div>
                <div>Ask me about hospitals, doctors, tests, costs, or reviews.</div>
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={S.bubble(m.role)}>
                  {m.role === "assistant" ? renderContent(m.content) : <p style={{ margin: 0 }}>{m.content}</p>}
                </div>
                <div style={S.time}>{fmtTime(m.createdAt)}</div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", gap: 5, padding: "8px 12px", alignSelf: "flex-start", background: isDark ? "#1a2236" : "#f0f4f8", borderRadius: "16px 16px 16px 4px" }}>
                {[0, 0.2, 0.4].map((d, i) => (
                  <div key={i} style={{ ...S.dot, animationDelay: `${d}s` }} />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestion chips */}
          {messages.length === 0 && (
            <div style={S.suggestions}>
              {SUGGESTIONS.map((s) => (
                <button key={s} className="mf-chip" style={S.chip} onClick={() => sendMessage(s)}>{s}</button>
              ))}
            </div>
          )}

          {/* Input Row */}
          <div style={S.inputRow}>
            <textarea
              ref={textareaRef}
              style={S.textarea}
              placeholder="Ask about hospitals, tests, doctors…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
            />
            <button
              className="mf-send"
              style={S.sendBtn}
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              title="Send"
            >➤</button>
          </div>
        </div>
      )}
    </>
  );
}
