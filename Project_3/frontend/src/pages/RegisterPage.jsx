import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate     = useNavigate();

    // ✅ single "name" field — matches backend User entity
    const [form, setForm] = useState({
        name:     '',
        email:    '',
        password: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await register(form);
            // ✅ data.name works because LoginResponse has "name"
            toast.success(`Welcome, ${data.name}!`);
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Create Account</h2>

                <form onSubmit={handleSubmit} style={styles.form}>

                    {/* ✅ single name field — backend has name, not firstName/lastName */}
                    <div style={styles.field}>
                        <label style={styles.label}>Full Name</label>
                        <input
                            style={styles.input}
                            name="name"
                            placeholder="Your full name"
                            required
                            value={form.name}
                            onChange={handleChange}
                        />
                    </div>

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
                            placeholder="Minimum 6 characters"
                            required
                            minLength={6}
                            value={form.password}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Creating account...' : 'Register'}
                    </button>
                </form>

                <p style={styles.footer}>
                    Already have an account?{' '}
                    <Link to="/login" style={styles.link}>Login</Link>
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
        transition: 'border-color 0.2s',
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
        transition: 'opacity 0.2s',
    },
    footer: { marginTop: 20, textAlign: 'center', fontSize: 14, color: '#666' },
    link:   { color: '#1565C0', fontWeight: 500, textDecoration: 'none' },
};