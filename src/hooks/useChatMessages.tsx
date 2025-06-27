
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useEffect } from 'react';

export interface ChatMessage {
  id: string;
  session_id: string;
  sender_id: string;
  message: string;
  sender_type: 'user' | 'admin' | 'system';
  created_at: string;
  read_at: string | null;
}

export const useChatMessages = (sessionId: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get messages for a session
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chatMessages', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!sessionId,
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ 
      message, 
      senderType = 'user' 
    }: { 
      message: string; 
      senderType?: 'user' | 'admin' | 'system' 
    }) => {
      if (!user || !sessionId) throw new Error('Missing required data');

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          sender_id: user.id,
          message,
          sender_type: senderType
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', sessionId] });
    },
  });

  // Set up realtime subscription for messages
  useEffect(() => {
    if (!sessionId) return;

    console.log('Setting up realtime subscription for session:', sessionId);

    const channel = supabase
      .channel(`chat-messages-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('New message received via realtime:', payload);
          queryClient.invalidateQueries({ queryKey: ['chatMessages', sessionId] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [sessionId, queryClient]);

  return {
    messages,
    isLoading,
    sendMessage: sendMessageMutation.mutate,
    isSendingMessage: sendMessageMutation.isPending,
  };
};
