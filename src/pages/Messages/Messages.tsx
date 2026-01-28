import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { colors } from '../../constants/colors';
import { ConversationList } from '../../components/organisms/ConversationList';
import { ChatWindow } from '../../components/organisms/ChatWindow';
import { useConversations } from '../../hooks/useConversations';
import { messageService } from '../../services/messageService';
import type { IConversation } from '../../services/messageService';

export const Messages: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const { conversations, loading, refreshConversations } = useConversations();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    conversationId || null
  );
  const [specificConversation, setSpecificConversation] = useState<IConversation | null>(null);
  const [fetchingSpecific, setFetchingSpecific] = useState(false);

  // Update selected conversation when URL param changes
  useEffect(() => {
    if (conversationId) {
      setSelectedConversationId(conversationId);
    }
  }, [conversationId]);

  // Fetch specific conversation if it's not in the list
  useEffect(() => {
    let cancelled = false;
    
    const fetchSpecificConversation = async () => {
      if (!conversationId) return;
      
      // Wait for initial load to complete
      if (loading) {
        console.log('Waiting for conversations to load...');
        return;
      }
      
      // Check if conversation exists in the list
      const exists = conversations.find((c) => c._id === conversationId);
      if (exists) {
        console.log('Conversation found in list, using it');
        setSpecificConversation(null); // Clear if found in main list
        return;
      }
      
      // Only fetch if we're not already fetching and conversation is not in list
      if (fetchingSpecific) {
        console.log('Already fetching specific conversation...');
        return;
      }
      
      console.log('Conversation not found in list, fetching directly...');
      try {
        setFetchingSpecific(true);
        const response = await messageService.getConversation(conversationId);
        
        if (cancelled) return;
        
        if (response.success && response.data) {
          console.log('Fetched specific conversation:', response.data);
          setSpecificConversation(response.data);
        } else {
          console.error('Failed to fetch conversation:', response);
          // Try refreshing the list as fallback
          await refreshConversations();
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching specific conversation:', error);
          // Try refreshing the list as fallback
          await refreshConversations();
        }
      } finally {
        if (!cancelled) {
          setFetchingSpecific(false);
        }
      }
    };

    // Small delay to let conversations list load first
    const timeoutId = setTimeout(() => {
      fetchSpecificConversation();
    }, 100);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [conversationId, loading, conversations, fetchingSpecific, refreshConversations]);

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    setSpecificConversation(null); // Clear specific when selecting from list
    const baseRoute = window.location.pathname.split('/')[1];
    navigate(`/${baseRoute}/messages/${id}`);
  };

  // Use specific conversation if available, otherwise find in list
  const selectedConversation = specificConversation || 
    conversations.find((c) => c._id === selectedConversationId) || 
    null;

  // Debug logging
  useEffect(() => {
    if (selectedConversationId) {
      console.log('Selected conversation ID:', selectedConversationId);
      console.log('Available conversations:', conversations.map(c => c._id));
      console.log('Specific conversation:', specificConversation);
      console.log('Found conversation:', selectedConversation);
    }
  }, [selectedConversationId, conversations, selectedConversation, specificConversation]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '0 clamp(16px, 8vw, 120px)',
        alignItems: 'center',
        height: 'calc(100vh - 80px)',
        width: '100%',
        overflow: 'hidden',
        background:
          'linear-gradient(135deg, rgba(235, 188, 254, 0.3) 0%, rgba(240, 196, 105, 0.3) 100%)',
      }}
    >
      {/* Message Screen Container */}
      <div
        className="flex flex-col md:flex-row"
        style={{
          width: '100%',
          maxWidth: '1718px',
          height: '100%',
          maxHeight: '100%',
          backgroundColor: colors.primary.white,
          overflow: 'hidden',
        }}
      >
        {/* Left Sidebar - Conversation List */}
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          loading={loading}
        />

        {/* Right Side - Chat Window */}
        <ChatWindow conversation={selectedConversation} loading={loading} />
      </div>
    </div>
  );
};
