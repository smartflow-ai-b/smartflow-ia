
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useSystemNotifications } from '@/hooks/useSystemNotifications';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Shield, 
  ShieldOff, 
  Crown, 
  UserMinus, 
  MessageSquare, 
  Search,
  AlertTriangle,
  Send
} from 'lucide-react';

const UserManagementInterface = () => {
  const { users, isLoading, toggleBlockUser, promoteToAdmin, removeAdminRole, isUpdatingUser } = useUserManagement();
  const { sendNotification, isSendingNotification } = useSystemNotifications();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [blockReason, setBlockReason] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'info' | 'warning' | 'success' | 'error'>('info');

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBlockUser = (userId: string, shouldBlock: boolean) => {
    toggleBlockUser({ 
      userId, 
      shouldBlock, 
      reason: shouldBlock ? blockReason : undefined 
    });
    setBlockReason('');
    toast({
      title: shouldBlock ? "Utente bloccato" : "Utente sbloccato",
      description: shouldBlock ? "L'utente è stato bloccato con successo" : "L'utente è stato sbloccato con successo"
    });
  };

  const handlePromoteUser = (userId: string, shouldPromote: boolean) => {
    if (shouldPromote) {
      promoteToAdmin(userId);
      toast({
        title: "Utente promosso",
        description: "L'utente è stato promosso ad amministratore"
      });
    } else {
      removeAdminRole(userId);
      toast({
        title: "Privilegi rimossi",
        description: "I privilegi di amministratore sono stati rimossi"
      });
    }
  };

  const handleSendNotification = (userId: string) => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci titolo e messaggio",
        variant: "destructive"
      });
      return;
    }

    sendNotification({
      userId,
      title: notificationTitle,
      message: notificationMessage,
      type: notificationType
    });

    setNotificationTitle('');
    setNotificationMessage('');
    setNotificationType('info');
    setSelectedUser(null);

    toast({
      title: "Notifica inviata",
      description: "La notifica è stata inviata con successo"
    });
  };

  const isUserAdmin = (user: any) => {
    return user.user_roles?.some((role: any) => role.role === 'admin');
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue-500 mx-auto mb-4"></div>
        <p>Caricamento utenti...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cerca utenti per email o nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Gestione Utenti ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold">
                            {user.first_name} {user.last_name}
                          </h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <div className="flex gap-2 mt-1">
                            {isUserAdmin(user) && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                Admin
                              </Badge>
                            )}
                            {user.is_blocked && (
                              <Badge variant="destructive">
                                Bloccato
                              </Badge>
                            )}
                            {user.projects && (
                              <Badge variant="outline">
                                {user.projects.length} progetti
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Send Notification */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Invia Notifica a {user.first_name} {user.last_name}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Tipo</label>
                                <Select value={notificationType} onValueChange={(value: any) => setNotificationType(value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="info">Informazione</SelectItem>
                                    <SelectItem value="success">Successo</SelectItem>
                                    <SelectItem value="warning">Avviso</SelectItem>
                                    <SelectItem value="error">Errore</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Titolo</label>
                                <Input
                                  value={notificationTitle}
                                  onChange={(e) => setNotificationTitle(e.target.value)}
                                  placeholder="Titolo della notifica"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Messaggio</label>
                                <Textarea
                                  value={notificationMessage}
                                  onChange={(e) => setNotificationMessage(e.target.value)}
                                  placeholder="Contenuto della notifica"
                                  rows={3}
                                />
                              </div>
                              <Button
                                onClick={() => handleSendNotification(user.id)}
                                disabled={isSendingNotification}
                                className="w-full"
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Invia Notifica
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Admin Toggle */}
                        <Button
                          variant={isUserAdmin(user) ? "destructive" : "default"}
                          size="sm"
                          onClick={() => handlePromoteUser(user.id, !isUserAdmin(user))}
                          disabled={isUpdatingUser}
                        >
                          {isUserAdmin(user) ? (
                            <UserMinus className="w-4 h-4" />
                          ) : (
                            <Crown className="w-4 h-4" />
                          )}
                        </Button>

                        {/* Block Toggle */}
                        {user.is_blocked ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBlockUser(user.id, false)}
                            disabled={isUpdatingUser}
                          >
                            <ShieldOff className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                              >
                                <Shield className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  <AlertTriangle className="w-5 h-5 inline mr-2 text-red-500" />
                                  Blocca Utente
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p>
                                  Stai per bloccare <strong>{user.first_name} {user.last_name}</strong>.
                                  L'utente non potrà più accedere al sistema.
                                </p>
                                <div>
                                  <label className="text-sm font-medium">Motivo del blocco</label>
                                  <Textarea
                                    value={blockReason}
                                    onChange={(e) => setBlockReason(e.target.value)}
                                    placeholder="Inserisci il motivo del blocco..."
                                    rows={3}
                                  />
                                </div>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleBlockUser(user.id, true)}
                                  disabled={isUpdatingUser}
                                  className="w-full"
                                >
                                  Conferma Blocco
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementInterface;
