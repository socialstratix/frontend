import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../constants/colors';

export const ContentUnavailable: React.FC = () => {
  const { user } = useAuth();
  const homePath = user
    ? user.userType === 'influencer'
      ? '/influencer'
      : '/brand'
    : '/login';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'Poppins, sans-serif',
        backgroundColor: '#FAF9F6',
      }}
    >
      <h1
        style={{
          fontSize: '24px',
          fontWeight: 600,
          color: colors.text.primary,
          marginBottom: '8px',
        }}
      >
        Content not available
      </h1>
      <p
        style={{
          fontSize: '16px',
          color: colors.text.secondary,
          marginBottom: '24px',
          textAlign: 'center',
        }}
      >
        This page is coming soon or the content is not yet available.
      </p>
      <Link
        to={homePath}
        style={{
          padding: '12px 24px',
          backgroundColor: colors.primary.main,
          color: 'white',
          borderRadius: '8px',
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        Go back
      </Link>
    </div>
  );
};
