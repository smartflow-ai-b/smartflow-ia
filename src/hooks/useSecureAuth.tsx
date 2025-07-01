
import { useEffect, useState, useCallback, useRef } from 'react';
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
    loadingStep: 'Inizializzazione sistema autenticazione...'
  });

  // Refs per prevenire multiple inizializzazioni
  const initializationDone = useRef(false);
  const authSubscription = useRef<any>(null);
  const processingState = useRef(false);

  // Funzione per aggiornare il loading step
  const updateLoadingStep = useCallback((step: string) => {
    console.log('Auth step:', step);
    setAuthState(prev => ({ ...prev, loadingStep: step }));
  }, []);

  // Funzione per verificare i privilegi admin
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
  }, [updateLoadingStep]);

  // Funzione per salvare lo stato di autenticazione
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
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      updateLoadingStep('Stato autenticazione salvato');
    } catch (error) {
      console.error('Errore nel salvare lo stato di auth:', error);
    }
  }, [updateLoadingStep]);

  // Funzione per recuperare lo stato salvato
  const loadAuthFromStorage = useCallback((): { session: Session; isAdmin: boolean } | null => {
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
      return null;
    } catch (error) {
      console.error('Errore nel recuperare lo stato di auth:', error);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }, [updateLoadingStep]);

  // Funzione per finalizzare lo stato di autenticazione
  const finalizeAuthState = useCallback(async (session: Session | null) => {
    // Previeni chiamate multiple simultanee
    if (processingState.current) {
      console.log('Finalizzazione già in corso, salto...');
      return;
    }
    
    processingState.current = true;
    
    try {
      const user = session?.user ?? null;
      let isAdmin = false;
      
      if (user) {
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
    } finally {
      processingState.current = false;
    }
  }, [checkAdminRole, saveAuthState]);

  // Inizializzazione principale (solo una volta)
  useEffect(() => {
    if (initializationDone.current) {
      return;
    }
    
    initializationDone.current = true;
    
    const initializeAuth = async () => {
      try {
        updateLoadingStep('Controllo sessione Supabase...');
        
        // Setup del listener per i cambiamenti di stato
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.id);
            
            // Gestisci solo eventi importanti
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
              updateLoadingStep(`Evento autenticazione: ${event}`);
              
              // Usa un timeout per evitare chiamate immediate multiple
              setTimeout(async () => {
                await finalizeAuthState(session);
              }, 100);
            }
          }
        );
        
        authSubscription.current = subscription;

        // Controlla la sessione corrente
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Errore nel recupero sessione Supabase:', error);
          updateLoadingStep('Errore connessione Supabase, controllo dati locali...');
          
          const localAuth = loadAuthFromStorage();
          if (localAuth?.session) {
            await finalizeAuthState(localAuth.session);
          } else {
            await finalizeAuthState(null);
          }
          return;
        }

        if (currentSession) {
          updateLoadingStep('Sessione Supabase attiva, aggiornamento stato...');
          await finalizeAuthState(currentSession);
        } else {
          updateLoadingStep('Nessuna sessione Supabase, controllo dati locali...');
          const localAuth = loadAuthFromStorage();
          
          if (localAuth?.session) {
            updateLoadingStep('Validazione sessione locale...');
            try {
              const { data: userData, error: userError } = await supabase.auth.getUser(localAuth.session.access_token);
              
              if (!userError && userData.user) {
                updateLoadingStep('Sessione locale valida, ripristino...');
                await finalizeAuthState(localAuth.session);
              } else {
                updateLoadingStep('Sessione locale scaduta, rimozione...');
                localStorage.removeItem(STORAGE_KEY);
                await finalizeAuthState(null);
              }
            } catch {
              updateLoadingStep('Errore validazione sessione locale, rimozione...');
              localStorage.removeItem(STORAGE_KEY);
              await finalizeAuthState(null);
            }
          } else {
            await finalizeAuthState(null);
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
    };

    initializeAuth();

    // Cleanup
    return () => {
      if (authSubscription.current) {
        authSubscription.current.unsubscribe();
        authSubscription.current = null;
      }
    };
  }, []); // Dipendenze vuote per evitare re-inizializzazione

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
      
      // Pulisci lo storage locale
      localStorage.removeItem(STORAGE_KEY);
      
      // Disconnetti da Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Errore durante il logout:', error);
        updateLoadingStep('Errore durante la disconnessione');
        return { error };
      }
      
      // Aggiorna lo stato
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
