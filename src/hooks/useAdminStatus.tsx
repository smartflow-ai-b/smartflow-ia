
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

  // Get current admin status
  const { data: adminStatus } = useQuery({
    queryKey: ['adminStatus', user?.id],
    queryFn: async () => {
      if (!user || !isAdmin) return null;
      
      const { data, error } = await supabase
        .from('admin_status')
        .select('*')
        .eq('admin_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as AdminStatus | null;
    },
    enabled: !!user && isAdmin,
  });

  // Update admin status
  const updateStatusMutation = useMutation({
    mutationFn: async (status: 'available' | 'busy' | 'offline') => {
      if (!user || !isAdmin) throw new Error('Unauthorized');

      const { data, error } = await supabase
        .from('admin_status')
        .upsert({
          admin_id: user.id,
          status,
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

  return {
    adminStatus,
    updateStatus: updateStatusMutation.mutate,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
};
