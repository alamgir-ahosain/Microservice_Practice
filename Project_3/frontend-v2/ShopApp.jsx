import { useState, useEffect, useCallback, createContext, useContext } from "react";

const API = "http://localhost:8080";

// ─── Auth Context ────────────────────────────────────────────────────────────
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("shop_user")); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("shop_token") || null);

  const login = (userData, jwt) => {
    setUser(userData); setToken(jwt);
    localStorage.setItem("shop_user", JSON.stringify(userData));
    localStorage.setItem("shop_token", jwt);
  };
  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem("shop_user"); localStorage.removeItem("shop_token");
  };

  return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>;
}

// ─── Cart Context ─────────────────────────────────────────────────────────────
const CartContext = createContext(null);
const useCart = () => useContext(CartContext);

function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const add = (product) => setItems(prev => {
    const ex = prev.find(i => i.id === product.id);
    if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
    return [...prev, { ...product, qty: 1 }];
  });
  const remove = (id) => setItems(prev => prev.filter(i => i.id !== id));
  const updateQty = (id, qty) => {
    if (qty < 1) { remove(id); return; }
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };
  const clear = () => setItems([]);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);
  return <CartContext.Provider value={{ items, add, remove, updateQty, clear, total, count }}>{children}</CartContext.Provider>;
}



// ─── Toast ────────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);
const useToast = () => useContext(ToastContext);

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: 8, zIndex: 9999 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding: "12px 18px", borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans', sans-serif",
            background: t.type === "error" ? "#fee2e2" : t.type === "warn" ? "#fef3c7" : "#d1fae5",
            color: t.type === "error" ? "#991b1b" : t.type === "warn" ? "#92400e" : "#065f46",
            border: `1.5px solid ${t.type === "error" ? "#fca5a5" : t.type === "warn" ? "#fcd34d" : "#6ee7b7"}`,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            animation: "slideIn 0.25s ease"
          }}>{t.msg}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── API Helpers ──────────────────────────────────────────────────────────────
