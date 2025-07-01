import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useEffect } from 'react';

export interface SystemNotification {
  id: string;
  user_id: string;
  admin_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

// Variabile globale per memorizzare il canale per utente
const globalNotificationChannels: Record<string, any> = {};

export const useSystemNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const channelName = user ? `notifications-${user.id}` : null;

  // Get user notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['systemNotifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('system_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SystemNotification[];
    },
    enabled: !!user,
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('system_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemNotifications'] });
    },
  });

  // Send notification (admin only)
  const sendNotificationMutation = useMutation({
    mutationFn: async ({ 
      userId, 
      title, 
      message, 
      type = 'info' 
    }: { 
      userId: string; 
      title: string; 
      message: string; 
      type?: 'info' | 'warning' | 'success' | 'error';
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('system_notifications')
        .insert({
          user_id: userId,
          admin_id: user.id,
          title,
          message,
          type
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemNotifications'] });
    },
  });

  // Real-time subscription
  useEffect(() => {
    if (!user || !channelName) return;
    if (globalNotificationChannels[user.id]) return;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*', // ascolta tutti gli eventi
          schema: 'public',
          table: 'system_notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['systemNotifications'] });
        }
      )
      .subscribe();
    globalNotificationChannels[user.id] = channel;
    return () => {
      if (globalNotificationChannels[user.id]) {
        supabase.removeChannel(globalNotificationChannels[user.id]);
        delete globalNotificationChannels[user.id];
      }
    };
  }, [channelName, user, queryClient]);

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    sendNotification: sendNotificationMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isSendingNotification: sendNotificationMutation.isPending,
  };
};
