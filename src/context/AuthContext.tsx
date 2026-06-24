import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '@/services/supabase/client';

type User = {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name: string;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, password?: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      setUser({
        id: userId,
        email,
        role: data.role as 'admin' | 'user',
        name: data.full_name || email.split('@')[0]
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Currently simulating passwordless or using a generic password for demo logic.
  // In a real app with pure email signup, you either use magic links or collect a password.
  // We will collect a generic password for demo, or you can implement Supabase Magic Links.
  // Let's use a dummy password for the demo to satisfy "email" only params in the UI.
  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: password || 'ImpactHero123!' // Fallback for any legacy tests
    });
    if (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const signup = async (email: string, password?: string, fullName?: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: password || 'ImpactHero123!',
      options: {
        data: {
          full_name: fullName || email.split('@')[0]
        }
      }
    });
    if (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    setIsLoading(false);
    if (error) throw error;
  };

  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, forgotPassword }}>
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
