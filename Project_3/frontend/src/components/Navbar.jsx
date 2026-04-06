import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={styles.nav}>
            <Link to="/" style={styles.brand}>ShopApp</Link>

            <div style={styles.links}>
                <Link to="/"       style={styles.link}>Products</Link>
                <Link to="/orders" style={styles.link}>My Orders</Link>

                {/* Only show admin link if user has ADMIN role */}
                {isAdmin() && (
                    <Link to="/admin/products" style={{ ...styles.link, color: '#ef9f27' }}>
                        Admin
                    </Link>
                )}
            </div>

            <div style={styles.user}>
                {user ? (
                    <>
                        {/* ✅ user.name — matches your User entity and LoginResponse */}
                        <span style={styles.greeting}>Hi, {user.name}</span>
                        <button onClick={handleLogout} style={styles.logoutBtn}>
                            Logout
                        </button>
                    </>
                ) : (
                    <Link to="/login" style={styles.link}>Login</Link>
                )}
            </div>
        </nav>
    );
}

const styles = {
    nav: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: 56,
        background: '#1565C0',
        color: '#fff',
    },
    brand:    { color: '#fff', fontWeight: 700, fontSize: 20, textDecoration: 'none' },
    links:    { display: 'flex', gap: 24 },
    link:     { color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 500 },
    user:     { display: 'flex', alignItems: 'center', gap: 12 },
    greeting: { fontSize: 14, color: '#BBDEFB' },
    logoutBtn: {
        padding: '6px 14px',
        borderRadius: 6,
        border: '1.5px solid rgba(255,255,255,0.5)',
        background: 'transparent',
        color: '#fff',
        cursor: 'pointer',
        fontSize: 13,
    },
};