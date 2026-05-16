import { createContext, useContext, useState, useEffect } from 'react';
import api, { setToken } from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('me');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
        setToken(JSON.parse(stored).token);
      } catch {
        localStorage.removeItem('me');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/users/login', { email, password });
    setToken(data.accessToken);
    const { data: me } = await api.get('/users/me');
    const userData = { ...me.user, token: data.accessToken };
    setUser(userData);
    localStorage.setItem('me', JSON.stringify(userData));
    return userData;
  };

  const register = async (form) => {
    await api.post('/users/registro', form);
  };

  const logout = async () => {
    try { await api.post('/users/logout'); } catch {}
    setToken(null);
    setUser(null);
    localStorage.removeItem('me');
  };

  const isAdmin = user?.rol === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
