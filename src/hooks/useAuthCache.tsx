
import { User } from '@supabase/supabase-js';

interface UserCacheData {
  user: User | null;
  isAdmin: boolean;
  email: string | null;
}

const AUTH_CACHE_KEY = 'smartflow-auth-cache';

export const useAuthCache = () => {
  const saveToCache = (user: User | null, isAdmin: boolean) => {
    try {
      const cacheData: UserCacheData = {
        user,
        isAdmin,
        email: user?.email || null
      };
      localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(cacheData));
      console.log('Auth data saved to cache:', { email: user?.email, isAdmin });
    } catch (error) {
      console.error('Error saving auth cache:', error);
    }
  };

  const loadFromCache = (): UserCacheData | null => {
    try {
      const cached = localStorage.getItem(AUTH_CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        console.log('Auth data loaded from cache:', { email: data.email, isAdmin: data.isAdmin });
        return data;
      }
    } catch (error) {
      console.error('Error loading auth cache:', error);
    }
    return null;
  };

  const clearCache = () => {
    try {
      localStorage.removeItem(AUTH_CACHE_KEY);
      console.log('Auth cache cleared');
    } catch (error) {
      console.error('Error clearing auth cache:', error);
    }
  };

  return {
    saveToCache,
    loadFromCache,
    clearCache
  };
};
