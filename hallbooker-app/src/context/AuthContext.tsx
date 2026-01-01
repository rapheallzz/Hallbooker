'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import api from '@/services/api';
import { getDashboardPath } from '@/utils/redirects';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string[];
  activeRole: string;
  hallOwnerApplication?: {
    status: string;
  };
}

interface DecodedToken {
  _id: string;
  email: string;
  role:string[];
  activeRole: string;
  iat: number;
  exp: number;
  hallOwnerApplication?: {
    status: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateToken: (token: string) => void;
  updateUserApplicationStatus: (status: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.Authorization;
    router.push('/auth/login');
  }, [router]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(storedToken);
        // Check if token is expired
        if (decodedToken.exp * 1000 < Date.now()) {
          logout(); // This will clear storage and redirect
        } else {
          setToken(storedToken);
          api.defaults.headers.Authorization = `Bearer ${storedToken}`;
          // Fetch user data if not in local storage or if it's stale
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            // This part is tricky without a /me endpoint,
            // We'll rely on the login process to store the user
            // For now, let's just decode and set what we have.
            const userFromToken: User = {
                id: decodedToken._id,
                email: decodedToken.email,
                role: decodedToken.role,
                activeRole: decodedToken.activeRole,
                fullName: '', // This will be incomplete
                hallOwnerApplication: decodedToken.hallOwnerApplication
            };
            setUser(userFromToken);
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth from localStorage", error);
        logout(); // Token might be invalid, so clear everything
      }
    }
    setLoading(false);
  }, [logout]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    api.defaults.headers.Authorization = `Bearer ${newToken}`;

    const redirectPath = getDashboardPath(newUser.activeRole);
    router.push(redirectPath);
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
        hallOwnerApplication: decodedToken.hallOwnerApplication,
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      const redirectPath = getDashboardPath(decodedToken.activeRole);
      router.push(redirectPath);
    } catch (error) {
      console.error("Failed to decode token or update user", error);
      logout();
    }
  };

  const updateUserApplicationStatus = (status: string) => {
    if (user) {
      const updatedUser = {
        ...user,
        hallOwnerApplication: {
          ...user.hallOwnerApplication,
          status,
        },
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateToken, updateUserApplicationStatus }}>
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
