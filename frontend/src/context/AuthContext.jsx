import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [barberProfile, setBarberProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('alex_token'));

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      setBarberProfile(res.data.barberProfile);
    } catch (err) {
      localStorage.removeItem('alex_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('alex_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    setBarberProfile(res.data.barberProfile);
    return res.data;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  };

  const verifyOtp = async (userId, otp) => {
    const res = await api.post('/auth/verify-otp', { userId, otp });
    localStorage.setItem('alex_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    if (res.data.barberProfile) setBarberProfile(res.data.barberProfile);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('alex_token');
    setToken(null);
    setUser(null);
    setBarberProfile(null);
  };

  const value = { user, barberProfile, token, loading, login, register, verifyOtp, logout, fetchUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
