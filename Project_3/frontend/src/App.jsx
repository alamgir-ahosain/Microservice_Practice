// src/App.jsx
// BrowserRouter MUST be outermost — AuthProvider inside it so useNavigate works
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProductsPage from './pages/ProductsPage'
import OrdersPage from './pages/OrdersPage'
import AdminProductsPage from './pages/AdminProductsPage'

// Debug component to check auth state
function DebugAuth() {
  const auth = useAuth()
  const userFromStorage = localStorage.getItem('user')
  const tokenFromStorage = localStorage.getItem('accessToken')

  return (
    <div style={{ padding: 20 }}>
      <h2>Debug Auth State</h2>
      <pre>{JSON.stringify({
        contextUser: auth?.user,
        isAuthLoading: auth?.isAuthLoading,
        localStorageUser: userFromStorage ? JSON.parse(userFromStorage) : null,
        hasToken: !!tokenFromStorage
      }, null, 2)}</pre>
      <button onClick={() => { localStorage.clear(); window.location.reload() }}>Clear Auth</button>
    </div>
  )
}

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
        {children}
      </main>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>           {/* ← outermost: required for useNavigate to work */}
      <AuthProvider>           {/* ← inside router so navigate() works in context */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { fontSize: 14, borderRadius: 8 },
          }}
        />
        <Routes>
          {/* Debug route - accessible without auth */}
          <Route path="/debug" element={<DebugAuth />} />

          {/* Public — no Navbar, no auth check */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected — needs login */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout><ProductsPage /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/orders" element={
            <ProtectedRoute>
              <Layout><OrdersPage /></Layout>
            </ProtectedRoute>
          } />

          {/* Admin only */}
          <Route path="/admin/products" element={
            <ProtectedRoute adminOnly>
              <Layout><AdminProductsPage /></Layout>
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
