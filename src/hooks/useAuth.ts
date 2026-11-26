import { useState, useEffect, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { authService } from '../services/authService';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    authService.getSession().then((sess) => {
      if (mounted) {
        setSession(sess);
        setUser(sess?.user ?? null);
        setLoading(false);
      }
    });

    const { data: listener } = authService.onAuthStateChange((_event, sess) => {
      if (mounted) {
        setSession(sess);
        setUser(sess?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, pass: string) => {
    return authService.signIn(email, pass);
  }, []);

  const signUp = useCallback(async (email: string, pass: string, name?: string) => {
    return authService.signUp(email, pass, name);
  }, []);

  const signOut = useCallback(async () => {
    return authService.signOut();
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    return authService.resetPassword(email);
  }, []);

  return {
    user,
    session,
    loading,
    isAuthenticated: Boolean(user),
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
}
