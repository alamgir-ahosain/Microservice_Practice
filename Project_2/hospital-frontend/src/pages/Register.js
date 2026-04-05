// src/pages/Register.js
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]       = useState({ name: '', email: '', password: '', role: 'PATIENT' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ FIX: onClick instead of form onSubmit — no page reload
  const handleRegister = async () => {
    setError('');
    setLoading(true);
    console.log('🔵 Register clicked → form:', { ...form, password: '***' });

    try {
      const userData = await register(form.name, form.email, form.password, form.role);
      console.log('✅ Register success → userData:', userData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('❌ Register failed:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error   ||
        err.message                 ||
        'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🏥 Create Account</h2>

        {error && <div style={styles.error} role="alert">{error}</div>}

        <div>
          <div style={styles.field}>
            <label htmlFor="name" style={styles.label}>Full Name</label>
            <input
              id="name" name="name" type="text"
              autoComplete="name"
              value={form.name} onChange={handleChange}
              style={styles.input} placeholder="John Doe"
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              id="email" name="email" type="email"
              autoComplete="email"
              value={form.email} onChange={handleChange}
              style={styles.input} placeholder="john@example.com"
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              id="password" name="password" type="password"
              autoComplete="new-password"
              value={form.password} onChange={handleChange}
              style={styles.input} placeholder="Min 6 characters"
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="role" style={styles.label}>Role</label>
            <select
              id="role" name="role"
              autoComplete="off"
              value={form.role} onChange={handleChange}
              style={styles.input}
            >
              <option value="PATIENT">Patient</option>
              <option value="DOCTOR">Doctor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button
            onClick={handleRegister}
            style={{...styles.button, opacity: loading ? 0.7 : 1}}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </div>

        <p style={styles.link}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' },
  card:      { background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px' },
  title:     { textAlign: 'center', marginBottom: '1.5rem', color: '#2d3748' },
  field:     { marginBottom: '1rem' },
  label:     { display: 'block', marginBottom: '0.3rem', fontWeight: 600, color: '#4a5568', fontSize: '0.9rem' },
  input:     { width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box' },
  button:    { width: '100%', padding: '0.75rem', background: '#38a169', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem' },
  error:     { background: '#fff5f5', color: '#c53030', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' },
  link:      { textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' },
};
