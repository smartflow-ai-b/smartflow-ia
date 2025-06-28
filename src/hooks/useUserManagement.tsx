
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  is_blocked: boolean;
  blocked_by: string | null;
  blocked_reason: string | null;
  blocked_at: string | null;
  created_at: string;
  updated_at: string;
  user_roles?: { role: string }[] | null;
  projects?: { id: string; title: string; status: string }[] | null;
}

export const useUserManagement = () => {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Get all users (admin only)
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      // First get all users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Then get user roles and projects for each user
      const usersWithDetails = await Promise.all(
        (profilesData || []).map(async (profile) => {
          // Get user roles
          const { data: userRoles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id);

          // Get user projects
          const { data: userProjects } = await supabase
            .from('projects')
            .select('id, title, status')
            .eq('user_id', profile.id);

          return {
            ...profile,
            user_roles: userRoles || [],
            projects: userProjects || []
          };
        })
      );

      return usersWithDetails as UserProfile[];
    },
    enabled: isAdmin,
  });

  // Block/Unblock user
  const toggleBlockUserMutation = useMutation({
    mutationFn: async ({ 
      userId, 
      shouldBlock, 
      reason 
    }: { 
      userId: string; 
      shouldBlock: boolean; 
      reason?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const updates = shouldBlock 
        ? {
            is_blocked: true,
            blocked_by: user.id,
            blocked_reason: reason || 'Blocked by admin',
            blocked_at: new Date().toISOString()
          }
        : {
            is_blocked: false,
            blocked_by: null,
            blocked_reason: null,
            blocked_at: null
          };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });

  // Promote user to admin
  const promoteToAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'admin'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });

  // Remove admin role
  const removeAdminRoleMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });

  return {
    users,
    isLoading,
    toggleBlockUser: toggleBlockUserMutation.mutate,
    promoteToAdmin: promoteToAdminMutation.mutate,
    removeAdminRole: removeAdminRoleMutation.mutate,
    isUpdatingUser: toggleBlockUserMutation.isPending || 
                    promoteToAdminMutation.isPending || 
                    removeAdminRoleMutation.isPending,
  };
};
