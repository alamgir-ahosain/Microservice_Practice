// src/context/AuthContext.js
import { createContext, useContext, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      const parsed = saved ? JSON.parse(saved) : null;
      console.log('🔑 AuthContext init → restored user from localStorage:', parsed);
      return parsed;
    } catch {
      return null;
    }
  });

  const login = async (email, password) => {
    console.log('🔑 AuthContext.login() called → email:', email);

    const res  = await authAPI.post('/api/auth/login', { email, password });
    const data = res.data;

    console.log('🔑 AuthContext.login() → server response:', data);

    if (!data || !data.token) {
      console.error('🔑 AuthContext.login() → NO TOKEN in response!');
      throw new Error('No token received from server');
    }

    const userData = { name: data.name, email: data.email, role: data.role };
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);

    console.log('🔑 AuthContext.login() → setUser called with:', userData);
    console.log('🔑 AuthContext.login() → localStorage.token set:', data.token.substring(0, 20));
    return userData;
  };

  const register = async (name, email, password, role = 'PATIENT') => {
    console.log('🔑 AuthContext.register() called → email:', email, 'role:', role);

    const res  = await authAPI.post('/api/auth/register', { name, email, password, role });
    const data = res.data;

    console.log('🔑 AuthContext.register() → server response:', data);

    if (!data || !data.token) {
      throw new Error('No token received from server');
    }

    const userData = { name: data.name, email: data.email, role: data.role };
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);

    console.log('🔑 AuthContext.register() → setUser called with:', userData);
    return userData;
  };

  const logout = () => {
    console.log('🔑 AuthContext.logout() called');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
