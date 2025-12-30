import React, { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { colors } from '../../../constants/colors';
import { Button } from '../../atoms/Button';
import { AttachFileIcon } from '../../../assets/icons';

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled = false,
  placeholder = 'Write a message',
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed) {
      onSend(trimmed);
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        padding: '12px 32px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        backgroundColor: colors.primary.white,
      }}
    >
      <div style={{ position: 'relative', flex: 1 }}>
        <input
          type="text"
          placeholder={placeholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          style={{
            width: '100%',
            height: '48px',
            paddingLeft: '16px',
            paddingRight: '48px',
            border: `1px solid ${colors.border.light}`,
            borderRadius: '4px',
            fontFamily: 'Poppins',
            fontSize: '14px',
            outline: 'none',
            backgroundColor: disabled ? colors.grey.disabled : colors.primary.white,
          }}
        />
        <button
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          disabled={disabled}
        >
          <img src={AttachFileIcon} alt="Attach" style={{ width: '20px', height: '20px' }} />
        </button>
      </div>
      <Button
        variant="filled"
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        style={{
          height: '48px',
          minWidth: '100px',
          fontFamily: 'Poppins',
          fontSize: '14px',
          fontWeight: 600,
        }}
      >
        SEND
      </Button>
    </div>
  );
};


