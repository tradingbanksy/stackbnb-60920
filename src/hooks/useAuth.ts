import { useState, useEffect, useCallback } from 'react';
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

const fetchUserRole = async (userId: string): Promise<UserRole> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }

    return (data?.role as UserRole) ?? null;
  } catch (err) {
    console.error('Error fetching user role:', err);
    return null;
  }
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Initialize auth state with session and role before setting isLoading to false
  const initializeAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const role = await fetchUserRole(session.user.id);
        setAuthState({
          session,
          user: session.user,
          role,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState({
          session: null,
          user: null,
          role: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    // Initialize auth on mount
    initializeAuth();

    // Set up auth state listener for subsequent changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Skip initial session event since we handle it in initializeAuth
        if (event === 'INITIAL_SESSION') return;

        if (session?.user) {
          // For sign in/token refresh, fetch role before updating state
          const role = await fetchUserRole(session.user.id);
          setAuthState({
            session,
            user: session.user,
            role,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setAuthState({
            session: null,
            user: null,
            role: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [initializeAuth]);

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
