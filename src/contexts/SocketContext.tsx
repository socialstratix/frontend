import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

// Get API base URL (without /api/v1) for socket connection
const getSocketURL = (): string => {
  // Use VITE_SOCKET_URL if explicitly set
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  
  // Otherwise, derive from API base URL (same server, different endpoint)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  return API_BASE;
};

interface ServerToClientEvents {
  newMessage: (message: any) => void;
  messageRead: (data: { messageId: string; readAt: Date }) => void;
  userOnline: (userId: string) => void;
  userOffline: (userId: string) => void;
  typing: (data: { userId: string; conversationId: string; isTyping: boolean }) => void;
  error: (data: { message: string }) => void;
}

interface ClientToServerEvents {
  sendMessage: (
    data: { conversationId: string; text: string },
    callback?: (response: { success: boolean; message?: any; error?: string }) => void
  ) => void;
  typing: (data: { conversationId: string; isTyping: boolean }) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  messageRead: (data: { messageId: string }) => void;
}

interface SocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = getSocketURL();

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(
    null
  );
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Only connect if user is authenticated
    if (!isAuthenticated || !token) {
      // Disconnect if already connected
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection
    if (import.meta.env.DEV) {
      console.log('🔌 Connecting to Socket.io server:', SOCKET_URL);
    }
    
    const newSocket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    // Connection handlers
    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // Online users handlers
    newSocket.on('userOnline', (userId) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    });

    newSocket.on('userOffline', (userId) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    // Error handler
    newSocket.on('error', (data) => {
      console.error('Socket error:', data.message);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, [token, isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

// Export a custom hook that returns null if context is not available (for use outside provider)
export const useSocketOptional = (): SocketContextType | null => {
  return useContext(SocketContext) || null;
};


