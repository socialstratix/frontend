import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { messageService } from '../services/messageService';
import type { IMessage } from '../services/messageService';

interface UseMessagesReturn {
  messages: IMessage[];
  loading: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  hasMore: boolean;
  markAsRead: (messageId: string) => Promise<void>;
}

export const useMessages = (conversationId: string | null): UseMessagesReturn => {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Load initial messages
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('useMessages - Loading messages for conversation:', conversationId);
        const response = await messageService.getMessages(conversationId, 1, 50);
        console.log('useMessages - Response:', response);
        console.log('useMessages - Messages:', response.data.messages);
        setMessages(response.data.messages);
        setHasMore(response.data.pagination.page < response.data.pagination.pages);
        setPage(1);
      } catch (err) {
        console.error('useMessages - Error loading messages:', err);
        setError(err instanceof Error ? err.message : 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [conversationId]);

  // Listen for new messages via socket
  useEffect(() => {
    if (!socket || !conversationId) return;

    const handleNewMessage = (message: IMessage) => {
      // Only add message if it belongs to current conversation
      if (message.conversationId === conversationId) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m._id === message._id)) {
            return prev;
          }
          return [...prev, message];
        });
      }
    };

    socket.on('newMessage', handleNewMessage);

    // Join conversation room
    socket.emit('joinConversation', conversationId);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.emit('leaveConversation', conversationId);
    };
  }, [socket, conversationId]);

  // Send message
  const sendMessage = useCallback(
    async (text: string) => {
      if (!conversationId || !text.trim()) return;

      try {
        if (socket && isConnected) {
          // Send via socket
          socket.emit(
            'sendMessage',
            { conversationId, text: text.trim() },
            (response) => {
              if (!response.success) {
                setError(response.error || 'Failed to send message');
              }
            }
          );
        } else {
          // Fallback to REST API
          await messageService.sendMessage(conversationId, text.trim());
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
      }
    },
    [conversationId, socket, isConnected]
  );

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!conversationId || !hasMore || loading) return;

    try {
      setLoading(true);
      const nextPage = page + 1;
      const response = await messageService.getMessages(conversationId, nextPage, 50);
      setMessages((prev) => [...response.data.messages, ...prev]);
      setHasMore(response.data.pagination.page < response.data.pagination.pages);
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId, page, hasMore, loading]);

  // Mark message as read
  const markAsRead = useCallback(
    async (messageId: string) => {
      try {
        await messageService.markAsRead(messageId);
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, isRead: true, readAt: new Date() } : msg
          )
        );
      } catch (err) {
        console.error('Failed to mark message as read:', err);
      }
    },
    []
  );

  return {
    messages,
    loading,
    error,
    sendMessage,
    loadMoreMessages,
    hasMore,
    markAsRead,
  };
};


