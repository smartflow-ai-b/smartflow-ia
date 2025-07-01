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
      // Prima prendi tutte le sessioni
      const { data: sessions, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('last_message_at', { ascending: false });
      if (error) throw error;
      // Poi prendi i profili degli utenti associati
      const userIds = (sessions || []).map(s => s.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds);
      // Unisci i dati
      // Filtra solo sessioni attive o in attesa
      const filtered = (sessions || []).filter(s => s.status === 'active' || s.status === 'waiting');
      // Tieni solo la sessione più recente per ogni utente
      const uniqueByUser = Object.values(
        filtered.reduce((acc, session) => {
          if (!acc[session.user_id] || new Date(session.last_message_at) > new Date(acc[session.user_id].last_message_at)) {
            acc[session.user_id] = session;
          }
          return acc;
        }, {} as Record<string, any>)
      );
      // Unisci i dati profilo
      const sessionsWithProfiles = uniqueByUser.map(session => ({
        ...session,
        profiles: profiles?.find(p => p.id === session.user_id) || null
      }));
      return sessionsWithProfiles;
    },
    enabled: isAdmin,
  });

  // Create new chat session (ora accetta userId come parametro)
  const createSessionMutation = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: userId,
          status: 'waiting'
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allChatSessions'] });
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
