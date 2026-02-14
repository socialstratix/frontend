import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { colors } from '../../../constants/colors';
import { Input } from '../../atoms/Input/Input';
import { Button } from '../../atoms/Button/Button';
import { CloseIcon } from '../../../assets/icons';
import { 
  InstagramIcon, 
  FacebookIcon, 
  TikTokIcon, 
  XIcon, 
  YouTubeIcon 
} from '../../../assets/icons';
import { onboardingStep4Schema } from '../../../utils/validationSchemas';
import { normalizeSocialInput } from '../../../utils/socialMediaUtils';

interface SocialProfile {
  platform: 'youtube' | 'facebook' | 'instagram' | 'tiktok' | 'x';
  username: string;
  profileUrl?: string;
}

interface EditSocialAccountsProps {
  isOpen: boolean;
  onClose: () => void;
  initialSocialProfiles?: SocialProfile[];
  onSave: (socialMedia: Array<{ platform: string; username: string; profileUrl: string }>) => void;
}

export const EditSocialAccounts: React.FC<EditSocialAccountsProps> = ({
  isOpen,
  onClose,
  initialSocialProfiles = [],
  onSave,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(onboardingStep4Schema),
    defaultValues: {
      instagram: '',
      facebook: '',
      tiktok: '',
      x: '',
      youtube: '',
    },
  });

  // Initialize form with existing social profiles
  useEffect(() => {
    if (isOpen && initialSocialProfiles) {
      const formValues: Record<string, string> = {
        instagram: '',
        facebook: '',
        tiktok: '',
        x: '',
        youtube: '',
      };

      initialSocialProfiles.forEach((profile) => {
        // Extract username from profileUrl or use username directly
        let username = profile.username;
        if (profile.profileUrl && !username) {
          // Try to extract username from URL
          const urlMatch = profile.profileUrl.match(/(?:instagram\.com\/|facebook\.com\/|tiktok\.com\/@|x\.com\/|youtube\.com\/@)([^\/\?]+)/);
          if (urlMatch) {
            username = urlMatch[1];
          }
        }
        
        if (profile.platform === 'instagram') formValues.instagram = username || '';
        if (profile.platform === 'facebook') formValues.facebook = username || '';
        if (profile.platform === 'tiktok') formValues.tiktok = username || '';
        if (profile.platform === 'x') formValues.x = username || '';
        if (profile.platform === 'youtube') formValues.youtube = username || '';
      });

      reset(formValues);
    }
  }, [isOpen, initialSocialProfiles, reset]);

  if (!isOpen) return null;

  const onSubmit = (data: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    x?: string;
    youtube?: string;
  }) => {
    const socialMedia: Array<{ platform: string; username: string; profileUrl: string }> = [];
    const platforms = [
      { key: 'instagram' as const, platform: 'instagram' as const },
      { key: 'facebook' as const, platform: 'facebook' as const },
      { key: 'tiktok' as const, platform: 'tiktok' as const },
      { key: 'x' as const, platform: 'x' as const },
      { key: 'youtube' as const, platform: 'youtube' as const },
    ] as const;
    for (const { key, platform } of platforms) {
      const value = data[key]?.trim();
      if (!value) continue;
      const normalized = normalizeSocialInput(platform, value);
      if (normalized) {
        socialMedia.push({ platform, username: normalized.username, profileUrl: normalized.profileUrl });
      }
    }
    onSave(socialMedia);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const platforms = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: InstagramIcon,
      placeholder: 'Enter username or profile URL',
      field: 'instagram' as const,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: FacebookIcon,
      placeholder: 'Enter username or profile URL',
      field: 'facebook' as const,
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: TikTokIcon,
      placeholder: 'Enter username or profile URL',
      field: 'tiktok' as const,
    },
    {
      id: 'x',
      name: 'X',
      icon: XIcon,
      placeholder: 'Enter username or profile URL',
      field: 'x' as const,
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: YouTubeIcon,
      placeholder: 'Enter username or profile URL',
      field: 'youtube' as const,
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          backgroundColor: colors.primary.white,
          borderRadius: '8px',
          padding: '32px',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img src={CloseIcon} alt="Close" style={{ width: '20px', height: '20px' }} />
        </button>

        {/* Title */}
        <h2
          style={{
            fontFamily: 'Poppins',
            fontSize: '20px',
            fontWeight: 600,
            color: colors.text.primary,
            marginBottom: '8px',
            marginTop: 0,
          }}
        >
          Link your Social media Account
        </h2>

        {/* Instruction */}
        <p
          style={{
            fontFamily: 'Poppins',
            fontSize: '14px',
            color: colors.text.secondary,
            marginBottom: '24px',
            lineHeight: '1.5',
          }}
        >
          Add your username or profile URL for each platform. Leave a field empty to remove that account.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {platforms.map((platform) => (
              <div key={platform.id}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: colors.text.primary,
                    marginBottom: '8px',
                  }}
                >
                  <img src={platform.icon} alt={platform.name} style={{ width: '20px', height: '20px' }} />
                  {platform.name} Account
                </label>
                <Input
                  type="text"
                  placeholder={platform.placeholder}
                  variant="default"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    width: '100%',
                  }}
                  error={errors[platform.field]?.message}
                  {...register(platform.field)}
                />
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
            }}
          >
            <Button
              variant="outline"
              onClick={onClose}
              type="button"
              style={{
                padding: '8px 24px',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              CANCEL
            </Button>
            <Button
              variant="filled"
              type="submit"
              style={{
                padding: '8px 24px',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'uppercase',
                backgroundColor: colors.primary.main,
              }}
            >
              SAVE
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

