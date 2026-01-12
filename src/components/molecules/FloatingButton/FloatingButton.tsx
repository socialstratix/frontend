import React, { useState, useRef, useEffect } from 'react';
import { colors } from '../../../constants/colors';
import { ProfileCompletionCard } from '../ProfileCompletionCard/ProfileCompletionCard';

interface FloatingButtonProps {
  completionPercentage: number;
  hasProfilePic: boolean;
  hasTags: boolean;
  hasDescription: boolean;
  hasSocialAccounts: boolean;
  onViewProfiles: () => void;
  onEditProfilePic?: () => void;
  onEditTags?: () => void;
  onEditDescription?: () => void;
  onEditSocialAccounts?: () => void;
  isDismissed: boolean;
  onDismiss: () => void;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
  completionPercentage,
  hasProfilePic,
  hasTags,
  hasDescription,
  hasSocialAccounts,
  onViewProfiles,
  onEditProfilePic,
  onEditTags,
  onEditDescription,
  onEditSocialAccounts,
  isDismissed,
  onDismiss,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('floatingButtonPosition');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Handle both old format (x, y) and new format (right, top)
          if (parsed.x !== undefined || parsed.y !== undefined) {
            return { right: parsed.x || 24, top: parsed.y || 200 };
          }
          // Ensure we have valid position
          if (parsed.right !== undefined && parsed.top !== undefined) {
            return parsed;
          }
        } catch {
          // Fall through to default
        }
      }
    }
    // Default position: right side of hero section (top: 200px from top, right: 24px from right)
    return { right: 24, top: 200 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  // Save position to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('floatingButtonPosition', JSON.stringify(position));
    }
  }, [position]);

  // Debug: Log button state
  useEffect(() => {
    console.log('FloatingButton state:', {
      isDismissed,
      position,
      completionPercentage,
      isExpanded,
      buttonRef: buttonRef.current
    });
  }, [isDismissed, position, completionPercentage, isExpanded]);

  // Temporarily ignore dismissed state to ensure button is visible
  // if (isDismissed) {
  //   return null;
  // }

  const handleToggle = () => {
    if (!isDragging) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only handle left mouse button
    
    setIsDragging(true);
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const buttonWidth = buttonRef.current?.offsetWidth || 202;
      const buttonHeight = buttonRef.current?.offsetHeight || 56;

      // Calculate new position from mouse position
      const newRight = window.innerWidth - e.clientX - (buttonWidth - dragStart.x);
      const newTop = e.clientY - dragStart.y;

      // Constrain to viewport bounds
      const maxRight = window.innerWidth - buttonWidth;
      const maxTop = window.innerHeight - buttonHeight;

      setPosition({
        right: Math.max(0, Math.min(newRight, maxRight)),
        top: Math.max(0, Math.min(newTop, maxTop)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // Prevent text selection while dragging
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragStart]);

  return (
    <div
      ref={buttonRef}
      style={{
        position: 'fixed',
        right: `${position.right}px`,
        top: `${position.top}px`,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '16px',
        cursor: isDragging ? 'grabbing' : 'default',
        pointerEvents: 'auto',
      }}
    >
      {/* Expanded Card */}
      {isExpanded && (
        <div
          style={{
            animation: 'slideUp 0.3s ease-out',
          }}
        >
          <ProfileCompletionCard
            completionPercentage={completionPercentage}
            hasProfilePic={hasProfilePic}
            hasTags={hasTags}
            hasDescription={hasDescription}
            hasSocialAccounts={hasSocialAccounts}
            onDismiss={() => {
              onDismiss();
              setIsExpanded(false);
            }}
            onViewProfiles={onViewProfiles}
            onEditProfilePic={onEditProfilePic}
            onEditTags={onEditTags}
            onEditDescription={onEditDescription}
            onEditSocialAccounts={onEditSocialAccounts}
          />
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={handleToggle}
        onMouseDown={handleMouseDown}
        style={{
          width: '202px',
          height: '56px',
          borderRadius: '100px',
          paddingTop: '8px',
          paddingRight: '16px',
          paddingBottom: '8px',
          paddingLeft: '8px',
          gap: '10px',
          opacity: 1,
          backgroundColor: colors.primary.main,
          border: 'none',
          cursor: isDragging ? 'grabbing' : 'grab',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '14px',
          fontWeight: 600,
          color: colors.primary.white,
          transition: isDragging ? 'none' : 'all 0.2s ease',
          position: 'relative',
          userSelect: 'none',
        }}
        onMouseEnter={(e) => {
          if (!isDragging) {
            e.currentTarget.style.backgroundColor = colors.primary.dark;
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            e.currentTarget.style.backgroundColor = colors.primary.main;
          }
        }}
      >
        {/* Circular Progress Indicator */}
        <div
          style={{
            position: 'relative',
            width: '40px',
            height: '40px',
            flexShrink: 0,
          }}
        >
          <svg
            width="40"
            height="40"
            style={{
              transform: 'rotate(-90deg)',
            }}
          >
            {/* Background circle */}
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke={colors.secondary.light || '#F0E2F6'}
              strokeWidth="3"
            />
            {/* Progress circle */}
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke={colors.primary.white}
              strokeWidth="3"
              strokeDasharray={2 * Math.PI * 16}
              strokeDashoffset={2 * Math.PI * 16 * (1 - completionPercentage / 100)}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.3s ease',
              }}
            />
          </svg>
          {/* Percentage text */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              color: colors.text.primary,
              backgroundColor: colors.primary.white,
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {completionPercentage}%
          </div>
        </div>
        
        {/* Profile Completed Text */}
        <span style={{ flex: 1, textAlign: 'left' }}>Profile Completed</span>
        
        
      </button>

      {/* Animation styles */}
      <style>
        {`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

