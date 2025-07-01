-- MIGRATION: Permessi admin su notifiche di sistema

-- Permetti agli admin di aggiornare qualsiasi notifica
CREATE POLICY "Admins can update any notification"
  ON public.system_notifications
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Permetti agli admin di eliminare qualsiasi notifica
CREATE POLICY "Admins can delete any notification"
  ON public.system_notifications
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));
