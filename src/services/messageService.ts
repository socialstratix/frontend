import { apiService } from './api';

export interface IMessage {
  _id: string;
  conversationId: string;
  senderId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  text: string;
  attachments?: string[];
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversation {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    userType: 'brand' | 'influencer';
  }>;
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: Date;
  };
  unreadCount?: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    messages?: T[];
    conversations?: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface MessagesResponse {
  success: boolean;
  data: {
    messages: IMessage[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ConversationsResponse {
  conversations: IConversation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const messageService = {
  // Get all conversations
  getConversations: async (page = 1, limit = 20): Promise<ConversationsResponse> => {
    const response = await apiService.get<ConversationsResponse>(`/conversations?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get single conversation
  getConversation: async (id: string): Promise<{ success: boolean; data: IConversation }> => {
    const response = await apiService.get<IConversation>(`/conversations/${id}`);
    return response; // Return the full response, not just response.data
  },

  // Create or get existing conversation
  createConversation: async (
    participantId: string
  ): Promise<{ success: boolean; data: IConversation; message: string }> => {
    const response = await apiService.post<IConversation>('/conversations', { participantId });
    return {
      success: response.success,
      data: response.data,
      message: response.message || 'Conversation created successfully',
    };
  },

  // Get messages for a conversation
  getMessages: async (
    conversationId: string,
    page = 1,
    limit = 50
  ): Promise<MessagesResponse> => {
    const response = await apiService.get<{ messages: IMessage[]; pagination: any }>(
      `/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
    );
    // Backend returns { success: true, data: { messages: [...], pagination: {...} } }
    // apiService.get returns that same structure, so response.data is { messages: [...], pagination: {...} }
    return {
      success: response.success,
      data: {
        messages: response.data.messages || [],
        pagination: response.data.pagination,
      },
    };
  },

  // Send a message (via REST API fallback)
  sendMessage: async (
    conversationId: string,
    text: string,
    attachments?: string[]
  ): Promise<{ success: boolean; data: IMessage; message: string }> => {
    const response = await apiService.post<IMessage>('/messages', {
      conversationId,
      text,
      attachments,
    });
    return {
      success: response.success,
      data: response.data,
      message: response.message || 'Message sent successfully',
    };
  },

  // Mark message as read
  markAsRead: async (
    messageId: string
  ): Promise<{ success: boolean; data: IMessage; message: string }> => {
    const response = await apiService.put<IMessage>(`/messages/${messageId}/read`, {});
    return {
      success: response.success,
      data: response.data,
      message: response.message || 'Message marked as read',
    };
  },

  // Get unread message count
  getUnreadCount: async (): Promise<{ success: boolean; data: { unreadCount: number } }> => {
    const response = await apiService.get<{ unreadCount: number }>('/messages/unread/count');
    return response;
  },

  // Delete conversation
  deleteConversation: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiService.delete<never>(`/conversations/${id}`);
    return {
      success: response.success,
      message: response.message || 'Conversation deleted successfully',
    };
  },
};


