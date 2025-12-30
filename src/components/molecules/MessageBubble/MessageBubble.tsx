import React from 'react';
import { colors } from '../../../constants/colors';
import type { IMessage } from '../../../services/messageService';

interface MessageBubbleProps {
  message: IMessage;
  isOwn: boolean;
  showAvatar?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = true,
}) => {
  const formatTime = (date: Date) => {
    const messageDate = new Date(date);
    return messageDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        flexDirection: isOwn ? 'row-reverse' : 'row',
      }}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: colors.primary.main,
            color: colors.primary.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {message.senderId.name.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Message Bubble */}
      <div
        style={{
          maxWidth: '70%',
          padding: '12px 16px',
          borderRadius: '8px',
          backgroundColor: isOwn ? 'rgba(30, 0, 43, 1)' : 'rgba(255, 255, 255, 1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <p
          style={{
            fontFamily: 'Poppins',
            fontSize: '14px',
            lineHeight: '1.6',
            color: isOwn ? colors.primary.white : colors.primary.main3,
            margin: 0,
            wordWrap: 'break-word',
          }}
        >
          {message.text}
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '8px',
          }}
        >
          <span
            style={{
              fontFamily: 'Poppins',
              fontSize: '12px',
              color: isOwn ? 'rgba(255, 255, 255, 0.7)' : colors.text.secondary,
            }}
          >
            {formatTime(message.createdAt)}
          </span>

          {/* Read status indicator for own messages */}
          {isOwn && (
            <span
              style={{
                fontSize: '12px',
                color: message.isRead
                  ? colors.gold.main
                  : 'rgba(255, 255, 255, 0.5)',
              }}
            >
              {message.isRead ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};


