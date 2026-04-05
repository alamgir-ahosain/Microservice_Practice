// src/pages/AuthDebug.js
// Temporary debug page — visit http://localhost:3000/debug
// Shows you EXACTLY what the auth-service returns for any login attempt
// DELETE this file before production!

import { useState } from 'react';
import axios from 'axios';

export default function AuthDebug() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [role,     setRole]     = useState('PATIENT');
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post('http://localhost:8081/api/auth/login',
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setResult({ status: res.status, type: 'SUCCESS', data: res.data });
    } catch (err) {
      setResult({
        status: err.response?.status,
        type: 'ERROR',
        data: err.response?.data,
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const testRegister = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post('http://localhost:8081/api/auth/register',
        { name, email, password, role },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setResult({ status: res.status, type: 'SUCCESS', data: res.data });
    } catch (err) {
      setResult({
        status: err.response?.status,
        type: 'ERROR',
        data: err.response?.data,
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const decodeToken = (token) => {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return 'Could not decode token';
    }
  };

  return (
    <div style={s.page}>
      <h2 style={s.title}>🔍 Auth Debug Tool</h2>
      <p style={s.sub}>Use this to test login/register and see exact server responses</p>

      <div style={s.card}>
        <div style={s.row}>
          <div style={s.field}>
            <label style={s.label}>Name (register only)</label>
            <input style={s.input} value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
          </div>
          <div style={s.field}>
            <label style={s.label}>Role</label>
            <select style={s.input} value={role} onChange={e => setRole(e.target.value)}>
              <option value="PATIENT">PATIENT</option>
              <option value="DOCTOR">DOCTOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
        </div>
        <div style={s.row}>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="test@example.com" />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input style={s.input} type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="password123" />
          </div>
        </div>

        <div style={s.btnRow}>
          <button style={{...s.btn, background:'#3182ce'}} onClick={testLogin}    disabled={loading}>Test Login</button>
          <button style={{...s.btn, background:'#38a169'}} onClick={testRegister} disabled={loading}>Test Register</button>
        </div>
      </div>

      {result && (
        <div style={{...s.card, borderLeft: `4px solid ${result.type === 'SUCCESS' ? '#38a169' : '#e53e3e'}`}}>
          <h3 style={{color: result.type === 'SUCCESS' ? '#38a169' : '#e53e3e', marginBottom:'1rem'}}>
            {result.type === 'SUCCESS' ? '✅ SUCCESS' : '❌ ERROR'} — HTTP {result.status}
          </h3>

          <div style={s.section}>
            <strong>Raw Response:</strong>
            <pre style={s.pre}>{JSON.stringify(result.data, null, 2)}</pre>
          </div>

          {result.type === 'SUCCESS' && result.data?.token && (
            <div style={s.section}>
              <strong>🔓 Decoded JWT Payload:</strong>
              <pre style={{...s.pre, background:'#ebf8ff'}}>
                {JSON.stringify(decodeToken(result.data.token), null, 2)}
              </pre>
              <p style={{fontSize:'0.8rem', color:'#718096', marginTop:'0.5rem'}}>
                ↑ Check that "role" field shows "PATIENT" / "DOCTOR" / "ADMIN"
              </p>
            </div>
          )}

          {result.type === 'ERROR' && (
            <div style={s.section}>
              <strong>Error message:</strong>
              <p style={{color:'#e53e3e'}}>{result.message}</p>
            </div>
          )}
        </div>
      )}

      <p style={{textAlign:'center', marginTop:'2rem', color:'#a0aec0', fontSize:'0.8rem'}}>
        ⚠️ Delete this page before deploying to production
      </p>
    </div>
  );
}

const s = {
  page:    { minHeight:'100vh', background:'#f0f4f8', padding:'2rem', fontFamily:'monospace' },
  title:   { textAlign:'center', color:'#2d3748', marginBottom:'0.5rem' },
  sub:     { textAlign:'center', color:'#718096', marginBottom:'2rem', fontSize:'0.9rem' },
  card:    { background:'#fff', padding:'1.5rem', borderRadius:'10px', boxShadow:'0 2px 12px rgba(0,0,0,0.08)', maxWidth:'800px', margin:'0 auto 1.5rem' },
  row:     { display:'flex', gap:'1rem', marginBottom:'1rem' },
  field:   { flex:1 },
  label:   { display:'block', fontSize:'0.85rem', fontWeight:600, color:'#4a5568', marginBottom:'0.3rem' },
  input:   { width:'100%', padding:'0.5rem 0.75rem', border:'1px solid #cbd5e0', borderRadius:'6px', fontSize:'0.9rem', boxSizing:'border-box' },
  btnRow:  { display:'flex', gap:'1rem', marginTop:'0.5rem' },
  btn:     { flex:1, padding:'0.65rem', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:600, fontSize:'0.9rem' },
  section: { marginBottom:'1rem' },
  pre:     { background:'#f7fafc', padding:'1rem', borderRadius:'6px', fontSize:'0.8rem', overflowX:'auto', marginTop:'0.5rem', whiteSpace:'pre-wrap' },
};