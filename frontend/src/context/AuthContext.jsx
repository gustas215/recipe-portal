import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { refreshSession, setAccessToken, setSessionEndHandler } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // loading = true, kol bandome atkurti sesiją iš refresh cookie (pirmas užkrovimas)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSessionEndHandler(() => {
      setUser(null);
      toast.error('Sesija baigėsi, prisijunkite iš naujo');
    });

    // Perkrovus puslapį access žetono atmintyje nebėra, todėl bandome gauti naują
    refreshSession()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }

  async function register(username, email, password) {
    await api.post('/auth/register', { username, email, password });
    // Registracija neprijungia, todėl iškart prisijungiame tais pačiais duomenimis
    return login(email, password);
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }

  const value = { user, loading, isAdmin: user?.role === 'admin', login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
