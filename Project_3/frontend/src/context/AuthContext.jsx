// src/context/AuthContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { authApi } from '../api/authApi'

const AuthContext = createContext(null)

// Read user from localStorage — synchronous, works before React state updates
const readStorage = () => {
  try {
    const s = localStorage.getItem('user')
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

// Write user to localStorage synchronously before updating React state
const writeStorage = (data) => {
  const userObj = {
    userId: data.userId,
    name:   data.name,
    email:  data.email,
    role:   data.role,
  }
  localStorage.setItem('accessToken', data.accessToken)
  localStorage.setItem('user', JSON.stringify(userObj))
  return userObj
}

export function AuthProvider({ children }) {
  // Initialize from localStorage so page refresh keeps user logged in
  const [user, setUser] = useState(readStorage)
  const [isLoading, setIsLoading] = useState(false)
  const [justLoggedIn, setJustLoggedIn] = useState(false)

  // Re-check localStorage on mount to ensure we have latest data
  useEffect(() => {
    const storedUser = readStorage()
    if (storedUser && !user) {
      setUser(storedUser)
    }
  }, [])

  // Clear justLoggedIn flag after navigation completes
  useEffect(() => {
    if (justLoggedIn) {
      const timer = setTimeout(() => setJustLoggedIn(false), 500)
      return () => clearTimeout(timer)
    }
  }, [justLoggedIn])

  const register = useCallback(async ({ name, email, password }) => {
    setIsLoading(true)
    try {
      const response = await authApi.register({ name, email, password })
      console.log('Register API response:', response)
      const data = response.data
      if (!data || !data.accessToken || !data.userId) {
        throw new Error('Invalid response from server: missing accessToken or userId')
      }
      const userObj = writeStorage(data)
      setUser(userObj)
      setJustLoggedIn(true)
      return data
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    setIsLoading(true)
    try {
      const response = await authApi.login({ email, password })
      console.log('Login API response:', response)
      const data = response.data
      if (!data || !data.accessToken || !data.userId) {
        throw new Error('Invalid response from server: missing accessToken or userId')
      }
      const userObj = writeStorage(data)
      setUser(userObj)
      setJustLoggedIn(true)
      console.log('AuthContext: User set, justLoggedIn flag set to true')
      return data
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  // isAdmin checks both React state AND localStorage (handles timing edge case)
  const isAdmin = useCallback(() => {
    const role = user?.role ?? readStorage()?.role
    return role === 'ADMIN'
  }, [user])

  return (
    <AuthContext.Provider value={{ user, isAuthLoading: isLoading, justLoggedIn, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
