import React, { useEffect, useRef } from 'react';
import { colors } from '../../../constants/colors';
import { MessageBubble } from '../../molecules/MessageBubble';
import { MessageInput } from '../../molecules/MessageInput';
import { useAuth } from '../../../contexts/AuthContext';
import type { IConversation } from '../../../services/messageService';
import { useMessages } from '../../../hooks/useMessages';

interface ChatWindowProps {
  conversation: IConversation | null;
  loading?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, loading = false }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, loading: messagesLoading } = useMessages(
    conversation?._id || null
  );

  // Debug logging
  useEffect(() => {
    console.log('ChatWindow - conversation:', conversation);
    console.log('ChatWindow - messages:', messages);
    console.log('ChatWindow - messagesLoading:', messagesLoading);
  }, [conversation, messages, messagesLoading]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!conversation) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(250, 249, 246, 1)',
        }}
      >
        <p
          style={{
            fontFamily: 'Poppins',
            fontSize: '16px',
            color: colors.text.secondary,
          }}
        >
          Select a conversation to start messaging
        </p>
      </div>
    );
  }

  const otherParticipant = conversation.participants.find((p) => p._id !== user?.id);

  const handleSendMessage = async (text: string) => {
    await sendMessage(text);
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: typeof messages }[] = [];
  messages.forEach((message) => {
    const messageDate = new Date(message.createdAt).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    });

    const existingGroup = groupedMessages.find((g) => g.date === messageDate);
    if (existingGroup) {
      existingGroup.messages.push(message);
    } else {
      groupedMessages.push({ date: messageDate, messages: [message] });
    }
  });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0 }}>
      {/* Chat Header */}
      <div
        style={{
          width: '100%',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          borderBottom: `1px solid ${colors.border.light}`,
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: colors.primary.main,
            color: colors.primary.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Poppins',
            fontSize: '16px',
            fontWeight: 600,
            marginRight: '12px',
          }}
        >
          {otherParticipant?.name.charAt(0).toUpperCase()}
        </div>

        <div>
          <h2
            style={{
              fontFamily: 'Poppins',
              fontSize: '18px',
              fontWeight: 600,
              color: colors.primary.main3,
              margin: 0,
            }}
          >
            {otherParticipant?.name}
          </h2>
          <p
            style={{
              fontFamily: 'Poppins',
              fontSize: '12px',
              color: colors.text.secondary,
              margin: 0,
            }}
          >
            {otherParticipant?.userType === 'brand' ? 'Brand' : 'Influencer'}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          backgroundColor: 'rgba(250, 249, 246, 1)',
          gap: '16px',
        }}
      >
        {messagesLoading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ fontFamily: 'Poppins', color: colors.text.secondary }}>
              Loading messages...
            </p>
          </div>
        )}

        {!messagesLoading && messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ fontFamily: 'Poppins', color: colors.text.secondary }}>
              No messages yet. Start the conversation!
            </p>
          </div>
        )}

        {!messagesLoading &&
          groupedMessages.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {/* Date Divider */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '8px 0',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    color: colors.text.secondary,
                    backgroundColor: colors.primary.white,
                    padding: '4px 12px',
                    borderRadius: '12px',
                  }}
                >
                  {group.date}
                </span>
              </div>

              {/* Messages */}
              {group.messages.map((message) => (
                <MessageBubble
                  key={message._id}
                  message={message}
                  isOwn={message.senderId._id === user?.id}
                  showAvatar={message.senderId._id !== user?.id}
                />
              ))}
            </React.Fragment>
          ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area */}
      <MessageInput onSend={handleSendMessage} disabled={loading || messagesLoading} />
    </div>
  );
};


