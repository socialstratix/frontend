import React, { useState, useEffect } from 'react';
import {
  LocationIcon,
  IosShareIcon,
  EditIcon,
} from '../../../assets/icons';
import { EditButton } from '../../atoms/EditButton/EditButton';

interface InfluencerDetailFrameProps {
  backgroundImage?: string;
  profileImage?: string;
  name: string;
  location?: string;
  description?: string;
  platformFollowers?: {
    x?: number;
    youtube?: number;
    facebook?: number;
    instagram?: number;
    tiktok?: number;
  };
  onEditProfileImage?: () => void;
  onEditName?: () => void;
  onEditLocation?: () => void;
  onEditDescription?: () => void;
  onEditBackgroundImage?: () => void;
}

export const InfluencerDetailFrame: React.FC<InfluencerDetailFrameProps> = ({
  backgroundImage,
  profileImage,
  name,
  location,
  description,
  onEditProfileImage,
  onEditName,
  onEditLocation,
  onEditDescription,
  onEditBackgroundImage,
}) => {
  const [backgroundImageError, setBackgroundImageError] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(backgroundImage);
  const [profileImageUrl, setProfileImageUrl] = useState(profileImage);
  const [backgroundImageTriedThumbnail, setBackgroundImageTriedThumbnail] = useState(false);
  const [profileImageTriedThumbnail, setProfileImageTriedThumbnail] = useState(false);

  // Reset states when image URLs change
  useEffect(() => {
    setBackgroundImageError(false);
    setBackgroundImageUrl(backgroundImage);
    setBackgroundImageTriedThumbnail(false);
  }, [backgroundImage]);

  useEffect(() => {
    setProfileImageError(false);
    setProfileImageUrl(profileImage);
    setProfileImageTriedThumbnail(false);
  }, [profileImage]);

  return (
    <div
      style={{
        width: '1408px',
        maxWidth: '100%',
        position: 'relative',
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        overflow: 'visible'
      }}
    >
      {/* Background Image - 100% width */}
      <div
        style={{
          width: '100%',
          height: '504px',
          opacity: 1,
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {backgroundImageUrl && !backgroundImageError ? (
          <img
            key={backgroundImageUrl}
            src={backgroundImageUrl}
            alt="Influencer background"
            loading="lazy"
            onError={() => {
              console.error('Failed to load background image:', backgroundImageUrl);
              // Try alternative URL format if it's a Google Drive URL and we haven't tried thumbnail yet
              if (backgroundImageUrl && backgroundImageUrl.includes('drive.google.com') && !backgroundImageTriedThumbnail) {
                const fileIdMatch = backgroundImageUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                if (fileIdMatch && fileIdMatch[1]) {
                  const fileId = fileIdMatch[1];
                  // Try thumbnail format as fallback
                  const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`;
                  console.log('Trying thumbnail format as fallback:', thumbnailUrl);
                  setBackgroundImageTriedThumbnail(true);
                  setBackgroundImageUrl(thumbnailUrl);
                  return; // Don't set error yet, let it try the thumbnail
                }
              }
              console.error('All attempts failed, showing placeholder');
              setBackgroundImageError(true);
            }}
            onLoad={() => {
              console.log('Background image loaded successfully:', backgroundImageUrl);
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to bottom right, #667eea, #764ba2)' }} />
        )}
        {/* Edit Button - Top Right Corner */}
        {onEditBackgroundImage && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              zIndex: 22
            }}
          >
            <EditButton onClick={onEditBackgroundImage} />
          </div>
        )}
      </div>

      {/* Profile Image - 50% overlapping on background image */}
      {profileImage && (
        <div
          style={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            overflow: 'visible',
            border: '6px solid white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 20,
            // Position at bottom edge: 50% on image (100px from bottom), 50% below
            left: '24px',
            top: '404px' // 504px (background height) - 100px (half of profile image)
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: '#E0D5E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {profileImageUrl && !profileImageError ? (
              <img
                key={profileImageUrl}
                src={profileImageUrl}
                alt="Influencer profile"
                loading="lazy"
                onError={() => {
                  console.error('Failed to load profile image:', profileImageUrl);
                  // Try alternative URL format if it's a Google Drive URL and we haven't tried thumbnail yet
                  if (profileImageUrl && profileImageUrl.includes('drive.google.com') && !profileImageTriedThumbnail) {
                    const fileIdMatch = profileImageUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                    if (fileIdMatch && fileIdMatch[1]) {
                      const fileId = fileIdMatch[1];
                      // Try thumbnail format as fallback
                      const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
                      console.log('Trying thumbnail format as fallback:', thumbnailUrl);
                      setProfileImageTriedThumbnail(true);
                      setProfileImageUrl(thumbnailUrl);
                      return; // Don't set error yet, let it try the thumbnail
                    }
                  }
                  console.error('All attempts failed, showing placeholder');
                  setProfileImageError(true);
                }}
                onLoad={() => {
                  console.log('Profile image loaded successfully:', profileImageUrl);
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  backgroundColor: '#E0D5E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  color: '#783C91',
                  fontWeight: 600
                }}
              >
                {name ? name.charAt(0).toUpperCase() : '?'}
              </div>
            )}
          </div>
          {/* Edit Button - Circular overlay on bottom-right corner */}
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              zIndex: 21,
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 1)',
              border: '2px solid rgba(120, 60, 145, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.2s ease'
            }}
            onClick={onEditProfileImage}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
            }}
          >
            <img 
              src={EditIcon} 
              alt="Edit" 
              style={{ 
                width: '16px', 
                height: '16px',
                display: 'block'
              }} 
            />
          </div>
        </div>
      )}

      {/* Content Section Below Background Image */}
      <div
        style={{
          paddingLeft: '24px',
          paddingRight: '24px',
          paddingBottom: '24px',
          paddingTop: profileImage ? '8px' : '4px', // 4px gap from background + 100px for profile image overlap
          display: 'flex',
          gap: '24px',
          alignItems: 'flex-start'
        }}
      >
        {/* Spacer for profile image */}
        {profileImage && (
          <div style={{ width: '200px', flexShrink: 0 }} />
        )}

        {/* Name, Location, Description */}
        <div
          style={{
            marginTop: '0px',
            flex: 1
          }}
        >
          {/* Name and Location - Horizontal Layout */}
          <div
            style={{
              display: 'flex',
            
              gap: '0px',
              marginBottom: '16px'
            }}
          >
            {/* Name */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <div
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '24px',
                  fontWeight: 600,
                  fontStyle: 'normal',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  color: '#1E002B'
                }}
              >
                {name}
              </div>
              <EditButton onClick={onEditName} />
            </div>
            
            {/* Separator */}
            {location && (
              <>
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 1
                  }}
                >
                  |
                </span>
                
                {/* Location */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: 1
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      width: '106px',
                      height: '24px'
                    }}
                  >
                    <img src={LocationIcon} alt="Location" style={{ width: '16px', height: '16px' }} />
                    <span
                      style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '14px',
                        fontWeight: 600,
                        fontStyle: 'normal',
                        lineHeight: '100%',
                        letterSpacing: '0%',
                        verticalAlign: 'middle',
                        color: '#1E002B'
                      }}
                    >
                      {location}
                    </span>
                  </div>
                  <EditButton onClick={onEditLocation} />
                </div>
              </>
            )}
          </div>

          {/* Description */}
          {description && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}
            >
              <div
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 400,
                  fontStyle: 'normal',
                  fontSize: '18px',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  textAlign: 'left',
                  verticalAlign: 'middle',
                  color: '#666',
                  flex: '0 1 auto',
                  maxWidth: '100%'
                }}
              >
                {description}
              </div>
              <EditButton onClick={onEditDescription} />
            </div>
          )}
        </div>

        {/* Action Buttons - Right Side */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignSelf: 'flex-start' }}>
            <button
              style={{
                width: '122px',
                height: '41px',
                opacity: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '0 16px',
                backgroundColor: 'white',
                border: 'none',
                borderWidth: '1px',
                borderRadius: '100px',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                fontStyle: 'normal',
                lineHeight: '100%',
                letterSpacing: '0%',
                textAlign: 'center',
                verticalAlign: 'middle',
                textTransform: 'uppercase',
                color: '#783C91',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#783C91';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = '#783C91';
              }}
            >
              <img src={IosShareIcon} alt="Share" style={{ width: '18px', height: '18px' }} />
              <span>SHARE</span>
            </button>

            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: 'white',
                border: '1px solid #783C91',
                borderRadius: '100px',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: '#783C91',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#783C91';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = '#783C91';
              }}
            >
             
              <span>SHORTLIST</span>
            </button>

            <button
              style={{
                width: '117px',
                height: '41px',
                opacity: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 16px',
                backgroundColor: '#EFECF0',
                color: '#783C91',
                border: 'none',
                borderRadius: '100px',
                boxShadow: '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                fontStyle: 'normal',
                lineHeight: '100%',
                letterSpacing: '0%',
                textAlign: 'center',
                verticalAlign: 'middle',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E0D5E5';
                e.currentTarget.style.boxShadow = '0px 2px 4px 2px rgba(0, 0, 0, 0.15), 0px 2px 3px 0px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#EFECF0';
                e.currentTarget.style.boxShadow = '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)';
              }}
            >
              CONNECT
            </button>
        </div>
      </div>
    </div>
  );
};

