import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import AdminProductsPage from './pages/AdminProductsPage';

function Layout({ children }) {
    return (
        <>
            <Navbar />
            <main style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>
                {children}
            </main>
        </>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                {/* Toast notifications appear top-right */}
                <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

                <Routes>
                    {/* Public routes — no navbar needed */}
                    <Route path="/login"    element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Protected routes — need login */}
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

                    {/* Catch-all redirect */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}