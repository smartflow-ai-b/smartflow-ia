import React from 'react';
import Header from '@/components/Header';
import AdminChatInterface from '@/components/AdminChatInterface';

const AdminChatPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center p-0">
        <div className="w-full max-w-6xl mx-auto h-[90vh] flex flex-col">
          <AdminChatInterface />
        </div>
      </div>
    </div>
  );
};

export default AdminChatPage;
