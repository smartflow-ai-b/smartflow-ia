
-- Create chat sessions table
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, closed, waiting
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  sender_type TEXT NOT NULL, -- 'user', 'admin', 'system'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create admin status table
CREATE TABLE public.admin_status (
  admin_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'available', -- available, busy, offline
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_sessions
CREATE POLICY "Users can view their own chat sessions" 
  ON public.chat_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own chat sessions" 
  ON public.chat_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all chat sessions" 
  ON public.chat_sessions 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own chat sessions" 
  ON public.chat_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in their sessions" 
  ON public.chat_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE id = session_id 
      AND (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users can send messages in their sessions" 
  ON public.chat_messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE id = session_id 
      AND (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Admins can manage all messages" 
  ON public.chat_messages 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for admin_status
CREATE POLICY "Admins can view admin status" 
  ON public.admin_status 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage their own status" 
  ON public.admin_status 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin') AND auth.uid() = admin_id);

-- Function to create automatic welcome message
CREATE OR REPLACE FUNCTION public.create_welcome_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert welcome message when a new chat session is created
  INSERT INTO public.chat_messages (session_id, sender_id, message, sender_type)
  VALUES (
    NEW.id, 
    NEW.user_id, 
    'Ciao! Sono l''assistente virtuale di SmartFlow. Come posso aiutarti oggi?', 
    'system'
  );
  
  RETURN NEW;
END;
$$;

-- Trigger for automatic welcome message
CREATE TRIGGER on_chat_session_created
  AFTER INSERT ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.create_welcome_message();

-- Function to update session timestamp on new message
CREATE OR REPLACE FUNCTION public.update_session_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update last_message_at when a new message is added
  UPDATE public.chat_sessions 
  SET last_message_at = NEW.created_at, updated_at = now()
  WHERE id = NEW.session_id;
  
  RETURN NEW;
END;
$$;

-- Trigger to update session timestamp
CREATE TRIGGER on_message_created
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_session_timestamp();

-- Enable realtime for all chat tables
ALTER TABLE public.chat_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.admin_status REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_status;