async function apiFetch(path, opts = {}, token = null) {
  const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts.headers };
  const res = await fetch(`${API}${path}`, { ...opts, headers });
  if (!res.ok) {
    let err; try { err = await res.json(); } catch { err = { message: res.statusText }; }
    throw new Error(err.message || "Request failed");
  }
  if (res.status === 204) return null;
  return res.json();
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const G = {
  accent: "#0f4c3a",
  accentLight: "#e6f4f0",
  accentMid: "#1a7a5e",
  accentHover: "#0a3328",
  text: "#141414",
  muted: "#6b7280",
  border: "#e5e7eb",
  bg: "#f8f7f4",
  white: "#ffffff",
  danger: "#dc2626",
  dangerLight: "#fee2e2",
  gold: "#d97706",
  goldLight: "#fef3c7",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${G.bg}; font-family: 'DM Sans', sans-serif; color: ${G.text}; }
  @keyframes slideIn { from { opacity:0; transform: translateX(20px); } to { opacity:1; transform:translateX(0); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  .fade-up { animation: fadeUp 0.35s ease both; }
  input, textarea { outline: none; border: 1.5px solid ${G.border}; border-radius: 10px; padding: 10px 14px; font-family: 'DM Sans', sans-serif; font-size: 14px; width: 100%; transition: border-color 0.2s; background: ${G.white}; color: ${G.text}; }
  input:focus, textarea:focus { border-color: ${G.accentMid}; }
  button { cursor: pointer; font-family: 'DM Sans', sans-serif; border: none; }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${G.border}; border-radius: 3px; }
`;

// ─── Components ───────────────────────────────────────────────────────────────
function Spinner() {
  return <div style={{ width: 22, height: 22, border: `3px solid ${G.border}`, borderTop: `3px solid ${G.accentMid}`, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />;
}

function Btn({ children, onClick, variant = "primary", size = "md", loading, style: sx = {}, disabled }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
    borderRadius: 10, fontWeight: 500, transition: "all 0.18s", cursor: disabled || loading ? "not-allowed" : "pointer",
    fontSize: size === "sm" ? 13 : 14, padding: size === "sm" ? "7px 14px" : "11px 22px",
    opacity: disabled || loading ? 0.6 : 1, ...sx,
  };
  const v = {
    primary: { background: G.accent, color: G.white },
    outline: { background: "transparent", color: G.accent, border: `1.5px solid ${G.accent}` },
    ghost: { background: "transparent", color: G.muted, border: `1.5px solid ${G.border}` },
    danger: { background: G.danger, color: G.white },
  };
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{ ...base, ...v[variant] }}>
      {loading ? <Spinner /> : children}
    </button>
  );
}

function Badge({ children, color = "green" }) {
  const colors = { green: [G.accentLight, G.accentMid], gold: [G.goldLight, G.gold], red: [G.dangerLight, G.danger] };
  const [bg, fg] = colors[color] || colors.green;
  return <span style={{ background: bg, color: fg, fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, letterSpacing: 0.4 }}>{children}</span>;
}

function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} className="fade-up" style={{ background: G.white, borderRadius: 18, padding: "28px 28px 24px", width: "100%", maxWidth: width, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, fontWeight: 400 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", fontSize: 20, color: G.muted, lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ page, setPage }) {
  const { user, logout } = useAuth();
  const { count } = useCart();
  return (
    <nav style={{ background: G.white, borderBottom: `1px solid ${G.border}`, padding: "0 32px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 28, height: 28, background: G.accent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3h10M3 3V2a1 1 0 012 0v1M9 3V2a1 1 0 012 0v1M2 3l1 9h8l1-9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, letterSpacing: -0.3 }}>Shopify</span>
      </div>

      <div style={{ display: "flex", gap: 4 }}>
        <NavBtn active={page === "products"} onClick={() => setPage("products")}>Products</NavBtn>
        {user && <NavBtn active={page === "orders"} onClick={() => setPage("orders")}>My Orders</NavBtn>}
        {user?.role === "ADMIN" && <NavBtn active={page === "admin"} onClick={() => setPage("admin")}>Admin</NavBtn>}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {user && (
          <button onClick={() => setPage("cart")} style={{ background: page === "cart" ? G.accentLight : "transparent", border: `1.5px solid ${page === "cart" ? G.accentMid : G.border}`, borderRadius: 10, padding: "7px 14px", display: "flex", alignItems: "center", gap: 7, fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: page === "cart" ? G.accentMid : G.text, transition: "all 0.2s" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 1h2l2.5 7.5h7l1.5-5H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="7" cy="13.5" r="1" fill="currentColor" /><circle cx="12" cy="13.5" r="1" fill="currentColor" /></svg>
            Cart {count > 0 && <span style={{ background: G.accent, color: G.white, borderRadius: 12, fontSize: 11, padding: "1px 7px", fontWeight: 600 }}>{count}</span>}
          </button>
        )}
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: G.accentLight, color: G.accentMid, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600 }}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            <Btn variant="ghost" size="sm" onClick={logout}>Logout</Btn>
          </div>
        ) : (
          <Btn size="sm" onClick={() => setPage("auth")}>Sign in</Btn>
        )}
      </div>
    </nav>
  );
}

function NavBtn({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{ background: active ? G.accentLight : "transparent", color: active ? G.accentMid : G.muted, border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 14, fontWeight: active ? 500 : 400, fontFamily: "'DM Sans', sans-serif", transition: "all 0.18s", cursor: "pointer" }}>
      {children}
    </button>
  );
}

// ─── Auth Page ────────────────────────────────────────────────────────────────
function AuthPage({ onSuccess }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const toast = useToast();

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      const endpoint = mode === "login" ? "/public/login" : "/public/register";
      const body = mode === "login" ? { email: form.email, password: form.password } : form;
      const data = await apiFetch(endpoint, { method: "POST", body: JSON.stringify(body) });
      login({ userId: data.userId, name: data.name, email: data.email, role: data.role }, data.accessToken);
      toast(`Welcome${data.name ? ", " + data.name : ""}!`);
      onSuccess();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fade-up" style={{ minHeight: "calc(100vh - 62px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 36, fontWeight: 400, marginBottom: 8 }}>
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p style={{ color: G.muted, fontSize: 15 }}>{mode === "login" ? "Sign in to continue shopping" : "Join us and start shopping"}</p>
        </div>

        <div style={{ background: G.white, borderRadius: 18, padding: 32, border: `1px solid ${G.border}` }}>
          <div style={{ display: "flex", background: G.bg, borderRadius: 10, padding: 4, marginBottom: 24 }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} style={{ flex: 1, padding: "8px", borderRadius: 8, background: mode === m ? G.white : "transparent", border: mode === m ? `1px solid ${G.border}` : "none", fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: mode === m ? 500 : 400, color: mode === m ? G.text : G.muted, transition: "all 0.18s", cursor: "pointer" }}>
                {m === "login" ? "Sign in" : "Register"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "register" && <Field label="Name" value={form.name} onChange={set("name")} placeholder="Your full name" />}
            <Field label="Email" value={form.email} onChange={set("email")} placeholder="you@example.com" type="email" />
            <Field label="Password" value={form.password} onChange={set("password")} placeholder="••••••••" type="password" />
          </div>

          {error && <p style={{ color: G.danger, fontSize: 13, marginTop: 12, background: G.dangerLight, padding: "8px 12px", borderRadius: 8 }}>{error}</p>}

          <Btn onClick={submit} loading={loading} style={{ width: "100%", marginTop: 20 }}>
            {mode === "login" ? "Sign in" : "Create account"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 500, color: G.muted, display: "block", marginBottom: 6 }}>{label}</label>
      <input value={value} onChange={onChange} placeholder={placeholder} type={type} />
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ p, onView }) {
  const { add } = useCart();
  const { user } = useAuth();
  const toast = useToast();

  return (
    <div className="fade-up" style={{ background: G.white, borderRadius: 16, border: `1px solid ${G.border}`, overflow: "hidden", display: "flex", flexDirection: "column", transition: "box-shadow 0.2s", cursor: "pointer" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.09)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
      <div onClick={() => onView(p)} style={{ aspectRatio: "4/3", background: "#f3f4f6", overflow: "hidden", position: "relative" }}>
        {p.imageUrl
          ? <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>📦</div>}
        <div style={{ position: "absolute", top: 10, right: 10 }}>
          <Badge color={p.stockQuantity > 10 ? "green" : p.stockQuantity > 0 ? "gold" : "red"}>
            {p.stockQuantity > 0 ? `${p.stockQuantity} left` : "Out of stock"}
          </Badge>
        </div>
      </div>
      <div style={{ padding: "16px 16px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 11, color: G.muted, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 500 }}>{p.category}</span>
        <h3 onClick={() => onView(p)} style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, fontWeight: 400, margin: "4px 0 6px", lineHeight: 1.3 }}>{p.name}</h3>
        <p style={{ fontSize: 13, color: G.muted, flex: 1, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.description}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
          <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: -0.5 }}>${p.price?.toFixed(2)}</span>
          {user && p.stockQuantity > 0 && (
            <Btn size="sm" onClick={() => { add(p); toast(`${p.name} added to cart`); }}>+ Add</Btn>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Products Page ────────────────────────────────────────────────────────────
function ProductsPage({ setPage }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [viewed, setViewed] = useState(null);
  const { token } = useAuth();
  const { add } = useCart();
  const toast = useToast();

  useEffect(() => {
    apiFetch("/api/products", {}, token).then(setProducts).catch(() => { }).finally(() => setLoading(false));
  }, []);

  const cats = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];
  const filtered = products.filter(p =>
    (cat === "All" || p.category === cat) &&
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 42, fontWeight: 400, marginBottom: 6 }}>Shop</h1>
        <p style={{ color: G.muted }}>Discover our curated collection</p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: G.muted }} width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" /><path d="M11 11l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" style={{ paddingLeft: 36 }} />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {cats.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{ padding: "7px 14px", borderRadius: 20, fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, background: cat === c ? G.accent : G.white, color: cat === c ? G.white : G.muted, border: `1.5px solid ${cat === c ? G.accent : G.border}`, cursor: "pointer", transition: "all 0.18s" }}>{c}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: G.muted }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <p>No products found</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
          {filtered.map(p => <ProductCard key={p.id} p={p} onView={setViewed} />)}
        </div>
      )}

      <Modal open={!!viewed} onClose={() => setViewed(null)} title={viewed?.name} width={520}>
        {viewed && <ProductDetail p={viewed} onClose={() => setViewed(null)} setPage={setPage} />}
      </Modal>
    </div>
  );
}

function ProductDetail({ p, onClose, setPage }) {
  const { add } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const [qty, setQty] = useState(1);
  return (
    <div>
      <div style={{ aspectRatio: "16/9", background: "#f3f4f6", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
        {p.imageUrl
          ? <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60 }}>📦</div>}
      </div>
      <Badge>{p.category}</Badge>
      <p style={{ marginTop: 12, color: G.muted, lineHeight: 1.7 }}>{p.description}</p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
        <span style={{ fontSize: 28, fontWeight: 600 }}>${p.price?.toFixed(2)}</span>
        <Badge color={p.stockQuantity > 0 ? "green" : "red"}>{p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : "Out of stock"}</Badge>
      </div>
      {user && p.stockQuantity > 0 && (
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, border: `1.5px solid ${G.border}`, borderRadius: 10, padding: "0 8px" }}>
            <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ background: "none", fontSize: 18, color: G.muted, padding: "4px 6px", cursor: "pointer" }}>−</button>
            <span style={{ minWidth: 24, textAlign: "center", fontSize: 14, fontWeight: 500 }}>{qty}</span>
            <button onClick={() => setQty(q => Math.min(p.stockQuantity, q + 1))} style={{ background: "none", fontSize: 18, color: G.muted, padding: "4px 6px", cursor: "pointer" }}>+</button>
          </div>
          <Btn style={{ flex: 1 }} onClick={() => { for (let i = 0; i < qty; i++) add(p); toast(`${qty}× ${p.name} added`); onClose(); setPage("cart"); }}>
            Add to cart
          </Btn>
        </div>
      )}
      {!user && <Btn style={{ width: "100%", marginTop: 20 }} onClick={() => { onClose(); setPage("auth"); }}>Sign in to shop</Btn>}
    </div>
  );
}

// ─── Cart Page ────────────────────────────────────────────────────────────────
function CartPage({ setPage }) {
  const { items, remove, updateQty, total, clear } = useCart();
  const { token, user } = useAuth();
  const toast = useToast();
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);

  const placeOrder = async () => {
    if (!address.trim()) { toast("Please enter a delivery address", "warn"); return; }
    setPlacing(true);
    try {
      const payload = {
        shippingAddress: address,
        items: items.map(i => ({ productId: i.id, quantity: i.qty })),
      };


      await apiFetch(
        "/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-User-Id": user.id,
            "X-User-Email": user.email
          },
          body: JSON.stringify(payload)
        },
        token
      );

      
      clear(); setShowCheckout(false); setPage("orders");
      toast("Order placed successfully!");
    } catch (e) { toast(e.message, "error"); }
    finally { setPlacing(false); }
  };



  if (items.length === 0) return (
    <div className="fade-up" style={{ minHeight: "calc(100vh - 62px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div style={{ fontSize: 56 }}>🛒</div>
      <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400 }}>Your cart is empty</h2>
      <p style={{ color: G.muted }}>Add some products to get started</p>
      <Btn onClick={() => setPage("products")}>Browse products</Btn>
    </div>
  );

  return (
    <div className="fade-up" style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 36, fontWeight: 400, marginBottom: 24 }}>Cart</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {items.map(i => (
          <div key={i.id} style={{ background: G.white, borderRadius: 14, padding: "16px 18px", border: `1px solid ${G.border}`, display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: 10, background: "#f3f4f6", overflow: "hidden", flexShrink: 0 }}>
              {i.imageUrl ? <img src={i.imageUrl} alt={i.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>📦</div>}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 500, marginBottom: 2 }}>{i.name}</p>
              <p style={{ fontSize: 13, color: G.muted }}>${i.price?.toFixed(2)} each</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => updateQty(i.id, i.qty - 1)} style={{ width: 28, height: 28, borderRadius: 8, border: `1.5px solid ${G.border}`, background: "transparent", fontSize: 16, cursor: "pointer", color: G.muted }}>−</button>
              <span style={{ minWidth: 20, textAlign: "center", fontWeight: 500 }}>{i.qty}</span>
              <button onClick={() => updateQty(i.id, i.qty + 1)} style={{ width: 28, height: 28, borderRadius: 8, border: `1.5px solid ${G.border}`, background: "transparent", fontSize: 16, cursor: "pointer", color: G.muted }}>+</button>
            </div>
            <span style={{ fontWeight: 600, minWidth: 64, textAlign: "right" }}>${(i.price * i.qty).toFixed(2)}</span>
            <button onClick={() => remove(i.id)} style={{ background: "none", color: G.muted, fontSize: 18, cursor: "pointer", padding: "0 4px" }}>×</button>
          </div>
        ))}
      </div>

      <div style={{ background: G.white, borderRadius: 14, padding: "20px 18px", border: `1px solid ${G.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ color: G.muted }}>Total</span>
          <span style={{ fontSize: 22, fontWeight: 600 }}>${total.toFixed(2)}</span>
        </div>
        {showCheckout ? (
          <div>
            <Field label="Delivery address" value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St, City, Country" />
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <Btn variant="ghost" onClick={() => setShowCheckout(false)} style={{ flex: 1 }}>Back</Btn>
              <Btn onClick={placeOrder} loading={placing} style={{ flex: 2 }}>Confirm order</Btn>
            </div>
          </div>
        ) : (
          <Btn onClick={() => setShowCheckout(true)} style={{ width: "100%" }}>Checkout →</Btn>
        )}
      </div>
    </div>
  );
}

