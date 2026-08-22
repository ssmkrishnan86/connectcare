import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../../../lib/api';

export interface AuthUser {
  userId?: string;
  username: string;
  fullName?: string;
  email: string;
  role: 'Doctor' | 'Nurse' | 'Admin' | string;
  assignedRoles?: string[];
  permissions?: string[];
  doctorId?: string;
  nurseId?: string;
  token?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { username: string; password: string; role?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');

      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        setUser({ ...parsedUser, token: storedToken });
      }
    } catch (e) {
      console.error('Failed to parse stored auth user', e);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: { username: string; password: string; role?: string }) => {
    setIsLoading(true);
    try {
      const data = await api.login(credentials);
      const authUser: AuthUser = {
        userId: data.userId,
        username: data.username,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        assignedRoles: data.assignedRoles,
        permissions: data.permissions,
        doctorId: data.doctorId,
        nurseId: data.nurseId,
        token: data.token,
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(authUser));
      setUser(authUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout().catch(() => {});
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsLoading(false);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!localStorage.getItem('token'),
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
