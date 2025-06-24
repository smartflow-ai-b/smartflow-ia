
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MessageSquare, Bot } from 'lucide-react';

const Chat = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Ciao! Sono l'assistente virtuale di SmartFlow. Come posso aiutarti oggi?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: "Grazie per il tuo messaggio! Il nostro team ti risponderà presto. Nel frattempo, puoi consultare la nostra documentazione o creare un nuovo progetto.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

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
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {msg.sender === 'bot' && (
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="w-4 h-4" />
                        <span className="text-xs font-medium">SmartFlow Assistant</span>
                      </div>
                    )}
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString('it-IT', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="border-t p-6">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Scrivi il tuo messaggio..."
                  className="flex-1"
                />
                <Button
                  type="submit"
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
