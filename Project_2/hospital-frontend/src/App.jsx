// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";
import { AuthProvider }    from "./context/AuthContext";
import { ThemeProvider }   from "./context/ThemeContext";
import { ChatbotProvider } from "./context/ChatbotContext";
import PrivateRoute        from "./components/PrivateRoute";
import HospitalChatbot     from "./components/chatbot/HospitalChatbot";

// ── Admin / authenticated pages ───────────────────────────────────────────────
import Login            from "./pages/Login";
import Register         from "./pages/Register";
import AdminDashboard   from "./pages/admin/Dashboard";
import PatientDashboard from "./pages/PatientDashboard";
import AuthDebug        from "./pages/AuthDebug";

// ── Public pages ──────────────────────────────────────────────────────────────
import HomePage           from "./pages/public/HomePage";
import FindDoctorsPage    from "./pages/public/FindDoctorsPage";
import DoctorDetailPage   from "./pages/public/DoctorDetailPage";
import FindHospitalsPage  from "./pages/public/FindHospitalsPage";
import HospitalDetailPage from "./pages/public/HospitalDetailPage";

// ── Route wrappers ────────────────────────────────────────────────────────────
function HomeWrapper()          { const nav = useNavigate(); return <HomePage          navigate={(r,id) => nav(id ? `/${r}/${id}` : `/${r}`)} />; }
function FindDoctorsWrapper()   { const nav = useNavigate(); return <FindDoctorsPage   navigate={(r,id) => nav(id ? `/${r}/${id}` : `/${r}`)} />; }
function FindHospitalsWrapper() { const nav = useNavigate(); return <FindHospitalsPage navigate={(r,id) => nav(id ? `/${r}/${id}` : `/${r}`)} />; }

function DoctorDetailWrapper() {
  const { id } = useParams(); const nav = useNavigate();
  return <DoctorDetailPage  id={Number(id)} navigate={(r,rid) => nav(rid ? `/${r}/${rid}` : `/${r}`)} />;
}
function HospitalDetailWrapper() {
  const { id } = useParams(); const nav = useNavigate();
  return <HospitalDetailPage id={Number(id)} navigate={(r,rid) => nav(rid ? `/${r}/${rid}` : `/${r}`)} />;
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatbotProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/"                    element={<HomeWrapper />} />
              <Route path="/doctors"             element={<FindDoctorsWrapper />} />
              <Route path="/doctor-detail/:id"   element={<DoctorDetailWrapper />} />
              <Route path="/hospitals"           element={<FindHospitalsWrapper />} />
              <Route path="/hospital-detail/:id" element={<HospitalDetailWrapper />} />

              {/* Auth */}
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/debug"    element={<AuthDebug />} />

              {/* Patient */}
              <Route path="/patient" element={<PatientDashboard />} />

              {/* Admin/Doctor (guarded) */}
              <Route path="/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* ── Chatbot renders on every page, outside the route tree ── */}
            <HospitalChatbot />
          </BrowserRouter>
        </ChatbotProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
