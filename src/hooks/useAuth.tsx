
import { useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  loadingStep: string;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isAdmin: false,
    loading: true,
    error: null,
    loadingStep: 'Inizializzazione...'
  });

  const checkAdminRole = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) {
        console.error('Errore verifica ruolo admin:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Errore in checkAdminRole:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        if (!isMounted) return;
        
        console.log('Auth step: Controllo sessione Supabase...');
        setAuthState(prev => ({ ...prev, loadingStep: 'Controllo sessione Supabase...' }));

        // Controlla sessione corrente UNA SOLA VOLTA
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error('Errore sessione:', error);
          setAuthState({
            user: null,
            session: null,
            isAdmin: false,
            loading: false,
            error: 'Errore nell\'autenticazione',
            loadingStep: 'Errore'
          });
          return;
        }

        if (session) {
          console.log('Auth step: Verifica privilegi amministratore...');
          setAuthState(prev => ({ ...prev, loadingStep: 'Verifica privilegi amministratore...' }));
          
          const isAdmin = await checkAdminRole(session.user.id);
          
          if (!isMounted) return;
          
          console.log('Auth step: Autenticazione completata');
          setAuthState({
            user: session.user,
            session,
            isAdmin,
            loading: false,
            error: null,
            loadingStep: 'Autenticazione completata'
          });
        } else {
          console.log('Auth step: Non autenticato');
          setAuthState({
            user: null,
            session: null,
            isAdmin: false,
            loading: false,
            error: null,
            loadingStep: 'Non autenticato'
          });
        }
      } catch (error) {
        console.error('Errore inizializzazione auth:', error);
        if (!isMounted) return;
        setAuthState({
          user: null,
          session: null,
          isAdmin: false,
          loading: false,
          error: 'Errore critico',
          loadingStep: 'Errore critico'
        });
      }
    };

    // Setup listener per cambiamenti di stato
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            session: null,
            isAdmin: false,
            loading: false,
            error: null,
            loadingStep: 'Disconnesso'
          });
          return;
        }
        
        if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          const isAdmin = await checkAdminRole(session.user.id);
          if (!isMounted) return;
          
          setAuthState({
            user: session.user,
            session,
            isAdmin,
            loading: false,
            error: null,
            loadingStep: 'Autenticazione completata'
          });
        }
      }
    );

    // Inizializza DOPO aver impostato il listener
    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [checkAdminRole]);

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    setAuthState(prev => ({ ...prev, loadingStep: 'Registrazione...', loading: true }));
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loadingStep: 'Accesso...', loading: true }));
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loadingStep: 'Disconnessione...', loading: true }));
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setAuthState({
        user: null,
        session: null,
        isAdmin: false,
        loading: false,
        error: null,
        loadingStep: 'Disconnesso'
      });
    }
    return { error };
  };

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    isAdmin: authState.isAdmin,
    error: authState.error,
    loadingStep: authState.loadingStep,
    signUp,
    signIn,
    signOut
  };
};
