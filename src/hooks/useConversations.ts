import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { messageService } from '../services/messageService';
import type { IConversation } from '../services/messageService';

interface UseConversationsReturn {
  conversations: IConversation[];
  loading: boolean;
  error: string | null;
  refreshConversations: () => Promise<void>;
  createConversation: (participantId: string) => Promise<IConversation | null>;
}

export const useConversations = (): UseConversationsReturn => {
  const { socket } = useSocket();
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await messageService.getConversations();
      setConversations(response.conversations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Listen for new messages to update conversation list
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = () => {
      // Refresh conversations when new message arrives
      loadConversations();
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, loadConversations]);

  // Create new conversation
  const createConversation = useCallback(async (participantId: string) => {
    try {
      const response = await messageService.createConversation(participantId);
      await loadConversations(); // Refresh list
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
      return null;
    }
  }, [loadConversations]);

  return {
    conversations,
    loading,
    error,
    refreshConversations: loadConversations,
    createConversation,
  };
};


