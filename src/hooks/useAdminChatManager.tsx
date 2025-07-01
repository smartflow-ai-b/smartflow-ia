import { useState, useEffect } from 'react';
import { useChatSessions } from './useChatSessions';
import { useChatMessages } from './useChatMessages';
import { useAdminStatus } from './useAdminStatus';
import { useAuth } from './useAuth';

export const useAdminChatManager = () => {
  const { user, isAdmin } = useAuth();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const { allSessions, updateSession, isLoadingAllSessions, createSession } = useChatSessions();
  const { messages, sendMessage, isSendingMessage } = useChatMessages(selectedSessionId);
  const { adminStatus, updateAdminStatus } = useAdminStatus();

  // Calculate unread messages for each session
  useEffect(() => {
    if (!allSessions || !isAdmin) return;

    const counts: Record<string, number> = {};
    allSessions.forEach(session => {
      // For now, we'll implement a simple count - in a real app you'd track read_at timestamps
      counts[session.id] = 0; // Placeholder - implement proper unread logic
    });
    setUnreadCounts(counts);
  }, [allSessions, isAdmin]);

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    // Mark messages as read when selecting a session
    // This would typically update the read_at timestamp in the database
  };

  const handleSendAdminMessage = (message: string) => {
    if (!selectedSessionId || !user) return;
    
    sendMessage({ 
      message: message.trim(), 
      senderType: 'admin' 
    });
  };

  const handleCloseSession = (sessionId: string) => {
    updateSession({ 
      sessionId, 
      status: 'closed',
      adminId: user?.id 
    });
  };

  const handleTakeSession = (sessionId: string) => {
    if (!user) return;
    
    updateSession({ 
      sessionId, 
      status: 'active',
      adminId: user.id 
    });
  };

  const toggleAdminStatus = () => {
    if (!adminStatus) return;
    
    const newStatus = adminStatus.status === 'available' ? 'busy' : 'available';
    updateAdminStatus(newStatus);
  };

  // Avvia una nuova sessione di chat con un utente
  const handleStartNewSession = (userId: string) => {
    // Cerca se esiste già una sessione attiva o in attesa con quell'utente
    const existing = allSessions?.find(
      (s) => s.user_id === userId && (s.status === 'active' || s.status === 'waiting')
    );
    if (existing) {
      setSelectedSessionId(existing.id);
      return;
    }
    // Crea una nuova sessione e seleziona la nuova sessione appena creata
    createSession(
      { userId },
      {
        onSuccess: (data: any) => {
          setSelectedSessionId(data.id);
        }
      }
    );
  };

  return {
    allSessions: allSessions || [],
    selectedSessionId,
    messages: messages || [],
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
  };
};
