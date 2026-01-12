import React from 'react';
import { colors } from '../../../constants/colors';
import { CheckIcon, InfoIcon, CloseIcon } from '../../../assets/icons';

interface ProfileCompletionCardProps {
  completionPercentage: number;
  hasProfilePic: boolean;
  hasTags: boolean;
  hasDescription: boolean;
  hasSocialAccounts: boolean;
  onDismiss: () => void;
  onViewProfiles: () => void;
  onEditProfilePic?: () => void;
  onEditTags?: () => void;
  onEditDescription?: () => void;
  onEditSocialAccounts?: () => void;
}

export const ProfileCompletionCard: React.FC<ProfileCompletionCardProps> = ({
  completionPercentage,
  hasProfilePic,
  hasTags,
  hasDescription,
  hasSocialAccounts,
  onDismiss,
  onViewProfiles,
  onEditProfilePic,
  onEditTags,
  onEditDescription,
  onEditSocialAccounts,
}) => {
  const checklistItems = [
    {
      label: 'Add profile pic',
      completed: hasProfilePic,
      onClick: onEditProfilePic,
    },
    {
      label: 'Add Tags',
      completed: hasTags,
      onClick: onEditTags,
    },
    {
      label: 'Add description',
      completed: hasDescription,
      onClick: onEditDescription,
    },
    {
      label: 'Link Social accounts',
      completed: hasSocialAccounts,
      onClick: onEditSocialAccounts,
    },
  ];

  // Calculate circumference for circular progress (radius = 30, so circumference = 2 * π * 30 ≈ 188.5)
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completionPercentage / 100) * circumference;

  return (
    <div
      style={{
        backgroundColor: colors.primary.white,
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        width: '100%',
        maxWidth: '400px',
      }}
    >
      {/* Dismiss Button */}
      <button
        onClick={onDismiss}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: colors.primary.main,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
      >
        <img
          src={CloseIcon}
          alt="Close"
          style={{
            width: '16px',
            height: '16px',
            filter: 'brightness(0) invert(1)',
          }}
        />
      </button>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        <span
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            color: colors.text.secondary,
          }}
        >
          Incomplete profile
        </span>
        <img
          src={InfoIcon}
          alt="Info"
          style={{
            width: '16px',
            height: '16px',
          }}
        />
      </div>

      {/* Heading */}
      <h3
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: '20px',
          fontWeight: 600,
          color: colors.primary.main,
          margin: '0 0 8px 0',
        }}
      >
        Complete your profile to boost profile
      </h3>

      {/* Link */}
      <p
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: '14px',
          fontWeight: 400,
          color: colors.text.secondary,
          margin: '0 0 24px 0',
        }}
      >
        Need inspiration? View some profiles{' '}
        <button
          onClick={onViewProfiles}
          style={{
            background: 'none',
            border: 'none',
            color: colors.primary.main,
            cursor: 'pointer',
            textDecoration: 'underline',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            padding: 0,
          }}
        >
          here.
        </button>
      </p>

      {/* Checklist */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        {checklistItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'none',
              border: 'none',
              cursor: item.onClick ? 'pointer' : 'default',
              padding: 0,
              textAlign: 'left',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: item.completed
                  ? colors.primary.main
                  : colors.grey.light,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {item.completed && (
                <img
                  src={CheckIcon}
                  alt="Check"
                  style={{
                    width: '14px',
                    height: '14px',
                    filter: 'brightness(0) invert(1)',
                  }}
                />
              )}
            </div>
            <span
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                color: colors.text.primary,
              }}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Progress Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {/* Circular Progress */}
        <div
          style={{
            position: 'relative',
            width: '64px',
            height: '64px',
            flexShrink: 0,
          }}
        >
          <svg
            width="64"
            height="64"
            style={{
              transform: 'rotate(-90deg)',
            }}
          >
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              stroke={colors.secondary.light}
              strokeWidth="6"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              stroke={colors.primary.main}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.3s ease',
              }}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              color: colors.primary.main,
            }}
          >
            {completionPercentage}%
          </div>
        </div>
        <span
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            color: colors.text.secondary,
          }}
        >
          Profile Completed
        </span>
      </div>
    </div>
  );
};