// ─── Orders Page ──────────────────────────────────────────────────────────────
function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    apiFetch("/api/orders", {}, token).then(setOrders).catch(() => { }).finally(() => setLoading(false));
  }, []);

  const statusColor = s => ({ PENDING: "gold", CONFIRMED: "green", CANCELLED: "red" }[s] || "green");

  return (
    <div className="fade-up" style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 36, fontWeight: 400, marginBottom: 24 }}>My Orders</h1>
      {loading ? <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner /></div>
        : orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: G.muted }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <p>No orders yet. Start shopping!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {orders.map(o => (
              <div key={o.id} onClick={() => setSelected(o)} style={{ background: G.white, borderRadius: 14, padding: "18px 20px", border: `1px solid ${G.border}`, cursor: "pointer", transition: "box-shadow 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontWeight: 500, marginBottom: 4 }}>Order #{o.id?.slice(-8)}</p>
                    <p style={{ fontSize: 13, color: G.muted }}>{o.items?.length} item(s) · ${o.totalAmount?.toFixed(2)}</p>
                  </div>
                  <Badge color={statusColor(o.status)}>{o.status || "PENDING"}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Order #${selected?.id?.slice(-8)}`}>
        {selected && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Badge color={statusColor(selected.status)}>{selected.status || "PENDING"}</Badge>
              {selected.shippingAddress && <p style={{ marginTop: 10, fontSize: 13, color: G.muted }}>📍 {selected.shippingAddress}</p>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {selected.items?.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${G.border}` }}>
                  <span>{item.productName} × {item.quantity}</span>
                  <span style={{ fontWeight: 500 }}>${(item.subtotal ?? (item.unitPrice * item.quantity))?.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, paddingTop: 14, borderTop: `2px solid ${G.border}` }}>
              <span style={{ fontWeight: 500 }}>Total</span>
              <span style={{ fontSize: 18, fontWeight: 600 }}>${selected.totalAmount?.toFixed(2)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── Admin Page ───────────────────────────────────────────────────────────────
function AdminPage() {
  const { token } = useAuth();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | "create" | product obj
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const emptyForm = { name: "", description: "", price: "", stockQuantity: "", category: "", imageUrl: "" };
  const [form, setForm] = useState(emptyForm);

  const load = () => apiFetch("/api/products", {}, token).then(setProducts).catch(() => { }).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setModal("create"); };
  const openEdit = (p) => { setForm({ ...p, price: String(p.price), stockQuantity: String(p.stockQuantity) }); setModal(p); };
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      const body = { ...form, price: parseFloat(form.price), stockQuantity: parseInt(form.stockQuantity) };
      if (modal === "create") {
        await apiFetch("/api/products", { method: "POST", body: JSON.stringify(body) }, token);
        toast("Product created!");
      } else {
        await apiFetch(`/api/products/${modal.id}`, { method: "PUT", body: JSON.stringify(body) }, token);
        toast("Product updated!");
      }
      setModal(null); load();
    } catch (e) { toast(e.message, "error"); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    setDeleting(id);
    try {
      await apiFetch(`/api/products/${id}`, { method: "DELETE" }, token);
      toast("Product deleted"); load();
    } catch (e) { toast(e.message, "error"); }
    finally { setDeleting(null); }
  };

  return (
    <div className="fade-up" style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 36, fontWeight: 400 }}>Admin Panel</h1>
          <p style={{ color: G.muted, marginTop: 4 }}>Manage your product catalog</p>
        </div>
        <Btn onClick={openCreate}>+ New product</Btn>
      </div>

      {loading ? <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner /></div> : (
        <div style={{ background: G.white, borderRadius: 16, border: `1px solid ${G.border}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${G.border}` }}>
                {["Product", "Category", "Price", "Stock", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, color: G.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.6 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: `1px solid ${G.border}`, transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = G.bg}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: "#f3f4f6", overflow: "hidden", flexShrink: 0 }}>
                        {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>📦</div>}
                      </div>
                      <div>
                        <p style={{ fontWeight: 500, fontSize: 14 }}>{p.name}</p>
                        <p style={{ fontSize: 12, color: G.muted, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}><Badge>{p.category}</Badge></td>
                  <td style={{ padding: "14px 16px", fontWeight: 500 }}>${p.price?.toFixed(2)}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <Badge color={p.stockQuantity > 10 ? "green" : p.stockQuantity > 0 ? "gold" : "red"}>{p.stockQuantity}</Badge>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <Badge color={p.active !== false ? "green" : "red"}>{p.active !== false ? "Active" : "Inactive"}</Badge>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Btn variant="outline" size="sm" onClick={() => openEdit(p)}>Edit</Btn>
                      <Btn variant="danger" size="sm" loading={deleting === p.id} onClick={() => del(p.id)}>Del</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === "create" ? "New product" : "Edit product"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Product name" value={form.name} onChange={set("name")} placeholder="e.g. Running Shoes" />
            <Field label="Category" value={form.category} onChange={set("category")} placeholder="e.g. Footwear" />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: G.muted, display: "block", marginBottom: 6 }}>Description</label>
            <textarea value={form.description} onChange={set("description")} placeholder="Product description…" rows={3} style={{ outline: "none", border: `1.5px solid ${G.border}`, borderRadius: 10, padding: "10px 14px", fontFamily: "'DM Sans', sans-serif", fontSize: 14, width: "100%", resize: "vertical", background: G.white, color: G.text, transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = G.accentMid} onBlur={e => e.target.style.borderColor = G.border} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Price ($)" value={form.price} onChange={set("price")} placeholder="0.00" type="number" />
            <Field label="Stock qty" value={form.stockQuantity} onChange={set("stockQuantity")} placeholder="0" type="number" />
          </div>
          <Field label="Image URL" value={form.imageUrl} onChange={set("imageUrl")} placeholder="https://…" />
          {form.imageUrl && (
            <div style={{ width: "100%", height: 120, borderRadius: 10, overflow: "hidden", background: "#f3f4f6" }}>
              <img src={form.imageUrl} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
            </div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <Btn variant="ghost" onClick={() => setModal(null)} style={{ flex: 1 }}>Cancel</Btn>
            <Btn onClick={save} loading={saving} style={{ flex: 2 }}>{modal === "create" ? "Create product" : "Save changes"}</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const [page, setPage] = useState("products");
  const { user } = useAuth?.() || {};

  return (
    <>
      <style>{css}</style>
      <Navbar page={page} setPage={setPage} />
      <main>
        {page === "products" && <ProductsPage setPage={setPage} />}
        {page === "auth" && <AuthPage onSuccess={() => setPage("products")} />}
        {page === "cart" && <CartPage setPage={setPage} />}
        {page === "orders" && <OrdersPage />}
        {page === "admin" && <AdminPage />}
      </main>
    </>
  );
}

// ─── Root wrapper ─────────────────────────────────────────────────────────────
export default function Root() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}