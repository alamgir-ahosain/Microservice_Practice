import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
    const { user, isAdmin } = useAuth();

    if (!user) {
        // Not logged in → redirect to login
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdmin()) {
        // Logged in but not admin → back to home
        return <Navigate to="/" replace />;
    }

    return children;
}