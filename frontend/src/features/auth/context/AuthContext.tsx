import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../../../lib/api';

export interface AuthUser {
  id?: string;
  userId?: string;
  username: string;
  fullName?: string;
  email: string;
  role: 'Doctor' | 'Nurse' | 'Admin' | string;
  assignedRoles?: string[];
  permissions?: string[];
  permissionsMatrixJson?: string;
  permissionsMatrix?: Record<string, Record<string, boolean>>;
  doctorId?: string;
  nurseId?: string;
  avatar?: string;
  department?: string;
  specialty?: string;
  doctorIdCode?: string;
  token?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { username: string; password: string; role?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUserPermissions: (permissionsMatrixJson: string, permissionsMatrix?: Record<string, Record<string, boolean>>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          setUser({ ...parsedUser, token: storedToken });

          // Fetch fresh user profile from backend to sync active nurseId / doctorId & permissions
          try {
            const meRes = await api.getCurrentUser();
            const meData = meRes?.data || meRes;
            if (meData && meData.userId) {
              let parsedMatrix: Record<string, Record<string, boolean>> | undefined = undefined;
              if (meData.permissionsMatrixJson) {
                try {
                  parsedMatrix = JSON.parse(meData.permissionsMatrixJson);
                } catch { }
              }

              const freshUser: AuthUser = {
                userId: meData.userId,
                username: meData.username,
                fullName: meData.fullName,
                email: meData.email,
                role: meData.role,
                assignedRoles: meData.roles || meData.assignedRoles,
                permissions: meData.permissions,
                permissionsMatrixJson: meData.permissionsMatrixJson,
                permissionsMatrix: parsedMatrix,
                doctorId: meData.doctorId,
                nurseId: meData.nurseId,
                department: meData.department || parsedUser.department,
                specialty: meData.specialty || parsedUser.specialty,
                doctorIdCode: meData.doctorIdCode || parsedUser.doctorIdCode,
                avatar: meData.avatar || parsedUser.avatar,
                token: storedToken,
              };
              localStorage.setItem('user', JSON.stringify(freshUser));
              setUser(freshUser);
            }
          } catch (meErr) {
            console.warn('Could not refresh user profile on mount:', meErr);
          }
        }
      } catch (e) {
        console.error('Failed to parse stored auth user', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: { username: string; password: string; role?: string }) => {
    setIsLoading(true);
    try {
      const data = await api.login(credentials);
      let parsedMatrix: Record<string, Record<string, boolean>> | undefined = undefined;
      if (data.permissionsMatrixJson) {
        try {
          parsedMatrix = JSON.parse(data.permissionsMatrixJson);
        } catch { }
      }

      const authUser: AuthUser = {
        userId: data.userId,
        username: data.username,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        assignedRoles: data.assignedRoles,
        permissions: data.permissions,
        permissionsMatrixJson: data.permissionsMatrixJson,
        permissionsMatrix: parsedMatrix,
        doctorId: data.doctorId,
        nurseId: data.nurseId,
        department: data.department,
        specialty: data.specialty,
        doctorIdCode: data.doctorIdCode,
        avatar: data.avatar,
        token: data.token,
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(authUser));
      setUser(authUser);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserPermissions = (permissionsMatrixJson: string, permissionsMatrix?: Record<string, Record<string, boolean>>) => {
    if (!user) return;
    let parsed = permissionsMatrix;
    if (!parsed && permissionsMatrixJson) {
      try {
        parsed = JSON.parse(permissionsMatrixJson);
      } catch { }
    }
    const updatedUser: AuthUser = {
      ...user,
      permissionsMatrixJson,
      permissionsMatrix: parsed,
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
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
        updateUserPermissions,
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
