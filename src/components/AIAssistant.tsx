
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useChatSessions } from '@/hooks/useChatSessions';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useNavigate } from 'react-router-dom';

const AIAssistant = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
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
    isSendingMessage
  } = useChatMessages(currentSession?.id || null);

  const quickQuestions = [
    "Quanto costa un sito web?",
    "Tempi di sviluppo?", 
    "Che tecnologie usate?",
    "Posso vedere esempi?"
  ];

  // Create session if user doesn't have one and opens chat
  useEffect(() => {
    if (isOpen && user && !isAdmin && !currentSession && !isLoadingSession && !isCreatingSession) {
      console.log('Creating new chat session for user via assistant');
      createSession();
    }
  }, [isOpen, user, isAdmin, currentSession, isLoadingSession, isCreatingSession, createSession]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim() || isSendingMessage) return;

    console.log('Sending message via assistant:', message);
    sendMessage({ message: message.trim() });
    setMessage('');
  };

  const handleQuickQuestion = (question: string) => {
    setMessage(question);
  };

  const handleOpenFullChat = () => {
    setIsOpen(false);
    navigate('/chat');
  };

  // Don't show for admin users
  if (isAdmin) {
    return null;
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 hover:from-electric-blue-600 hover:to-smart-purple-600 shadow-2xl hover:shadow-3xl transition-all animate-float"
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Card className="glass-card shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold">Assistente SmartFlow</h3>
                <p className="text-sm text-white/80">Online ora</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenFullChat}
                className="text-white hover:bg-white/20 h-8 px-2 text-xs"
              >
                Espandi
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  msg.sender_type === 'user'
                    ? 'bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 text-white'
                    : msg.sender_type === 'system'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {(msg.sender_type === 'system' || msg.sender_type === 'admin') && (
                    <div className="flex items-center gap-2 mb-1">
                      {msg.sender_type === 'system' ? (
                        <Bot className="w-3 h-3" />
                      ) : (
                        <User className="w-3 h-3" />
                      )}
                      <span className="text-xs font-medium">
                        {msg.sender_type === 'system' ? 'Assistant' : 'Supporto'}
                      </span>
                    </div>
                  )}
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions - show only if no messages or just the welcome message */}
          {messages.length <= 1 && (
            <div className="p-4 border-t bg-gray-50">
              <p className="text-sm text-gray-600 mb-2">Domande frequenti:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickQuestion(question)}
                    className="text-xs border-electric-blue-200 text-electric-blue-600 hover:bg-electric-blue-50"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Scrivi il tuo messaggio..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric-blue-500 text-sm"
                disabled={isSendingMessage}
              />
              <Button
                onClick={handleSendMessage}
                size="sm"
                disabled={isSendingMessage || !message.trim()}
                className="bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 hover:from-electric-blue-600 hover:to-smart-purple-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistant;
