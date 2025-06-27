
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useEffect } from 'react';

export interface ProjectUpdate {
  id: string;
  project_id: string;
  admin_id: string | null;
  update_type: string;
  title: string;
  message: string | null;
  metadata: any;
  created_at: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number | null;
  uploaded_by: string;
  uploaded_at: string;
}

export const useProjectTracking = (projectId?: string) => {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Get project updates
  const { data: updates = [], isLoading: isLoadingUpdates } = useQuery({
    queryKey: ['projectUpdates', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('project_updates')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProjectUpdate[];
    },
    enabled: !!projectId,
  });

  // Get project files
  const { data: files = [], isLoading: isLoadingFiles } = useQuery({
    queryKey: ['projectFiles', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('project_files')
        .select('*')
        .eq('project_id', projectId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      return data as ProjectFile[];
    },
    enabled: !!projectId,
  });

  // Add project update (admin only)
  const addUpdateMutation = useMutation({
    mutationFn: async ({ 
      title, 
      message, 
      updateType = 'message',
      metadata = {} 
    }: { 
      title: string; 
      message?: string; 
      updateType?: string;
      metadata?: any;
    }) => {
      if (!user || !projectId) throw new Error('Missing required data');

      const { data, error } = await supabase
        .from('project_updates')
        .insert({
          project_id: projectId,
          admin_id: user.id,
          update_type: updateType,
          title,
          message,
          metadata
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectUpdates', projectId] });
    },
  });

  // Update project status
  const updateProjectMutation = useMutation({
    mutationFn: async (updates: { 
      status?: string; 
      completion_percentage?: number;
      preview_url?: string;
      live_url?: string;
    }) => {
      if (!projectId) throw new Error('No project ID');

      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Real-time subscription for updates
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`project-updates-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_updates',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['projectUpdates', projectId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

  return {
    updates,
    files,
    isLoadingUpdates,
    isLoadingFiles,
    addUpdate: addUpdateMutation.mutate,
    updateProject: updateProjectMutation.mutate,
    isAddingUpdate: addUpdateMutation.isPending,
    isUpdatingProject: updateProjectMutation.isPending,
  };
};
