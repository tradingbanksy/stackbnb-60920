import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'host' | 'vendor' | 'user' | null;

interface AuthState {
  user: User | null;
  session: Session | null;
  role: UserRole;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          isAuthenticated: !!session?.user,
        }));

        // Defer role fetch to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setAuthState(prev => ({
            ...prev,
            role: null,
            isLoading: false,
          }));
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session?.user,
      }));

      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
      }

      setAuthState(prev => ({
        ...prev,
        role: (data?.role as UserRole) ?? null,
        isLoading: false,
      }));
    } catch (err) {
      console.error('Error fetching user role:', err);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const setUserRole = async (role: 'host' | 'vendor' | 'user'): Promise<{ error: string | null }> => {
    if (!authState.user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('user_roles')
      .upsert({ 
        user_id: authState.user.id, 
        role 
      }, { 
        onConflict: 'user_id,role' 
      });

    if (!error) {
      setAuthState(prev => ({ ...prev, role }));
    }

    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setAuthState({
      user: null,
      session: null,
      role: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  return {
    ...authState,
    setUserRole,
    signOut,
  };
};
