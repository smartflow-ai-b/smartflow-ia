import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useMessages = (sessionId: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Recupera i messaggi della chat
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!sessionId,
  });

  // Invia un nuovo messaggio
  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      if (!user || !sessionId) return;
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          message,
          sender_id: user.id,
          sender_type: 'user',
          session_id: sessionId,
          created_at: new Date().toISOString(),
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', sessionId] });
    },
  });

  return { messages, isLoading, sendMessage };
};
