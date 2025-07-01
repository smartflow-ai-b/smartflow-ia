import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useChatRequests = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Recupera richieste in arrivo e in uscita
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['chat_requests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('chat_requests')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Invia una richiesta di chat
  const sendRequest = useMutation({
    mutationFn: async (recipientId: string) => {
      if (!user) return;
      const { error } = await supabase
        .from('chat_requests')
        .insert({ sender_id: user.id, recipient_id: recipientId, status: 'pending' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat_requests', user?.id] });
    },
  });

  // Accetta una richiesta
  const acceptRequest = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('chat_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat_requests', user?.id] });
    },
  });

  // Rifiuta una richiesta
  const rejectRequest = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('chat_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat_requests', user?.id] });
    },
  });

  return { requests, isLoading, sendRequest, acceptRequest, rejectRequest };
};
