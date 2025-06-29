
import { useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

const STORAGE_KEY = 'smartflow-auth-state';

export const useSecureAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isAdmin: false,
    loading: true,
    error: null
  });

  // Funzione per salvare lo stato di auth nel localStorage
  const saveAuthState = useCallback((session: Session | null, isAdmin: boolean = false) => {
    try {
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
    } catch (error) {
      console.error('Errore nel salvare lo stato di auth:', error);
    }
  }, []);

  // Funzione per recuperare lo stato di auth dal localStorage
  const loadAuthState = useCallback(async (): Promise<{ session: Session | null; isAdmin: boolean }> => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        
        // Controlla se i dati sono troppo vecchi (più di 24 ore)
        const maxAge = 24 * 60 * 60 * 1000; // 24 ore
        if (Date.now() - parsedData.timestamp > maxAge) {
          localStorage.removeItem(STORAGE_KEY);
          return { session: null, isAdmin: false };
        }
        
        return {
          session: parsedData.session,
          isAdmin: parsedData.isAdmin || false
        };
      }
    } catch (error) {
      console.error('Errore nel recuperare lo stato di auth:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
    
    return { session: null, isAdmin: false };
  }, []);

  // Funzione per verificare il ruolo admin
  const checkAdminRole = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) {
        console.error('Errore nella verifica ruolo admin:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Errore in checkAdminRole:', error);
      return false;
    }
  }, []);

  // Funzione per aggiornare lo stato di autenticazione
  const updateAuthState = useCallback(async (session: Session | null) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const user = session?.user ?? null;
      let isAdmin = false;
      
      if (user) {
        isAdmin = await checkAdminRole(user.id);
      }
      
      // Salva lo stato nel localStorage
      saveAuthState(session, isAdmin);
      
      setAuthState({
        user,
        session,
        isAdmin,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Errore nell\'aggiornamento dello stato di auth:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Errore nell\'autenticazione'
      }));
    }
  }, [checkAdminRole, saveAuthState]);

  // Funzione per recuperare e validare la sessione
  const recoverSession = useCallback(async () => {
    try {
      // Prima controlla il localStorage
      const localAuth = await loadAuthState();
      
      // Poi controlla con Supabase per validare la sessione
      const { data: { session: supabaseSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Errore nel recupero sessione Supabase:', error);
        // Se c'è un errore, usa i dati locali se disponibili
        if (localAuth.session) {
          await updateAuthState(localAuth.session);
          return;
        }
      }
      
      // Se le sessioni non corrispondono, usa quella di Supabase (più aggiornata)
      if (supabaseSession) {
        await updateAuthState(supabaseSession);
      } else if (localAuth.session) {
        // Se Supabase non ha sessione ma localStorage sì, verifica se è ancora valida
        try {
          const { data: user } = await supabase.auth.getUser(localAuth.session.access_token);
          if (user.user) {
            await updateAuthState(localAuth.session);
          } else {
            // Token non valido, rimuovi dai dati locali
            localStorage.removeItem(STORAGE_KEY);
            await updateAuthState(null);
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY);
          await updateAuthState(null);
        }
      } else {
        await updateAuthState(null);
      }
    } catch (error) {
      console.error('Errore nel recupero della sessione:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Errore nel recupero della sessione'
      }));
    }
  }, [loadAuthState, updateAuthState]);

  // Inizializzazione e setup dei listener
  useEffect(() => {
    let isMounted = true;
    
    // Setup del listener per i cambiamenti di stato di auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('Auth state changed:', event, session?.user?.id);
        await updateAuthState(session);
      }
    );

    // Recupera la sessione iniziale
    recoverSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [updateAuthState, recoverSession]);

  // Funzioni di autenticazione
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
      
      // Rimuovi sempre i dati locali
      localStorage.removeItem(STORAGE_KEY);
      
      if (error) {
        console.error('Errore durante il logout:', error);
        return { error };
      }
      
      // Reset immediato dello stato
      setAuthState({
        user: null,
        session: null,
        isAdmin: false,
        loading: false,
        error: null
      });
      
      return { error: null };
    } catch (error) {
      console.error('Errore imprevisto durante il logout:', error);
      return { error: error as Error };
    }
  };

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    isAdmin: authState.isAdmin,
    error: authState.error,
    signUp,
    signIn,
    signOut,
    recoverSession
  };
};
