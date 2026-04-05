// src/pages/Dashboard.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { patientService, doctorService, appointmentService } from '../services/api';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const [patients,     setPatients]     = useState([]);
  const [doctors,      setDoctors]      = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab,    setActiveTab]    = useState('patients');
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, dRes, aRes] = await Promise.all([
        patientService.getAll(),
        doctorService.getAll(),
        appointmentService.getAll(),
      ]);
      setPatients(pRes.data);
      setDoctors(dRes.data);
      setAppointments(aRes.data);
    } catch (e) {
      setError('Failed to load data. Make sure hospital-service is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={styles.page}>
      {/* ── Navbar ── */}
      <nav style={styles.nav}>
        <span style={styles.navTitle}>🏥 Hospital Management</span>
        <div style={styles.navRight}>
          <span style={styles.navUser}>👤 {user?.name} ({user?.role})</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      <div style={styles.content}>
        {/* ── Tabs ── */}
        <div style={styles.tabs}>
          {['patients', 'doctors', 'appointments'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {error  && <div style={styles.error}>{error}</div>}
        {loading && <div style={styles.loading}>Loading...</div>}

        {/* ── Patients Table ── */}
        {!loading && activeTab === 'patients' && (
          <Table
            title="Patients"
            data={patients}
            columns={['id', 'name', 'email', 'phone', 'bloodGroup', 'age']}
          />
        )}

        {/* ── Doctors Table ── */}
        {!loading && activeTab === 'doctors' && (
          <Table
            title="Doctors"
            data={doctors}
            columns={['id', 'name', 'email', 'specialization', 'phone']}
          />
        )}

        {/* ── Appointments Table ── */}
        {!loading && activeTab === 'appointments' && (
          <Table
            title="Appointments"
            data={appointments.map(a => ({
              id: a.id,
              patient: a.patient?.name,
              doctor:  a.doctor?.name,
              time:    a.appointmentTime,
              status:  a.status,
            }))}
            columns={['id', 'patient', 'doctor', 'time', 'status']}
          />
        )}
      </div>
    </div>
  );
}

// Simple reusable table
function Table({ title, data, columns }) {
  if (!data.length) return <p style={{ color: '#718096' }}>No {title.toLowerCase()} found.</p>;
  return (
    <div>
      <h3 style={{ color: '#2d3748', marginBottom: '1rem' }}>{title} ({data.length})</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyles.table}>
          <thead>
            <tr>{columns.map(c => <th key={c} style={tableStyles.th}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={i % 2 === 0 ? {} : { background: '#f7fafc' }}>
                {columns.map(c => <td key={c} style={tableStyles.td}>{row[c] ?? '-'}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page:      { minHeight: '100vh', background: '#f0f4f8' },
  nav:       { background: '#2b6cb0', color: '#fff', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navTitle:  { fontSize: '1.2rem', fontWeight: 700 },
  navRight:  { display: 'flex', alignItems: 'center', gap: '1rem' },
  navUser:   { fontSize: '0.9rem' },
  logoutBtn: { padding: '0.4rem 1rem', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  content:   { padding: '2rem', maxWidth: '1100px', margin: '0 auto' },
  tabs:      { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' },
  tab:       { padding: '0.5rem 1.2rem', border: '1px solid #cbd5e0', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontWeight: 500 },
  tabActive: { background: '#2b6cb0', color: '#fff', border: '1px solid #2b6cb0' },
  error:     { background: '#fff5f5', color: '#c53030', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' },
  loading:   { textAlign: 'center', padding: '2rem', color: '#718096' },
};

const tableStyles = {
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.08)' },
  th:    { padding: '0.75rem 1rem', background: '#ebf4ff', color: '#2c5282', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #bee3f8', textTransform: 'capitalize' },
  td:    { padding: '0.65rem 1rem', color: '#4a5568', borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem' },
};