// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav style={s.nav}>
      <Link to="/" style={s.brand}>ShopApp</Link>

      <div style={s.links}>
        <Link to="/"       style={s.link}>Products</Link>
        {user && <Link to="/orders" style={s.link}>My Orders</Link>}
        {isAdmin() && (
          <Link to="/admin/products" style={{ ...s.link, color: '#FFD54F' }}>
            Admin Panel
          </Link>
        )}
      </div>

      <div style={s.right}>
        {user ? (
          <>
            <span style={s.greeting}>Hi, {user.name}</span>
            {isAdmin() && (
              <span style={s.badge}>ADMIN</span>
            )}
            <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
          </>
        ) : (
          <div style={s.links}>
            <Link to="/login"    style={s.link}>Login</Link>
            <Link to="/register" style={{ ...s.link, ...s.registerLink }}>Register</Link>
          </div>
        )}
      </div>
    </nav>
  )
}

const s = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 28px', height: 58, background: '#1565C0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)', position: 'sticky', top: 0, zIndex: 100,
  },
  brand:       { color: '#fff', fontWeight: 700, fontSize: 20, textDecoration: 'none', letterSpacing: '-0.5px' },
  links:       { display: 'flex', gap: 24, alignItems: 'center' },
  link:        { color: '#BBDEFB', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' },
  right:       { display: 'flex', alignItems: 'center', gap: 12 },
  greeting:    { fontSize: 14, color: '#BBDEFB' },
  badge:       { background: '#FFD54F', color: '#333', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12 },
  logoutBtn:   { padding: '6px 14px', borderRadius: 6, border: '1.5px solid rgba(255,255,255,0.4)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500 },
  registerLink:{ background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 6, color: '#fff' },
}
