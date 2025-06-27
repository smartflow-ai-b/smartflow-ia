
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MessageSquare, Bot, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useChatSessions } from '@/hooks/useChatSessions';
import { useChatMessages } from '@/hooks/useChatMessages';

const Chat = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    currentSession,
    createSession,
    isLoadingSession,
    isCreatingSession
  } = useChatSessions();

  const {
    messages,
    sendMessage,
    isLoading: isLoadingMessages,
    isSendingMessage
  } = useChatMessages(currentSession?.id || null);

  // Create session if user doesn't have one
  useEffect(() => {
    if (user && !isAdmin && !currentSession && !isLoadingSession && !isCreatingSession) {
      console.log('Creating new chat session for user');
      createSession();
    }
  }, [user, isAdmin, currentSession, isLoadingSession, isCreatingSession, createSession]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSendingMessage) return;

    console.log('Sending message:', message);
    sendMessage({ message: message.trim() });
    setMessage('');
  };

  if (!user) {
    return null; // Will redirect to auth
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-electric-blue-50 to-smart-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-center text-2xl bg-gradient-to-r from-electric-blue-600 to-smart-purple-600 bg-clip-text text-transparent">
                Accesso Amministratore
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Come amministratore, accedi alla dashboard per gestire tutte le chat.
              </p>
              <Button
                onClick={() => navigate('/admin')}
                className="bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 hover:from-electric-blue-600 hover:to-smart-purple-600"
              >
                Vai alla Dashboard Admin
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-electric-blue-50 to-smart-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="glass-card mb-6">
          <CardHeader className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="self-start p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="text-center">
              <CardTitle className="text-2xl bg-gradient-to-r from-electric-blue-600 to-smart-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
                <MessageSquare className="w-6 h-6 text-electric-blue-500" />
                Chat Supporto
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Il nostro team è qui per aiutarti
              </p>
            </div>
          </CardHeader>
        </Card>

        <Card className="glass-card h-[600px] flex flex-col">
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-gray-500">Caricamento messaggi...</div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender_type === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.sender_type === 'user'
                            ? 'bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 text-white'
                            : msg.sender_type === 'system'
                            ? 'bg-gray-100 text-gray-800 border-l-4 border-electric-blue-500'
                            : 'bg-green-100 text-green-800'
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
                              {msg.sender_type === 'system' ? 'SmartFlow Assistant' : 'Supporto'}
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
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t p-6">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Scrivi il tuo messaggio..."
                  className="flex-1"
                  disabled={isSendingMessage}
                />
                <Button
                  type="submit"
                  disabled={isSendingMessage || !message.trim()}
                  className="bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 hover:from-electric-blue-600 hover:to-smart-purple-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chat;
