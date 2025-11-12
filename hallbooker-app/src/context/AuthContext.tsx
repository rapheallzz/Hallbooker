'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import api from '@/services/api';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string[];
  activeRole: string;
  status?: string;
}

interface DecodedToken {
  _id: string;
  email: string;
  role:string[];
  activeRole: string;
  iat: number;
  exp: number;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
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
    api.defaults.headers.Authorization = `Bearer ${newToken}`;
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

    try {
      const decodedToken = jwtDecode<DecodedToken>(newToken);
      const updatedUser: User = {
        id: decodedToken._id,
        email: decodedToken.email,
        role: decodedToken.role,
        activeRole: decodedToken.activeRole,
        fullName: user?.fullName || '', // Preserve fullName from the old state
        status: decodedToken.status,
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Failed to decode token or update user", error);
      logout();
    }
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
