import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const { login }  = useAuth();
    const navigate   = useNavigate();
    const [form, setForm]       = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false); // ✅ added loading state

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await login(form.email, form.password);
            // ✅ data.name — matches your LoginResponse field (not firstName)
            toast.success(`Welcome back, ${data.name}!`);
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Welcome Back</h2>

                <form onSubmit={handleSubmit} style={styles.form}>

                    <div style={styles.field}>
                        <label style={styles.label}>Email</label>
                        <input
                            style={styles.input}
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            required
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Password</label>
                        <input
                            style={styles.input}
                            type="password"
                            name="password"
                            placeholder="Your password"
                            required
                            value={form.password}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p style={styles.footer}>
                    No account?{' '}
                    <Link to="/register" style={styles.link}>Register here</Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f2f5',
    },
    card: {
        background: '#fff',
        borderRadius: 12,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
    },
    title: {
        margin: '0 0 28px',
        fontSize: 24,
        fontWeight: 600,
        color: '#1a1a2e',
    },
    form:  { display: 'flex', flexDirection: 'column', gap: 16 },
    field: { display: 'flex', flexDirection: 'column', gap: 6 },
    label: { fontSize: 13, fontWeight: 500, color: '#555' },
    input: {
        padding: '10px 14px',
        borderRadius: 8,
        border: '1.5px solid #ddd',
        fontSize: 14,
        outline: 'none',
    },
    button: {
        marginTop: 8,
        padding: '12px',
        borderRadius: 8,
        border: 'none',
        background: '#1565C0',
        color: '#fff',
        fontSize: 15,
        fontWeight: 600,
        cursor: 'pointer',
    },
    footer: { marginTop: 20, textAlign: 'center', fontSize: 14, color: '#666' },
    link:   { color: '#1565C0', fontWeight: 500, textDecoration: 'none' },
};