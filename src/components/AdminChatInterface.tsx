import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Send, User, Bot, MessageSquare, Clock, CheckCircle, XCircle, Plus, Circle } from 'lucide-react';
import { useAdminChatManager } from '@/hooks/useAdminChatManager';
import { useUserManagement } from '@/hooks/useUserManagement';
import type { ChatSession } from '@/hooks/useChatSessions';

const AdminChatInterface = () => {
  const [message, setMessage] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    allSessions,
    selectedSessionId,
    messages,
    unreadCounts,
    adminStatus,
    isLoadingAllSessions,
    isSendingMessage,
    handleSelectSession,
    handleSendAdminMessage,
    handleCloseSession,
    handleTakeSession,
    toggleAdminStatus,
    handleStartNewSession
  } = useAdminChatManager();

  const { users, isLoading: isLoadingUsers } = useUserManagement();
  const selectedSession = allSessions.find(s => s.id === selectedSessionId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSendingMessage) return;
    handleSendAdminMessage(message);
    setMessage('');
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getSessionStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Attiva';
      case 'waiting': return 'In Attesa';
      case 'closed': return 'Chiusa';
      default: return status;
    }
  };

  // Ottieni anteprima ultimo messaggio
  const getLastMessagePreview = (session: ChatSession) => {
    if (!session.last_message) return '';
    return session.last_message.length > 30 ? session.last_message.slice(0, 30) + '…' : session.last_message;
  };

  return (
    <div className="h-[700px] flex gap-4">
      {/* Lista conversazioni */}
      <Card className="w-1/3 glass-card flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Conversazioni</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleAdminStatus}
                size="icon"
                variant={adminStatus?.status === 'available' ? 'default' : 'secondary'}
                className="rounded-full"
                title={adminStatus?.status === 'available' ? 'Disponibile' : 'Occupato'}
              >
                {adminStatus?.status === 'available' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              </Button>
              <Button size="icon" variant="outline" className="rounded-full" onClick={() => setShowNewChat(true)} title="Nuova conversazione">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 flex flex-col">
          <ScrollArea className="flex-1">
            {isLoadingAllSessions ? (
              <div className="p-4 text-center text-gray-500">Caricamento…</div>
            ) : allSessions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Nessuna conversazione</div>
            ) : (
              <div className="space-y-1 p-2">
                {allSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 ${selectedSessionId === session.id ? 'bg-electric-blue-50 ring-2 ring-electric-blue-400' : ''}`}
                    onClick={() => handleSelectSession(session.id)}
                  >
                    <div className="relative">
                      <User className="w-8 h-8 text-gray-400" />
                      {/* Stato online (esempio statico) */}
                      <Circle className="w-3 h-3 text-green-400 absolute bottom-0 right-0 bg-white rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm truncate">{(session as any).profiles?.first_name || 'Utente'} {(session as any).profiles?.last_name || ''}</span>
                        {unreadCounts[session.id] > 0 && (
                          <Badge variant="destructive" className="text-xs">{unreadCounts[session.id]}</Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{getLastMessagePreview(session)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Area messaggi */}
      <Card className="flex-1 glass-card flex flex-col">
        {selectedSession ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="w-8 h-8 text-gray-400" />
                  <div>
                    <CardTitle className="text-base">{(selectedSession as any).profiles?.first_name || 'Utente'} {(selectedSession as any).profiles?.last_name || ''}</CardTitle>
                    <p className="text-xs text-gray-500">{(selectedSession as any).profiles?.email || 'Email non disponibile'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedSession.status === 'waiting' && (
                    <Button onClick={() => handleTakeSession(selectedSession.id)} size="sm" className="bg-green-500 hover:bg-green-600">Prendi in Carico</Button>
                  )}
                  <Button onClick={() => handleCloseSession(selectedSession.id)} size="sm" variant="outline">Chiudi</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col h-[500px] p-0">
              {/* Messaggi */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.sender_type === 'admin' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : msg.sender_type === 'system' ? 'bg-gray-100 text-gray-800 border-l-4 border-electric-blue-500' : 'bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 text-white'}`}>
                        {(msg.sender_type === 'system' || msg.sender_type === 'admin') && (
                          <div className="flex items-center gap-2 mb-1">
                            {msg.sender_type === 'system' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                            <span className="text-xs font-medium">{msg.sender_type === 'system' ? 'Sistema' : 'Supporto'}</span>
                          </div>
                        )}
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">{new Date(msg.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              {/* Input */}
              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Scrivi un messaggio…" className="flex-1" disabled={isSendingMessage} />
                  <Button type="submit" disabled={isSendingMessage || !message.trim()} className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"><Send className="w-4 h-4" /></Button>
                </form>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Seleziona o avvia una chat</h3>
              <p className="text-gray-600">Scegli una conversazione o avviane una nuova</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Modal nuova conversazione */}
      <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuova conversazione</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {isLoadingUsers ? (
              <div className="text-center text-gray-500">Caricamento utenti…</div>
            ) : (
              users.filter(u => u.role !== 'admin').map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer" onClick={() => { handleStartNewSession(user.id); setShowNewChat(false); }}>
                  <User className="w-7 h-7 text-gray-400" />
                  <div>
                    <div className="font-medium text-sm">{user.first_name} {user.last_name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminChatInterface;
