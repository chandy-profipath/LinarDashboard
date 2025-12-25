import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Admin } from '@/types';

interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void; // Logout does not need to be async for the interface, but implementation will be async-ish
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active session
    const initializeAuth = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const adminData: Admin = {
          id: session.user.id,
          email: session.user.email!,
          full_name: session.user.user_metadata?.full_name || 'Admin',
          role: 'Administrator',
          last_login: new Date().toISOString()
        };
        setAdmin(adminData);
      }
      setIsLoading(false);
    };

    initializeAuth();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const adminData: Admin = {
          id: session.user.id,
          email: session.user.email!,
          full_name: session.user.user_metadata?.full_name || 'Admin',
          role: 'Administrator',
          last_login: new Date().toISOString()
        };
        setAdmin(adminData);
      } else {
        setAdmin(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // No extra table check needed
        return { success: true };
      }

      return { success: false, error: 'Login failed due to unknown error.' };

    } catch (err) {
      return { success: false, error: 'An error occurred during login' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setAdmin(null);
    localStorage.removeItem('linar_admin'); // Clean up old local storage if present
  };

  return (
    <AuthContext.Provider value={{ admin, isAuthenticated: !!admin, isLoading, login, logout }}>
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
