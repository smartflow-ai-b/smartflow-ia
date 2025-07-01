import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Check, AlertCircle, Info, CheckCircle, X } from 'lucide-react';
import { useSystemNotifications } from '@/hooks/useSystemNotifications';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/hooks/useAuth';
import AdminSendNotificationModal from './AdminSendNotificationModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const NotificationCenter = () => {
  const { notifications, unreadCount, markAsRead, isMarkingAsRead } = useSystemNotifications();
  const { user, isAdmin } = useAuth ? useAuth() : { user: null, isAdmin: false };
  const [isOpen, setIsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const queryClient = useQueryClient();

  // Segna tutte le info come lette
  const markAllInfoAsRead = async () => {
    const infoIds = notifications.filter(n => n.type === 'info' && !n.read_at).map(n => n.id);
    for (const id of infoIds) {
      await markAsRead(id);
    }
  };

  // Elimina tutte le lette
  const deleteAllRead = async () => {
    const readIds = notifications.filter(n => n.read_at).map(n => n.id);
    for (const id of readIds) {
      await supabase.from('system_notifications').delete().eq('id', id);
    }
    queryClient.invalidateQueries({ queryKey: ['systemNotifications'] });
  };

  // Apertura notifica
  const [openNotif, setOpenNotif] = useState(null);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-l-red-500 bg-red-50';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50';
      case 'success': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };

  return (
    <div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="end">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifiche</CardTitle>
                {isAdmin && (
                  <Button size="sm" variant="outline" onClick={() => setModalOpen(true)}>
                    Invia notifica
                  </Button>
                )}
              </div>
            </CardHeader>
            <div className="flex gap-2 px-4 pb-2 border-b border-gray-100">
              <Button size="sm" variant="ghost" onClick={markAllInfoAsRead}>Segna info come lette</Button>
              <Button size="sm" variant="ghost" onClick={deleteAllRead}>Elimina lette</Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="ml-auto"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nessuna notifica</p>
                  </div>
                ) : (
                  <div className="space-y-2 p-4">
                    {notifications.map((notification) => (
                      <Card 
                        key={notification.id} 
                        className={`border-l-4 ${getNotificationColor(notification.type)} ${
                          !notification.read_at ? 'bg-opacity-100' : 'bg-opacity-50'
                        } cursor-pointer`}
                        onClick={() => setOpenNotif(notification)}
                      >
                        <CardContent className="p-3 flex items-center gap-2">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className={`font-medium text-sm ${!notification.read_at ? 'text-gray-900' : 'text-gray-600'}`}>{notification.title}</h4>
                              {!notification.read_at && <Badge variant="default">Nuova</Badge>}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{new Date(notification.created_at).toLocaleString('it-IT')}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
      {isAdmin && (
        <AdminSendNotificationModal open={modalOpen} onOpenChange={setModalOpen} />
      )}
      {/* Modal dettaglio notifica */}
      {openNotif && (
        <Dialog open={!!openNotif} onOpenChange={() => setOpenNotif(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{openNotif.title}</DialogTitle>
            </DialogHeader>
            <div className="mb-4 text-gray-700 whitespace-pre-line">{openNotif.message}</div>
            <div className="flex justify-end gap-2">
              {!openNotif.read_at && (
                <Button size="sm" onClick={() => { markAsRead(openNotif.id); setOpenNotif(null); }}>Segna come letta</Button>
              )}
              <Button size="sm" variant="destructive" onClick={async () => { await supabase.from('system_notifications').delete().eq('id', openNotif.id); setOpenNotif(null); queryClient.invalidateQueries({ queryKey: ['systemNotifications'] }); }}>Elimina</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default NotificationCenter;
