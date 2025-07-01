
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

// Stato globale per evitare inizializzazioni multiple
let globalAuthState: AuthState | null = null;
let authInitialized = false;
let authSubscription: any = null;

export const useSecureAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    if (globalAuthState) {
      return globalAuthState;
    }
    return {
      user: null,
      session: null,
      isAdmin: false,
      loading: true,
      error: null,
      loadingStep: 'Inizializzazione...'
    };
  });

  const updateAuthState = useCallback((newState: Partial<AuthState>) => {
    const updatedState = { ...authState, ...newState };
    globalAuthState = updatedState;
    setAuthState(updatedState);
  }, [authState]);

  const updateLoadingStep = useCallback((step: string) => {
    console.log('Auth step:', step);
    updateAuthState({ loadingStep: step });
  }, [updateAuthState]);

  const checkAdminRole = useCallback(async (userId: string): Promise<boolean> => {
    try {
      updateLoadingStep('Verifica privilegi amministratore...');
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
  }, [updateLoadingStep]);

  // Inizializzazione - SOLO UNA VOLTA
  useEffect(() => {
    if (authInitialized) {
      return;
    }
    
    authInitialized = true;
    
    const initializeAuth = async () => {
      try {
        updateLoadingStep('Controllo sessione Supabase...');
        
        // Setup listener - SOLO UNA VOLTA
        if (!authSubscription) {
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              console.log('Auth state changed:', event, session?.user?.id);
              
              if (event === 'SIGNED_OUT') {
                updateAuthState({
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
                updateAuthState({
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
          authSubscription = subscription;
        }

        // Controlla sessione corrente
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Errore sessione:', error);
          updateAuthState({
            loading: false,
            error: 'Errore nell\'autenticazione',
            loadingStep: 'Errore'
          });
          return;
        }

        if (session) {
          updateLoadingStep('Sessione trovata, verifica privilegi...');
          const isAdmin = await checkAdminRole(session.user.id);
          updateAuthState({
            user: session.user,
            session,
            isAdmin,
            loading: false,
            error: null,
            loadingStep: 'Autenticazione completata'
          });
        } else {
          updateAuthState({
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
        updateAuthState({
          loading: false,
          error: 'Errore critico',
          loadingStep: 'Errore critico'
        });
      }
    };

    initializeAuth();

    // Cleanup globale
    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
        authSubscription = null;
      }
      authInitialized = false;
    };
  }, [checkAdminRole, updateAuthState, updateLoadingStep]);

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    updateLoadingStep('Registrazione...');
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
    updateLoadingStep('Accesso...');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    updateLoadingStep('Disconnessione...');
    const { error } = await supabase.auth.signOut();
    if (!error) {
      globalAuthState = null;
      updateAuthState({
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
