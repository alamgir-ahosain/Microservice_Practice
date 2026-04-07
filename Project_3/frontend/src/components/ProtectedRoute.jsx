// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Reads localStorage as fallback in case React state hasn't updated yet
const getUserFromStorage = () => {
  try {
    const s = localStorage.getItem('user')
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAuthLoading, justLoggedIn } = useAuth()
  const location = useLocation()

  // Always check localStorage directly - most reliable source of truth
  const userFromStorage = getUserFromStorage()
  const resolvedUser = user || userFromStorage

  console.log('ProtectedRoute check:', {
    path: location.pathname,
    userFromContext: user,
    userFromStorage,
    resolvedUser,
    isAuthLoading,
    justLoggedIn
  })

  if (isAuthLoading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
  }

  // If user just logged in, don't redirect even if resolvedUser is temporarily null
  // This handles the React state update timing issue
  if (!resolvedUser && !justLoggedIn) {
    console.log('ProtectedRoute: No user found, redirecting to login')
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  console.log('ProtectedRoute: User authenticated (or just logged in), rendering children')

  if (adminOnly && resolvedUser?.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return children
}
