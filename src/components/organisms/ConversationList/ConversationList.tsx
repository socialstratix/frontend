import React, { useState } from 'react';
import { colors } from '../../../constants/colors';
import { SearchIcon, FilterIcon } from '../../../assets/icons';
import type { IConversation } from '../../../services/messageService';
import { useAuth } from '../../../contexts/AuthContext';

interface ConversationListProps {
  conversations: IConversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  loading?: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant = conv.participants.find((p) => p._id !== user?.id);
    return otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatTimestamp = (date: Date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return messageDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return messageDate.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return messageDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
    }
  };

  const getOtherParticipant = (conversation: IConversation) => {
    return conversation.participants.find((p) => p._id !== user?.id);
  };

  return (
    <div
      className="w-full md:w-[280px] lg:w-[360px] border-b md:border-b-0 md:border-r flex flex-col"
      style={{
        width: '360px',
        borderRight: `1px solid ${colors.border.light}`,
        backgroundColor: colors.primary.white,
      }}
    >
      {/* Messages Header */}
      <div
        style={{
          padding: '16px 20px 12px',
          borderRadius: '12px',
          backgroundColor: colors.primary.white,
        }}
      >
        <h1
          style={{
            fontFamily: 'Poppins',
            fontSize: '24px',
            fontWeight: 600,
            color: colors.text.primary,
            margin: 0,
            marginBottom: '16px',
          }}
        >
          Messages
        </h1>

        {/* Search Box */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <img
              src={SearchIcon}
              alt="Search"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '20px',
                height: '20px',
                opacity: 0.5,
              }}
            />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: '40px',
                paddingLeft: '40px',
                paddingRight: '12px',
                border: `1px solid ${colors.border.light}`,
                borderRadius: '4px',
                fontFamily: 'Poppins',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: colors.primary.white,
              }}
            />
          </div>
          <button
            style={{
              width: '40px',
              height: '40px',
              border: `1px solid ${colors.border.light}`,
              borderRadius: '4px',
              backgroundColor: colors.primary.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <img src={FilterIcon} alt="Filter" style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
      </div>

      {/* Conversation List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: '#F9F9F9',
          padding: '8px',
          borderRadius: '12px',
        }}
      >
        {loading && (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Poppins', color: colors.text.secondary }}>Loading...</p>
          </div>
        )}

        {!loading && filteredConversations.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Poppins', color: colors.text.secondary }}>
              No conversations yet
            </p>
          </div>
        )}

        {!loading &&
          filteredConversations.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation);
            if (!otherParticipant) return null;

            return (
              <div
                key={conversation._id}
                onClick={() => onSelectConversation(conversation._id)}
                style={{
                  marginBottom: '2px',
                  padding: '16px',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  border: 'none',
                  gap: '12px',
                  backgroundColor:
                    selectedConversationId === conversation._id
                      ? 'rgba(239, 236, 240, 1)'
                      : 'white',
                  display: 'flex',
                  transition: 'background-color 0.2s',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: colors.primary.main,
                    color: colors.primary.white,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Poppins',
                    fontSize: '16px',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {otherParticipant.name.charAt(0).toUpperCase()}
                </div>

                {/* Conversation Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px',
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: 'Poppins',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: colors.text.primary,
                        margin: 0,
                      }}
                    >
                      {otherParticipant.name}
                    </h3>
                    {conversation.lastMessage && (
                      <span
                        style={{
                          fontFamily: 'Poppins',
                          fontSize: '12px',
                          color: colors.text.secondary,
                        }}
                      >
                        {formatTimestamp(conversation.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <p
                      style={{
                        fontFamily: 'Poppins',
                        fontSize: '14px',
                        color: colors.text.secondary,
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {conversation.lastMessage?.text || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};


