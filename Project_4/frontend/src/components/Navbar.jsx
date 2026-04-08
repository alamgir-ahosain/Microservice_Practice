import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          <span className="brand-icon">◈</span>
          <span className="brand-name">NEXUS<span className="brand-accent">SHOP</span></span>
        </Link>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            Products
          </Link>
          {user && (
            <Link to="/orders" className={`nav-link ${isActive('/orders') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
              My Orders
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className={`nav-link admin-link ${isActive('/admin') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
              ⚡ Admin
            </Link>
          )}
        </div>

        <div className="nav-actions">
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          {user && (
            <Link to="/cart" className="cart-btn">
              <span className="cart-icon">◧</span>
              {count > 0 && <span className="cart-badge">{count}</span>}
            </Link>
          )}

          {user ? (
            <div className="user-menu">
              <span className="user-greeting">
                <span className="user-dot" style={{ background: user.role === 'ADMIN' ? '#f59e0b' : '#10b981' }} />
                {user.name?.split(' ')[0]}
              </span>
              <button className="btn-logout" onClick={handleLogout}>Sign Out</button>
            </div>
          ) : (
            <div className="auth-actions">
              <Link to="/login" className="btn-ghost">Sign In</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </div>
          )}

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
}
