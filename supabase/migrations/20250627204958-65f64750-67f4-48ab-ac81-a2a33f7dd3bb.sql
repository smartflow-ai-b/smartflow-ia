
-- Create system notifications table
CREATE TABLE public.system_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  admin_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'success', 'error'
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project updates table
CREATE TABLE public.project_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  admin_id UUID,
  update_type TEXT NOT NULL DEFAULT 'status_change', -- 'status_change', 'message', 'file_upload', 'milestone'
  title TEXT NOT NULL,
  message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project files table
CREATE TABLE public.project_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add blocked fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_blocked BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN blocked_by UUID,
ADD COLUMN blocked_reason TEXT,
ADD COLUMN blocked_at TIMESTAMP WITH TIME ZONE;

-- Add project status tracking fields
ALTER TABLE public.projects
ADD COLUMN preview_url TEXT,
ADD COLUMN live_url TEXT,
ADD COLUMN completion_percentage INTEGER DEFAULT 0;

-- Enable RLS on new tables
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for system_notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.system_notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can create notifications" 
  ON public.system_notifications 
  FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own notification read status" 
  ON public.system_notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id AND read_at IS NULL);

-- RLS Policies for project_updates
CREATE POLICY "Users can view updates for their projects" 
  ON public.project_updates 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_updates.project_id 
      AND projects.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can create project updates" 
  ON public.project_updates 
  FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for project_files
CREATE POLICY "Users can view files for their projects" 
  ON public.project_files 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_files.project_id 
      AND projects.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can upload project files" 
  ON public.project_files 
  FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create foreign key constraints
ALTER TABLE public.project_updates 
ADD CONSTRAINT project_updates_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

ALTER TABLE public.project_files 
ADD CONSTRAINT project_files_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_system_notifications_user_id ON public.system_notifications(user_id);
CREATE INDEX idx_system_notifications_read_at ON public.system_notifications(read_at);
CREATE INDEX idx_project_updates_project_id ON public.project_updates(project_id);
CREATE INDEX idx_project_files_project_id ON public.project_files(project_id);
CREATE INDEX idx_profiles_is_blocked ON public.profiles(is_blocked);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_files;

-- Set replica identity for realtime
ALTER TABLE public.system_notifications REPLICA IDENTITY FULL;
ALTER TABLE public.project_updates REPLICA IDENTITY FULL;
ALTER TABLE public.project_files REPLICA IDENTITY FULL;
