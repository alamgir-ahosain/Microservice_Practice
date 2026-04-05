import { useState } from 'react';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleLogin = async () => {
    try {
      setMsg('Logging in...');
      const res = await axios.post('http://localhost:8081/api/auth/login', { email, password });
      const data = res.data;

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        name: data.name,
        email: data.email,
        role: data.role
      }));

      // Redirect based on role — no PrivateRoute involved
      const role = data.role;
      if (role === 'ADMIN')        window.location.href = '/dashboard';
      else if (role === 'DOCTOR')  window.location.href = '/dashboard';
      else if (role === 'PATIENT') window.location.href = '/patient';
      else                         window.location.href = '/dashboard';

    } catch (err) {
      setMsg('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '80px auto', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center' }}>🏥 Hospital Login</h2>
      {msg && <p style={{ color: msg.startsWith('Error') ? 'red' : 'green' }}>{msg}</p>}
      <input placeholder="Email" type="email" value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ display: 'block', width: '100%', padding: '0.6rem', margin: '0.5rem 0', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #ccc' }} />
      <input placeholder="Password" type="password" value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ display: 'block', width: '100%', padding: '0.6rem', margin: '0.5rem 0', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #ccc' }} />
      <button onClick={handleLogin}
        style={{ width: '100%', padding: '0.75rem', background: '#3182ce', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '0.5rem' }}>
        Login
      </button>
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        No account? <a href="/register">Register</a>
      </p>
    </div>
  );
}
