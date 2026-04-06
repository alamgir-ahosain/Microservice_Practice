import { createContext, useContext, useState } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    // On page refresh, reload user from localStorage
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });

    // ✅ register now sends { name, email, password }
    // Backend User entity has a single "name" field, not firstName/lastName
    const register = async ({ name, email, password }) => {
        const { data } = await authApi.register({ name, email, password });

        // data shape from your LoginResponse:
        // { accessToken, userId, name, email, role }
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify({
            userId: data.userId,
            name:   data.name,
            email:  data.email,
            role:   data.role,
        }));
        setUser({
            userId: data.userId,
            name:   data.name,
            email:  data.email,
            role:   data.role,
        });
        return data;
    };

    const login = async (email, password) => {
        const { data } = await authApi.login({ email, password });

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify({
            userId: data.userId,
            name:   data.name,
            email:  data.email,
            role:   data.role,
        }));
        setUser({
            userId: data.userId,
            name:   data.name,
            email:  data.email,
            role:   data.role,
        });
        return data;
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setUser(null);
    };

    const isAdmin = () => user?.role === 'ADMIN';
    const isLoggedIn = () => user !== null;

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isAdmin, isLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);