
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminRole = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error in checkAdminRole:', error);
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const updateUserState = async (currentSession: Session | null) => {
      if (!isMounted) return;
      
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const adminStatus = await checkAdminRole(currentUser.id);
          if (isMounted) {
            setIsAdmin(adminStatus);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          if (isMounted) {
            setIsAdmin(false);
          }
        }
      } else {
        if (isMounted) {
          setIsAdmin(false);
        }
      }
      
      if (isMounted) {
        setLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        await updateUserState(session);
      }
    );

    // Get initial session
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (isMounted) {
            setLoading(false);
          }
          return;
        }

        await updateUserState(session);
      } catch (error) {
        console.error('Error in initSession:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('SignOut error:', error);
        return { error };
      }
      
      // Reset state immediately
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      
      return { error: null };
    } catch (error) {
      console.error('Unexpected error during signOut:', error);
      return { error: error as Error };
    }
  };

  return {
    user,
    session,
    loading,
    isAdmin,
    signUp,
    signIn,
    signOut
  };
};
