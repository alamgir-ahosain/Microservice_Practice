// src/pages/RegisterPage.jsx
// Sends { name, email, password } — matches your RegistrationRequest DTO
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await register(form)
      toast.success(`Welcome, ${data.name}!`)
      // Navigate immediately - AuthContext writes to localStorage synchronously
      navigate('/', { replace: true })
    } catch (err) {
      console.error('Register error:', err)
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <h2 style={s.title}>Create Account</h2>
          <p style={s.subtitle}>Join us today — it's free</p>
        </div>

        <form onSubmit={handleSubmit} style={s.form} noValidate>
          <div style={s.field}>
            <label htmlFor="reg-name" style={s.label}>Full Name</label>
            <input
              id="reg-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              required
              value={form.name}
              onChange={handleChange}
              style={s.input}
            />
          </div>

          <div style={s.field}>
            <label htmlFor="reg-email" style={s.label}>Email</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              value={form.email}
              onChange={handleChange}
              style={s.input}
            />
          </div>

          <div style={s.field}>
            <label htmlFor="reg-password" style={s.label}>Password</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Minimum 6 characters"
              required
              minLength={6}
              value={form.password}
              onChange={handleChange}
              style={s.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...s.btn, opacity: loading ? 0.75 : 1 }}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={s.footer}>
          Already have an account?{' '}
          <Link to="/login" style={s.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const s = {
  page:     { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EFF3FB', padding: 16 },
  card:     { background: '#fff', borderRadius: 14, padding: '40px 36px', width: '100%', maxWidth: 420, boxShadow: '0 4px 24px rgba(21,101,192,0.10)' },
  header:   { marginBottom: 28 },
  title:    { margin: 0, fontSize: 26, fontWeight: 700, color: '#0D47A1' },
  subtitle: { margin: '6px 0 0', fontSize: 14, color: '#888' },
  form:     { display: 'flex', flexDirection: 'column', gap: 16 },
  field:    { display: 'flex', flexDirection: 'column', gap: 6 },
  label:    { fontSize: 13, fontWeight: 600, color: '#444' },
  input:    { padding: '11px 14px', borderRadius: 8, border: '1.5px solid #D0D7E3', fontSize: 14, outline: 'none', transition: 'border-color 0.2s', color: '#222' },
  btn:      { marginTop: 8, padding: '13px', borderRadius: 8, border: 'none', background: '#1565C0', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' },
  footer:   { marginTop: 22, textAlign: 'center', fontSize: 14, color: '#777' },
  link:     { color: '#1565C0', fontWeight: 600, textDecoration: 'none' },
}
