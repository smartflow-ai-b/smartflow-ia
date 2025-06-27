
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, User, Bot, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAdminChatManager } from '@/hooks/useAdminChatManager';
import type { ChatSession } from '@/hooks/useChatSessions';

const AdminChatInterface = () => {
  const [message, setMessage] = useState('');
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
    toggleAdminStatus
  } = useAdminChatManager();

  const selectedSession = allSessions.find(s => s.id === selectedSessionId);

  // Auto scroll to bottom when new messages arrive
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

  return (
    <div className="h-[800px] flex gap-4">
      {/* Sessions List */}
      <Card className="w-1/3 glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Chat Attive</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleAdminStatus}
                size="sm"
                variant={adminStatus?.status === 'available' ? 'default' : 'secondary'}
                className="flex items-center gap-1"
              >
                {adminStatus?.status === 'available' ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                {adminStatus?.status === 'available' ? 'Disponibile' : 'Occupato'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[700px]">
            {isLoadingAllSessions ? (
              <div className="p-4 text-center text-gray-500">
                Caricamento sessioni...
              </div>
            ) : allSessions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Nessuna sessione attiva
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {allSessions.map((session) => (
                  <Card
                    key={session.id}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedSessionId === session.id ? 'ring-2 ring-electric-blue-500' : ''
                    }`}
                    onClick={() => handleSelectSession(session.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-sm">
                            {(session as any).profiles?.first_name || 'Utente'} {(session as any).profiles?.last_name || ''}
                          </span>
                        </div>
                        <Badge className={getSessionStatusColor(session.status)}>
                          {getSessionStatusText(session.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(session.last_message_at).toLocaleTimeString('it-IT', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        {unreadCounts[session.id] > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {unreadCounts[session.id]}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {(session as any).profiles?.email || 'Email non disponibile'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="flex-1 glass-card">
        {selectedSession ? (
          <>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <CardTitle className="text-lg">
                      {(selectedSession as any).profiles?.first_name || 'Utente'} {(selectedSession as any).profiles?.last_name || ''}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {(selectedSession as any).profiles?.email || 'Email non disponibile'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedSession.status === 'waiting' && (
                    <Button
                      onClick={() => handleTakeSession(selectedSession.id)}
                      size="sm"
                      className="bg-green-500 hover:bg-green-600"
                    >
                      Prendi in Carico
                    </Button>
                  )}
                  <Button
                    onClick={() => handleCloseSession(selectedSession.id)}
                    size="sm"
                    variant="outline"
                  >
                    Chiudi Chat
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col h-[600px] p-0">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.sender_type === 'admin'
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                            : msg.sender_type === 'system'
                            ? 'bg-gray-100 text-gray-800 border-l-4 border-electric-blue-500'
                            : 'bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 text-white'
                        }`}
                      >
                        {(msg.sender_type === 'system' || msg.sender_type === 'admin') && (
                          <div className="flex items-center gap-2 mb-1">
                            {msg.sender_type === 'system' ? (
                              <Bot className="w-4 h-4" />
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                            <span className="text-xs font-medium">
                              {msg.sender_type === 'system' ? 'Sistema' : 'Supporto'}
                            </span>
                          </div>
                        )}
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString('it-IT', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Scrivi la tua risposta..."
                    className="flex-1"
                    disabled={isSendingMessage}
                  />
                  <Button
                    type="submit"
                    disabled={isSendingMessage || !message.trim()}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Seleziona una Chat</h3>
              <p className="text-gray-600">
                Scegli una sessione dalla lista per iniziare a chattare
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default AdminChatInterface;
