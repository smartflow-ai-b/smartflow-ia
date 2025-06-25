
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

  // Funzione per aggiornare tutti gli stati dell'utente
  const updateUserState = async (currentSession: Session | null) => {
    console.log('Updating user state with session:', currentSession?.user?.email || 'No session');
    
    setSession(currentSession);
    setUser(currentSession?.user ?? null);
    
    if (currentSession?.user) {
      try {
        const adminStatus = await checkAdminRole(currentSession.user.id);
        console.log('Setting admin status:', adminStatus, 'for user:', currentSession.user.email);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    } else {
      console.log('No session, clearing all states');
      setIsAdmin(false);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    console.log('Initializing auth system...');
    
    let mounted = true;
    let authInitialized = false;

    // Funzione per inizializzare l'autenticazione
    const initializeAuth = async () => {
      try {
        console.log('Getting current session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        console.log('Session retrieved:', session?.user?.email || 'No session found');
        
        if (mounted && !authInitialized) {
          authInitialized = true;
          await updateUserState(session);
        }
        
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Listener per i cambiamenti di stato dell'autenticazione
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change event:', event, 'Session:', session?.user?.email || 'No session');
        
        if (mounted) {
          // Per eventi che non sono INITIAL_SESSION, aggiorna sempre
          if (event !== 'INITIAL_SESSION') {
            await updateUserState(session);
          }
          // Per INITIAL_SESSION, aggiorna solo se non è già stato inizializzato
          else if (!authInitialized) {
            authInitialized = true;
            await updateUserState(session);
          }
        }
      }
    );

    // Inizializza immediatamente
    initializeAuth();

    return () => {
      console.log('Cleaning up auth subscription');
      mounted = false;
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
      console.log('SignIn successful, auth state will update automatically');
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
      
      // Pulisci immediatamente lo stato locale
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
