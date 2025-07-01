
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

// Singleton pattern per evitare inizializzazioni multiple
class AuthManager {
  private static instance: AuthManager;
  private authState: AuthState;
  private listeners: Set<(state: AuthState) => void>;
  private subscription: any = null;
  private initialized = false;

  private constructor() {
    this.authState = {
      user: null,
      session: null,
      isAdmin: false,
      loading: true,
      error: null,
      loadingStep: 'Inizializzazione...'
    };
    this.listeners = new Set();
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  subscribe(callback: (state: AuthState) => void) {
    this.listeners.add(callback);
    
    // Se già inizializzato, invia subito lo stato corrente
    if (this.initialized) {
      callback(this.authState);
    } else {
      // Inizializza solo una volta
      this.initialize();
    }

    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.authState));
  }

  private updateState(updates: Partial<AuthState>) {
    this.authState = { ...this.authState, ...updates };
    this.notifyListeners();
  }

  private async checkAdminRole(userId: string): Promise<boolean> {
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
  }

  private async initialize() {
    if (this.initialized) return;
    
    this.initialized = true;
    console.log('Auth Manager: Inizializzazione UNICA');

    try {
      // Setup listener UNA SOLA VOLTA
      if (!this.subscription) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.id);
            
            if (event === 'SIGNED_OUT') {
              this.updateState({
                user: null,
                session: null,
                isAdmin: false,
                loading: false,
                error: null,
                loadingStep: 'Disconnesso'
              });
              return;
            }
            
            if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
              this.updateState({ loadingStep: 'Verifica privilegi amministratore...' });
              
              const isAdmin = await this.checkAdminRole(session.user.id);
              
              this.updateState({
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
        this.subscription = subscription;
      }

      // Controlla sessione corrente UNA SOLA VOLTA
      this.updateState({ loadingStep: 'Controllo sessione Supabase...' });
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Errore sessione:', error);
        this.updateState({
          loading: false,
          error: 'Errore nell\'autenticazione',
          loadingStep: 'Errore'
        });
        return;
      }

      if (session) {
        this.updateState({ loadingStep: 'Verifica privilegi amministratore...' });
        const isAdmin = await this.checkAdminRole(session.user.id);
        
        this.updateState({
          user: session.user,
          session,
          isAdmin,
          loading: false,
          error: null,
          loadingStep: 'Autenticazione completata'
        });
      } else {
        this.updateState({
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
      this.updateState({
        loading: false,
        error: 'Errore critico',
        loadingStep: 'Errore critico'
      });
    }
  }

  async signUp(email: string, password: string, firstName: string, lastName: string) {
    this.updateState({ loadingStep: 'Registrazione...', loading: true });
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
  }

  async signIn(email: string, password: string) {
    this.updateState({ loadingStep: 'Accesso...', loading: true });
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  }

  async signOut() {
    this.updateState({ loadingStep: 'Disconnessione...', loading: true });
    const { error } = await supabase.auth.signOut();
    if (!error) {
      this.updateState({
        user: null,
        session: null,
        isAdmin: false,
        loading: false,
        error: null,
        loadingStep: 'Disconnesso'
      });
    }
    return { error };
  }

  cleanup() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.initialized = false;
    this.listeners.clear();
  }
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

  useEffect(() => {
    const authManager = AuthManager.getInstance();
    const unsubscribe = authManager.subscribe(setAuthState);

    return unsubscribe;
  }, []);

  const authManager = AuthManager.getInstance();

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    isAdmin: authState.isAdmin,
    error: authState.error,
    loadingStep: authState.loadingStep,
    signUp: authManager.signUp.bind(authManager),
    signIn: authManager.signIn.bind(authManager),
    signOut: authManager.signOut.bind(authManager)
  };
};
