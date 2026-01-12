import React, { useState, useEffect } from 'react';
import { XIcon, YouTubeIcon, FacebookIcon, InstagramIcon, TikTokIcon, StarIcon, BadgeIcon } from '../../../assets/icons';
import { PLACEHOLDER_IMAGE } from '../../../constants';
import { influencerService, type FollowersResponse } from '../../../services/influencerService';

interface InfluencerCardProps {
  name: string;
  image?: string;  // Background image
  profileImage?: string;  // Profile image
  rating?: number;  // Rating (e.g., 4.9)
  description?: string;  // Description
  isTopCreator?: boolean;  // Top Creator badge
  influencerId?: string;  // MongoDB ObjectId for fetching followers from API
  platformFollowers?: {  // Followers per platform (fallback if API not available)
    x?: number;
    youtube?: number;
    facebook?: number;
    instagram?: number;
    tiktok?: number;
  };
  onClick?: () => void;
}

export const InfluencerCard: React.FC<InfluencerCardProps> = ({
  name,
  image,
  profileImage,
  rating,
  description,
  isTopCreator,
  influencerId,
  platformFollowers: propPlatformFollowers,
  onClick,
}) => {
  const [profileImageError, setProfileImageError] = useState(false);
  const [backgroundImageError, setBackgroundImageError] = useState(false);
  const [apiFollowers, setApiFollowers] = useState<FollowersResponse | null>(null);

  // Fetch followers from API if influencerId is provided
  useEffect(() => {
    if (!influencerId || !/^[0-9a-fA-F]{24}$/.test(influencerId)) return;

    const fetchFollowers = async () => {
      try {
        const followersData = await influencerService.getInfluencerFollowers(influencerId, '7d');
        setApiFollowers(followersData);
      } catch (error) {
        console.error('Failed to fetch followers for card:', error);
        // Keep apiFollowers as null to use prop data as fallback
      }
    };

    fetchFollowers();
  }, [influencerId]);

  // Use API followers if available, otherwise fallback to prop data
  const platformFollowers = apiFollowers?.platformFollowers || propPlatformFollowers;

  const formatFollowers = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toLocaleString();
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'x':
        return '#000000';
      case 'youtube':
        return '#FF0000';
      case 'facebook':
        return '#1877F2';
      case 'instagram':
        return '#E4405F';
      case 'tiktok':
        return '#000000';
      default:
        return '#000000';
    }
  };

  const PlatformIcon = ({ platform, size = 16 }: { platform: string; size?: number }) => {
    const iconStyle = { width: size, height: size };
    
    switch (platform) {
      case 'x':
        return <img src={XIcon} alt="X" style={iconStyle} />;
      case 'youtube':
        return <img src={YouTubeIcon} alt="YouTube" style={iconStyle} />;
      case 'facebook':
        return <img src={FacebookIcon} alt="Facebook" style={iconStyle} />;
      case 'instagram':
        return <img src={InstagramIcon} alt="Instagram" style={iconStyle} />;
      case 'tiktok':
        return <img src={TikTokIcon} alt="TikTok" style={iconStyle} />;
      default:
        return null;
    }
  };

  return (
    <div
      onClick={onClick}
      className="cursor-pointer hover:opacity-90 transition-opacity"
      style={{
        width: '376px',
        maxWidth: '100%',
        height: 'auto',
        minHeight: '376px',
        gap: '8px',
        borderRadius: '12px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#DFDFDF',
        padding: '8px',
        backgroundColor: '#FAF9F6',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* Background Image Section */}
      <div 
        className="relative"
        style={{
          width: '100%',
          height: '200px',
          borderRadius: '4px',
          opacity: 1,
          overflow: 'hidden',
          marginBottom: '8px',
          flexShrink: 0
        }}
      >
        {image ? (
          <img
            src={backgroundImageError ? PLACEHOLDER_IMAGE : image}
            alt={`${name} background`}
            className="w-full h-full object-cover"
            style={{
              borderRadius: '4px'
            }}
            onError={() => setBackgroundImageError(true)}
          />
        ) : (
          <div 
            className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center"
            style={{
              borderRadius: '4px'
            }}
          >
            <span className="text-white text-4xl font-bold">
              {name.charAt(0)}
            </span>
          </div>
        )}
        
        {/* Top Creator Badge - Top Left Corner */}
        {isTopCreator && (
          <div
            className="absolute top-2 left-2"
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid #1E002B',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              zIndex: 10
            }}
          >
            {/* Top Creator Badge Icon */}
            <img src={BadgeIcon} alt="Top Creator" style={{ width: '18px', height: '18px' }} />
            <span
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '12px',
                fontWeight: 600,
                color: '#1E002B'
              }}
            >
              Top Creator
            </span>
          </div>
        )}
        
        {/* Rating Badge - Top Right Corner */}
        {rating !== undefined && rating !== null && (
          <div
            className="absolute top-2 right-2"
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              zIndex: 10
            }}
          >
            <img src={StarIcon} alt="Star" style={{ width: '14px', height: '14px' }} />
            <span
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: '#333'
              }}
            >
              {rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px',
          flex: 1
        }}
      >
        {/* Profile Image and Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              backgroundColor: '#E0D5E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {profileImage && !profileImageError ? (
              <img
                src={profileImage}
                alt={name}
                className="w-full h-full object-cover"
                onError={() => setProfileImageError(true)}
              />
            ) : (
              <span
                style={{
                  fontSize: '20px',
                  color: '#783C91',
                  fontWeight: 600,
                  fontFamily: 'Poppins, sans-serif'
                }}
              >
                {name ? name.charAt(0).toUpperCase() : '?'}
              </span>
            )}
          </div>
          <h3 
            className="font-semibold text-gray-900"
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              margin: 0
            }}
          >
            {name}
          </h3>
        </div>

        {/* Description */}
        {description && (
          <p 
            className="text-sm text-gray-600"
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              margin: 0,
              lineHeight: '1.4'
            }}
          >
            {description}
          </p>
        )}

        {/* Platform Followers - Bottom Row */}
        {platformFollowers && (
          <div 
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              marginTop: 'auto',
              paddingTop: '8px'
            }}
          >
            {platformFollowers.x !== undefined && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: `1px solid ${getPlatformColor('x')}`,
                  fontSize: '12px'
                }}
              >
                <div style={{ color: getPlatformColor('x'), display: 'flex', alignItems: 'center' }}>
                  <PlatformIcon platform="x" size={16} />
                </div>
                <span style={{ fontFamily: 'Poppins, sans-serif', color: '#333' }}>
                  {formatFollowers(platformFollowers.x)}
                </span>
              </div>
            )}
            {platformFollowers.youtube !== undefined && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: `1px solid ${getPlatformColor('youtube')}`,
                  fontSize: '12px'
                }}
              >
                <div style={{ color: getPlatformColor('youtube'), display: 'flex', alignItems: 'center' }}>
                  <PlatformIcon platform="youtube" size={16} />
                </div>
                <span style={{ fontFamily: 'Poppins, sans-serif', color: '#333' }}>
                  {formatFollowers(platformFollowers.youtube)}
                </span>
              </div>
            )}
            {platformFollowers.facebook !== undefined && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: `1px solid ${getPlatformColor('facebook')}`,
                  fontSize: '12px'
                }}
              >
                <div style={{ color: getPlatformColor('facebook'), display: 'flex', alignItems: 'center' }}>
                  <PlatformIcon platform="facebook" size={16} />
                </div>
                <span style={{ fontFamily: 'Poppins, sans-serif', color: '#333' }}>
                  {formatFollowers(platformFollowers.facebook)}
                </span>
              </div>
            )}
            {platformFollowers.instagram !== undefined && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: `1px solid ${getPlatformColor('instagram')}`,
                  fontSize: '12px'
                }}
              >
                <div style={{ color: getPlatformColor('instagram'), display: 'flex', alignItems: 'center' }}>
                  <PlatformIcon platform="instagram" size={16} />
                </div>
                <span style={{ fontFamily: 'Poppins, sans-serif', color: '#333' }}>
                  {formatFollowers(platformFollowers.instagram)} 
                </span>
              </div>
            )}
            {platformFollowers.tiktok !== undefined && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: `1px solid ${getPlatformColor('tiktok')}`,
                  fontSize: '12px'
                }}
              >
                <div style={{ color: getPlatformColor('tiktok'), display: 'flex', alignItems: 'center' }}>
                  <PlatformIcon platform="tiktok" size={16} />
                </div>
                <span style={{ fontFamily: 'Poppins, sans-serif', color: '#333' }}>
                  {formatFollowers(platformFollowers.tiktok)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

