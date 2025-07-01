import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useChats = () => {
  const { user } = useAuth();

  // Adattato alla struttura attuale: chat_sessions e chat_messages
  const { data: chats = [], isLoading } = useQuery({
    queryKey: ['chats', user?.id],
    queryFn: async () => {
      if (!user) return [];
      // Recupera tutte le chat dove l'utente è coinvolto (come user o admin)
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .or(`user_id.eq.${user.id},admin_id.eq.${user.id}`);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  return { chats, isLoading };
};
