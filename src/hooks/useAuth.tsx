import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserProfile } from '../types';
import { appwriteService } from '../services/appwriteService';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (phone: string, pword: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const profile = await appwriteService.getCurrentUser();
      setUser(profile);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (phone: string, pword: string) => {
    await appwriteService.login(phone, pword);
    await refreshUser();
  };

  const register = async (data: any) => {
    await appwriteService.register(data);
    await refreshUser();
  };

  const logout = async () => {
    await appwriteService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
