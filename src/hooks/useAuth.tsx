
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminRole = async (userId: string) => {
    try {
      console.log('Checking admin role for user:', userId);
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
      
      const adminStatus = !!data;
      console.log('Admin status result:', adminStatus);
      return adminStatus;
    } catch (error) {
      console.error('Error in checkAdminRole:', error);
      return false;
    }
  };

  // Separate function to handle session processing
  const processSession = async (session: Session | null, source: string) => {
    console.log(`Processing session from ${source}:`, session?.user?.email || 'No session');
    
    setSession(session);
    setUser(session?.user ?? null);
    
    if (session?.user) {
      try {
        const adminStatus = await checkAdminRole(session.user.id);
        console.log(`Setting admin status from ${source}:`, adminStatus, 'for user:', session.user.email);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error(`Error processing admin status from ${source}:`, error);
        setIsAdmin(false);
      }
    } else {
      console.log(`No session from ${source}, clearing admin status`);
      setIsAdmin(false);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    console.log('Setting up auth system...');
    let mounted = true;
    
    // Get initial session first
    const initializeAuth = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }
        
        if (mounted) {
          await processSession(session, 'initial');
        }
        
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (mounted) {
          await processSession(session, `auth_change_${event}`);
        }
      }
    );

    // Initialize auth state
    initializeAuth();

    return () => {
      mounted = false;
      console.log('Cleaning up auth subscription');
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
    console.log('Starting signIn process...');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('SignIn error:', error);
    } else {
      console.log('SignIn successful');
    }
    
    return { error };
  };

  const signOut = async () => {
    console.log('Starting signOut process...');
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase signOut error:', error);
        return { error };
      }
      
      console.log('Supabase signOut successful');
      
      // Clear local state immediately
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
