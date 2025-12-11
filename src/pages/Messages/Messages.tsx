import React, { useState } from 'react';
import { colors } from '../../constants/colors';
import { Button } from '../../components/atoms/Button';
import { SearchIcon, AttachFileIcon, FilterIcon } from '../../assets/icons';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
}

interface Conversation {
  id: string;
  name: string;
  preview: string;
  timestamp: string;
  unread?: boolean;
  avatar: string;
}

export const Messages: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string>('1');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const conversations: Conversation[] = [
    {
      id: '1',
      name: 'Social Stratix',
      preview: 'Hi Ankit, Welcome to Social Stratix',
      timestamp: '11/06/2024',
      avatar: 'SS',
    },
    {
      id: '2',
      name: 'Social Stratix',
      preview: 'Hi Ankit, Welcome to Social Stratix',
      timestamp: '11/05 AM',
      unread: true,
      avatar: 'SS',
    },
    {
      id: '3',
      name: 'Social Stratix',
      preview: 'Hi Ankit, Welcome to Social Stratix',
      timestamp: 'Yesterday',
      avatar: 'SS',
    },
    {
      id: '4',
      name: 'Social Stratix',
      preview: 'Hi Ankit, Welcome to Social Stratix',
      timestamp: 'Saturday',
      avatar: 'SS',
    },
  ];

  const messages: Message[] = [
    {
      id: '1',
      sender: 'Social Stratix',
      text: 'Hi Ankit, Welcome to Social Stratix a place where you can find the best work. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      timestamp: '2:00 PM',
      isOwn: false,
    },
    {
      id: '2',
      sender: 'Social Stratix',
      text: 'Hi Ankit, Welcome to Social Stratix a place where you can find the best work. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      timestamp: '2:00 PM',
      isOwn: false,
    },
    {
      id: '3',
      sender: 'Social Stratix',
      text: 'bore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex eo commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit enim id est laborum.',
      timestamp: '2:00 PM',
      isOwn: false,
    },
  ];

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      setMessageInput('');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '0 clamp(16px, 8vw, 120px)',
        alignItems: 'center',
        minHeight: 'calc(100vh - 80px)',
        width: '100%',
        background: 'linear-gradient(135deg, rgba(235, 188, 254, 0.3) 0%, rgba(240, 196, 105, 0.3) 100%)',
      }}
    >
      {/* Message Screen Container */}
      <div
        className="flex flex-col md:flex-row"
        style={{
          width: '100%',
          maxWidth: '1718px',
          height: '970px',
          maxHeight: '970px',
          backgroundColor: colors.primary.white,
        }}
      >
        {/* Left Sidebar - Message List */}
        <div
          className="w-full md:w-[280px] lg:w-[360px] border-b md:border-b-0 md:border-r flex flex-col"
          style={{
            width: '360px',
            borderRight: `1px solid ${colors.border.light}`,
           
            backgroundColor:colors.primary.white,
          }}
        >
        {/* Messages Header */}
        <div
          style={{
            padding: '16px 20px 12px',
            borderRadius:'12px',
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
        <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#F9F9F9',padding:'8px 8px 8px 8px', borderRadius:'12px'}}>
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation.id)}
              style={{
                marginBottom:'2px',
                padding: '16px 16px',
                cursor: 'pointer',
                borderRadius:'12px', border:'none',gap:'2px', 
                backgroundColor:
                  selectedConversation === conversation.id
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
                {conversation.avatar}
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
                    {conversation.name}
                  </h3>
                  <span
                    style={{
                      fontFamily: 'Poppins',
                      fontSize: '12px',
                      color: colors.text.secondary,
                    }}
                  >
                    {conversation.timestamp}
                  </span>
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
                    {conversation.preview}
                  </p>
                  {conversation.unread && (
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: colors.gold.main,
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0 }}>
        {/* Chat Header */}
        <div
          style={{
            width: '100%',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
          }}
        >
          <h2
            style={{
              fontFamily: 'Poppins',
              fontSize: '24px',
              fontWeight: 400,
              fontStyle: 'normal',
              lineHeight: '100%',
              letterSpacing: '0%',
              color: colors.primary.main3,
              margin: 0,
            }}
          >
            Social Stratix
          </h2>
        </div>

        {/* Messages Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            padding: '4px',
            backgroundColor: 'rgba(250, 249, 246, 1)',
            gap: '16px',
            borderRadius:'12px',
          }}
        >
          {/* Date Display */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '2px 0',
            }}
          >
            <span
              style={{
                fontFamily: 'Poppins',
                fontSize: '14px',
                color: colors.text.secondary,
              }}
            >
              11/06/2024
            </span>
          </div>
         
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                width: '100%',
                maxWidth: '968px',
                padding: 'clamp(12px, 1.5vw, 16px) clamp(4px, 0.5vw, 4px) clamp(4px, 0.5vw, 4px) clamp(12px, 1.5vw, 16px)',
                gap: '2px',
                borderRadius: '8px',
                backgroundColor: message.isOwn
                  ? 'rgba(30, 0, 43, 1)'
                  : 'rgba(255, 255, 255, 1)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              
              <p
                style={{
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: message.isOwn ? colors.primary.white : colors.primary.main3,
                  margin: 0,
                }}
              >
                {message.text}
              </p>

              <span
                style={{
                  fontFamily: 'Poppins',
                  fontSize: '12px',
                  color: message.isOwn ? 'rgba(255, 255, 255, 0.7)' : colors.text.secondary,
                  marginTop: 'auto',
                  alignSelf: 'flex-end',
                }}
              >
                {message.timestamp}
              </span>
            </div>
          ))}
        </div>

        {/* Message Input Area */}
        <div
          style={{
            padding: '12px 32px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Write a message"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              style={{
                width: '100%',
                height: 'clamp(40px, 5vh, 48px)',
                paddingLeft: 'clamp(12px, 1.5vw, 16px)',
                paddingRight: 'clamp(36px, 4.5vw, 48px)',
                border: `1px solid ${colors.border.light}`,
                borderRadius: '4px',
                fontFamily: 'Poppins',
                fontSize: 'clamp(12px, 1.5vw, 14px)',
                outline: 'none',
                backgroundColor: colors.primary.white,
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
            >
              <img src={AttachFileIcon} alt="Attach" style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
          <Button
            variant="filled"
            onClick={handleSendMessage}
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
      </div>
      </div>
    </div>
  );
};
