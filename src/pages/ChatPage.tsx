import React, { useState } from 'react';
import { useChats } from '@/hooks/useChats';
import { useMessages } from '@/hooks/useMessages';

export const ChatPage = () => {
  const { chats, isLoading: chatsLoading } = useChats();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const { messages, isLoading: messagesLoading, sendMessage } = useMessages(selectedChat);
  const [input, setInput] = useState('');

  return (
    <div className="flex h-[80vh] border rounded overflow-hidden">
      {/* Sidebar chat */}
      <div className="w-1/3 border-r bg-gray-50 flex flex-col">
        <div className="p-2 font-bold border-b">Le tue chat</div>
        <div className="flex-1 overflow-y-auto">
          {chatsLoading ? (
            <div className="p-4 text-gray-400">Caricamento...</div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-gray-400">Nessuna chat</div>
          ) : (
            chats.map((chat: any) => (
              <div
                key={chat.id}
                className={`p-3 cursor-pointer hover:bg-gray-200 ${selectedChat === chat.id ? 'bg-gray-200' : ''}`}
                onClick={() => setSelectedChat(chat.id)}
              >
                {chat.admin_id ? 'Chat con admin' : 'Chat'}<br />
                <span className="text-xs text-gray-500">{chat.id}</span>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Area messaggi */}
      <div className="flex-1 flex flex-col">
        <div className="p-2 border-b font-bold">{selectedChat ? `Chat ${selectedChat}` : 'Seleziona una chat'}</div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
          {messagesLoading ? (
            <div className="text-gray-400">Caricamento...</div>
          ) : messages.length === 0 ? (
            <div className="text-gray-400">Nessun messaggio</div>
          ) : (
            messages.map((msg: any) => (
              <div key={msg.id} className="flex flex-col">
                <span className="text-xs text-gray-500">{msg.sender_id}</span>
                <span className="bg-gray-100 rounded p-2 inline-block max-w-[70%]">{msg.message}</span>
              </div>
            ))
          )}
        </div>
        {/* Input messaggio */}
        {selectedChat && (
          <form
            className="flex border-t"
            onSubmit={e => {
              e.preventDefault();
              if (input.trim()) {
                sendMessage.mutate(input);
                setInput('');
              }
            }}
          >
            <input
              className="flex-1 p-2 outline-none"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Scrivi un messaggio..."
            />
            <button type="submit" className="p-2 bg-blue-500 text-white">Invia</button>
          </form>
        )}
      </div>
    </div>
  );
};
