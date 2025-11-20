import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Profile } from '@shared/schema';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Mock sign in - in real app, this would call Supabase
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if user exists in localStorage (from previous signup)
    const existingUser = localStorage.getItem(`user_${email}`);
    let mockUser: Profile;
    
    if (existingUser) {
      mockUser = JSON.parse(existingUser);
    } else {
      // Default to patient role if no user found
      mockUser = {
        id: crypto.randomUUID(),
        email,
        fullName: 'Demo User',
        role: 'patient',
        dateOfBirth: '1990-01-01',
        gender: 'Other',
        healthcareNumber: 'HC123456',
      };
    }
    
    setUser(mockUser);
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    setLoading(false);
  };

  const signUp = async (email: string, password: string, fullName: string, role: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUser: Profile = {
      id: crypto.randomUUID(),
      email,
      fullName,
      role,
      dateOfBirth: null,
      gender: null,
      healthcareNumber: null,
    };
    
    // Store user by email for future sign-ins
    localStorage.setItem(`user_${email}`, JSON.stringify(mockUser));
    setUser(mockUser);
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    setLoading(false);
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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
