import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token on app start
    checkAuthToken();
  }, []);

  const checkAuthToken = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        // Validate token and fetch user data
        // For now, we'll just set a mock user
        setUser({
          id: '1',
          username: 'demo_user',
          email: 'demo@polyverse.com',
          bio: 'Demo user for PolyVerse mobile app',
        });
      }
    } catch (error) {
      console.error('Error checking auth token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    // Mock login - replace with actual API call
    if (email === 'demo@polyverse.com' && password === 'demo123') {
      const mockUser = {
        id: '1',
        username: 'demo_user',
        email: 'demo@polyverse.com',
        bio: 'Demo user for PolyVerse mobile app',
      };
      
      await SecureStore.setItemAsync('authToken', 'mock-jwt-token');
      setUser(mockUser);
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('authToken');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}