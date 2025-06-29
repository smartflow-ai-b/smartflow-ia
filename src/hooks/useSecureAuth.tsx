
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

const STORAGE_KEY = 'smartflow-auth-state';

export const useSecureAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isAdmin: false,
    loading: true,
    error: null,
    loadingStep: 'Inizializzazione...'
  });

  const updateLoadingStep = (step: string) => {
    console.log('Auth step:', step);
    setAuthState(prev => ({ ...prev, loadingStep: step }));
  };

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
      
      const isAdmin = !!data;
      updateLoadingStep(isAdmin ? 'Privilegi amministratore confermati' : 'Utente standard');
      return isAdmin;
    } catch (error) {
      console.error('Errore in checkAdminRole:', error);
      return false;
    }
  }, []);

  const saveAuthState = useCallback((session: Session | null, isAdmin: boolean = false) => {
    try {
      updateLoadingStep('Salvataggio stato autenticazione...');
      if (session) {
        const authData = {
          session: session,
          isAdmin: isAdmin,
          timestamp: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
        updateLoadingStep('Stato autenticazione salvato');
      } else {
        localStorage.removeItem(STORAGE_KEY);
        updateLoadingStep('Stato autenticazione rimosso');
      }
    } catch (error) {
      console.error('Errore nel salvare lo stato di auth:', error);
    }
  }, []);

  const loadAuthFromStorage = useCallback(() => {
    try {
      updateLoadingStep('Recupero dati di autenticazione locali...');
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        
        // Controlla se i dati sono troppo vecchi (più di 24 ore)
        const maxAge = 24 * 60 * 60 * 1000;
        if (Date.now() - parsedData.timestamp > maxAge) {
          updateLoadingStep('Dati locali scaduti, rimozione...');
          localStorage.removeItem(STORAGE_KEY);
          return null;
        }
        
        updateLoadingStep('Dati locali recuperati con successo');
        return {
          session: parsedData.session,
          isAdmin: parsedData.isAdmin || false
        };
      }
      updateLoadingStep('Nessun dato locale trovato');
      return null;
    } catch (error) {
      console.error('Errore nel recuperare lo stato di auth:', error);
      updateLoadingStep('Errore nel recupero dati locali');
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }, []);

  const updateAuthState = useCallback(async (session: Session | null, skipAdminCheck = false) => {
    try {
      const user = session?.user ?? null;
      let isAdmin = false;
      
      if (user && !skipAdminCheck) {
        isAdmin = await checkAdminRole(user.id);
      }
      
      saveAuthState(session, isAdmin);
      
      setAuthState({
        user,
        session,
        isAdmin,
        loading: false,
        error: null,
        loadingStep: session ? 'Autenticazione completata' : 'Non autenticato'
      });
    } catch (error) {
      console.error('Errore nell\'aggiornamento dello stato di auth:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Errore nell\'autenticazione',
        loadingStep: 'Errore durante l\'autenticazione'
      }));
    }
  }, [checkAdminRole, saveAuthState]);

  const initializeAuth = useCallback(async () => {
    try {
      updateLoadingStep('Controllo sessione Supabase...');
      
      // Prima controlla la sessione corrente in Supabase
      const { data: { session: supabaseSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Errore nel recupero sessione Supabase:', error);
        updateLoadingStep('Errore connessione Supabase, controllo dati locali...');
        
        // Se c'è un errore con Supabase, prova con i dati locali
        const localAuth = loadAuthFromStorage();
        if (localAuth?.session) {
          await updateAuthState(localAuth.session, false);
        } else {
          await updateAuthState(null);
        }
        return;
      }

      if (supabaseSession) {
        updateLoadingStep('Sessione Supabase attiva, aggiornamento stato...');
        await updateAuthState(supabaseSession);
      } else {
        updateLoadingStep('Nessuna sessione Supabase, controllo dati locali...');
        const localAuth = loadAuthFromStorage();
        
        if (localAuth?.session) {
          updateLoadingStep('Validazione sessione locale...');
          try {
            // Verifica se la sessione locale è ancora valida
            const { data: userData, error: userError } = await supabase.auth.getUser(localAuth.session.access_token);
            
            if (!userError && userData.user) {
              updateLoadingStep('Sessione locale valida, ripristino...');
              await updateAuthState(localAuth.session);
            } else {
              updateLoadingStep('Sessione locale scaduta, rimozione...');
              localStorage.removeItem(STORAGE_KEY);
              await updateAuthState(null);
            }
          } catch {
            updateLoadingStep('Errore validazione sessione locale, rimozione...');
            localStorage.removeItem(STORAGE_KEY);
            await updateAuthState(null);
          }
        } else {
          await updateAuthState(null);
        }
      }
    } catch (error) {
      console.error('Errore nell\'inizializzazione auth:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Errore critico nell\'inizializzazione',
        loadingStep: 'Errore critico'
      }));
    }
  }, [loadAuthFromStorage, updateAuthState]);

  useEffect(() => {
    let isMounted = true;
    
    // Setup del listener per i cambiamenti di stato di auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('Auth state changed:', event, session?.user?.id);
        updateLoadingStep(`Evento autenticazione: ${event}`);
        
        // Piccolo delay per evitare race conditions
        setTimeout(async () => {
          if (isMounted) {
            await updateAuthState(session);
          }
        }, 100);
      }
    );

    // Inizializza l'autenticazione
    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [updateAuthState, initializeAuth]);

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    updateLoadingStep('Registrazione in corso...');
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
    
    if (error) {
      updateLoadingStep('Errore durante la registrazione');
    } else {
      updateLoadingStep('Registrazione completata');
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    updateLoadingStep('Accesso in corso...');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      updateLoadingStep('Errore durante l\'accesso');
    } else {
      updateLoadingStep('Accesso completato');
    }
    
    return { error };
  };

  const signOut = async () => {
    try {
      updateLoadingStep('Disconnessione in corso...');
      const { error } = await supabase.auth.signOut();
      
      localStorage.removeItem(STORAGE_KEY);
      
      if (error) {
        console.error('Errore durante il logout:', error);
        updateLoadingStep('Errore durante la disconnessione');
        return { error };
      }
      
      setAuthState({
        user: null,
        session: null,
        isAdmin: false,
        loading: false,
        error: null,
        loadingStep: 'Disconnesso'
      });
      
      return { error: null };
    } catch (error) {
      console.error('Errore imprevisto durante il logout:', error);
      updateLoadingStep('Errore imprevisto durante la disconnessione');
      return { error: error as Error };
    }
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
