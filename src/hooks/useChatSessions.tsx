
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ChatSession {
  id: string;
  user_id: string;
  admin_id: string | null;
  status: 'active' | 'closed' | 'waiting';
  created_at: string;
  updated_at: string;
  last_message_at: string;
}

export const useChatSessions = () => {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Get user's current chat session
  const { data: currentSession, isLoading: isLoadingSession } = useQuery({
    queryKey: ['chatSession', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as ChatSession | null;
    },
    enabled: !!user && !isAdmin,
  });

  // Get all sessions for admin
  const { data: allSessions, isLoading: isLoadingAllSessions } = useQuery({
    queryKey: ['allChatSessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select(`
          *,
          profiles!chat_sessions_user_id_fkey (
            first_name,
            last_name,
            email
          )
        `)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Create new chat session
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatSession'] });
    },
  });

  // Update session status
  const updateSessionMutation = useMutation({
    mutationFn: async ({ sessionId, status, adminId }: { 
      sessionId: string; 
      status: string; 
      adminId?: string 
    }) => {
      const updates: any = { status, updated_at: new Date().toISOString() };
      if (adminId !== undefined) {
        updates.admin_id = adminId;
      }

      const { data, error } = await supabase
        .from('chat_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatSession'] });
      queryClient.invalidateQueries({ queryKey: ['allChatSessions'] });
    },
  });

  return {
    currentSession,
    allSessions,
    isLoadingSession,
    isLoadingAllSessions,
    createSession: createSessionMutation.mutate,
    updateSession: updateSessionMutation.mutate,
    isCreatingSession: createSessionMutation.isPending,
    isUpdatingSession: updateSessionMutation.isPending,
  };
};
