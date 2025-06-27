
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface AdminStatus {
  admin_id: string;
  status: 'available' | 'busy' | 'offline';
  last_seen_at: string;
  updated_at: string;
}

export const useAdminStatus = () => {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Get admin status
  const { data: adminStatus, isLoading } = useQuery({
    queryKey: ['adminStatus', user?.id],
    queryFn: async () => {
      if (!user || !isAdmin) return null;
      
      const { data, error } = await supabase
        .from('admin_status')
        .select('*')
        .eq('admin_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      // If no status exists, create one
      if (!data) {
        const { data: newStatus, error: insertError } = await supabase
          .from('admin_status')
          .insert({
            admin_id: user.id,
            status: 'available'
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newStatus as AdminStatus;
      }

      return data as AdminStatus;
    },
    enabled: !!(user && isAdmin),
  });

  // Update admin status
  const updateAdminStatusMutation = useMutation({
    mutationFn: async (newStatus: 'available' | 'busy' | 'offline') => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('admin_status')
        .upsert({
          admin_id: user.id,
          status: newStatus,
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStatus'] });
    },
  });

  // Update last seen timestamp
  const updateLastSeenMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('admin_status')
        .update({ 
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('admin_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStatus'] });
    },
  });

  return {
    adminStatus,
    isLoading,
    updateAdminStatus: updateAdminStatusMutation.mutate,
    updateLastSeen: updateLastSeenMutation.mutate,
    isUpdatingStatus: updateAdminStatusMutation.isPending,
  };
};
