
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuthCache } from './useAuthCache';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const { saveToCache, loadFromCache, clearCache } = useAuthCache();

  const checkAdminRole = async (userId: string, retryCount = 0): Promise<boolean> => {
    try {
      console.log('Checking admin role for user:', userId, 'attempt:', retryCount + 1);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) {
        console.error('Error checking admin role:', error);
        // Se fallisce e abbiamo dati cached, usa quelli
        if (retryCount === 0) {
          const cached = loadFromCache();
          if (cached && cached.user?.id === userId) {
            console.log('Using cached admin status:', cached.isAdmin);
            return cached.isAdmin;
          }
        }
        return false;
      }
      
      const adminStatus = !!data;
      console.log('Admin status result:', adminStatus);
      return adminStatus;
    } catch (error) {
      console.error('Error in checkAdminRole:', error);
      
      // Retry una volta, poi usa cached data se disponibile
      if (retryCount < 1) {
        console.log('Retrying admin role check...');
        return checkAdminRole(userId, retryCount + 1);
      }
      
      const cached = loadFromCache();
      if (cached && cached.user?.id === userId) {
        console.log('Using cached admin status after error:', cached.isAdmin);
        return cached.isAdmin;
      }
      
      return false;
    }
  };

  const updateUserState = async (currentSession: Session | null) => {
    console.log('Updating user state with session:', currentSession?.user?.email || 'No session');
    
    setSession(currentSession);
    const currentUser = currentSession?.user ?? null;
    setUser(currentUser);
    
    if (currentUser) {
      try {
        const adminStatus = await checkAdminRole(currentUser.id);
        setIsAdmin(adminStatus);
        
        // Salva nel cache
        saveToCache(currentUser, adminStatus);
        
        console.log('User state updated:', { 
          email: currentUser.email, 
          isAdmin: adminStatus 
        });
      } catch (error) {
        console.error('Error updating user state:', error);
        // In caso di errore, usa i dati cached
        const cached = loadFromCache();
        if (cached && cached.user?.id === currentUser.id) {
          setIsAdmin(cached.isAdmin);
          console.log('Used cached admin status due to error');
        }
      }
    } else {
      console.log('No session, clearing all states');
      setIsAdmin(false);
      clearCache();
    }
    
    setLoading(false);
  };

  useEffect(() => {
    console.log('Initializing auth system...');
    
    // Prima carica i dati cached per avere uno stato immediato
    const cached = loadFromCache();
    if (cached && cached.user) {
      console.log('Loading cached auth data immediately');
      setUser(cached.user);
      setIsAdmin(cached.isAdmin);
      setLoading(false); // Imposta loading a false immediatamente per evitare loading infinito
    }

    let isMounted = true;

    // Imposta il listener per i cambiamenti di stato
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change event:', event, 'Session:', session?.user?.email || 'No session');
        
        if (isMounted) {
          await updateUserState(session);
        }
      }
    );

    // Verifica la sessione corrente
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

        console.log('Initial session retrieved:', session?.user?.email || 'No session found');
        
        if (isMounted) {
          // Solo aggiorna se non abbiamo già dati cached o se la sessione è diversa
          if (!cached || cached.user?.id !== session?.user?.id) {
            await updateUserState(session);
          }
        }
        
      } catch (error) {
        console.error('Error in initSession:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Avvia l'inizializzazione
    initSession();

    return () => {
      console.log('Cleaning up auth subscription');
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
      
      // Pulisci immediatamente lo stato locale e la cache
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      clearCache();
      
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
