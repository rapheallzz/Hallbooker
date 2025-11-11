'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token:string, user: User) => void;
  logout: () => void;
  updateToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        api.defaults.headers.Authorization = `Bearer ${storedToken}`;
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.Authorization;
    router.push('/auth/login');
  };

  const updateToken = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    api.defaults.headers.Authorization = `Bearer ${newToken}`;

    // Re-fetch user data after token update
    const fetchUser = async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (data.data && !data.data.fullName && data.data.firstName && data.data.lastName) {
          data.data.fullName = `${data.data.firstName} ${data.data.lastName}`;
        }
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
      } catch (error) {
        console.error("Failed to fetch user after token update", error);
        logout();
      }
    };

    fetchUser();
  };


  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};