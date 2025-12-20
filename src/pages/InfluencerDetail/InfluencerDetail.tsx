import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { InfluencerDetailFrame } from '../../components';
import { EditName } from '../../components/molecules/EditName/EditName';
import { EditDescription } from '../../components/molecules/EditDescription/EditDescription';
import { EditLocation } from '../../components/molecules/EditLocation/EditLocation';
import { EditProfilePhoto } from '../../components/molecules/EditProfilePhoto/EditProfilePhoto';
import { useInfluencer } from '../../hooks';
import { useAuth } from '../../contexts/AuthContext';
import { influencerService } from '../../services/influencerService';
import { apiService } from '../../services/api';
import { 
  XIcon, 
  YouTubeIcon, 
  FacebookIcon, 
  InstagramIcon, 
  TikTokIcon, 
  BadgeIcon,
  VerifiedIcon,
  BackwardIcon,
  ArrowDropDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '../../assets/icons';

// Placeholder data for shorts and videos (can be replaced with API later)
const mockShorts = Array.from({ length: 6 }, (_, i) => ({
  id: `short-${i + 1}`,
  thumbnail: `https://picsum.photos/200/300?random=${i + 10}`,
}));

const mockVideos = [
  { id: 'video-1', thumbnail: 'https://picsum.photos/400/300?random=20' },
  { id: 'video-2', thumbnail: 'https://picsum.photos/400/300?random=21' },
  { id: 'video-4', thumbnail: 'https://picsum.photos/400/300?random=23' },
];

export const InfluencerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if id is a MongoDB ObjectId (24 hex characters) or userId
  const isMongoObjectId = (id: string): boolean => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  // Get authenticated user
  const { user } = useAuth();

  // Fetch influencer data using the hook
  const { influencer, isLoading, error, fetchInfluencerById, fetchInfluencer } = useInfluencer();

  useEffect(() => {
    if (!id) return;

    // Use influencerId endpoint if it's a MongoDB ObjectId, otherwise use userId endpoint
    if (isMongoObjectId(id)) {
      fetchInfluencerById(id);
    } else {
      fetchInfluencer(id);
    }
  }, [id, fetchInfluencerById, fetchInfluencer]);

  // Determine the base path and discover route based on current route
  const getDiscoverPath = () => {
    if (location.pathname.startsWith('/brand')) {
      return '/brand';
    } else if (location.pathname.startsWith('/influencer')) {
      return '/influencer';
    } else {
      return '/home/discover';
    }
  };
  const [currentVideoSlide, setCurrentVideoSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'initial' | 'animating'>('initial');
  const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false);
  const prevSlideRef = useRef(0);

  // Edit modal states
  const [showEditName, setShowEditName] = useState(false);
  const [showEditDescription, setShowEditDescription] = useState(false);
  const [showEditLocation, setShowEditLocation] = useState(false);
  const [showEditProfileImage, setShowEditProfileImage] = useState(false);
  const [showEditBackgroundImage, setShowEditBackgroundImage] = useState(false);
  
  // Edit operation loading states
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isUpdatingDescription, setIsUpdatingDescription] = useState(false);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [isUpdatingProfileImage, setIsUpdatingProfileImage] = useState(false);
  const [isUpdatingBackgroundImage, setIsUpdatingBackgroundImage] = useState(false);
  
  // Handle animation phases
  useEffect(() => {
    if (isAnimating && animationPhase === 'initial') {
      // After initial render with offset, trigger animation to center
      const timer = setTimeout(() => {
        setAnimationPhase('animating');
      }, 50);
      return () => clearTimeout(timer);
    } else if (!isAnimating) {
      setAnimationPhase('initial');
    }
  }, [isAnimating, animationPhase]);

  // Auto-play functionality - change slide every 2 seconds
  useEffect(() => {
    // Don't auto-play if paused, animating, or no videos
    if (isAutoPlayPaused || isAnimating || mockVideos.length === 0) return;

    const autoPlayInterval = setInterval(() => {
      // Auto-advance to next slide (right direction)
      prevSlideRef.current = currentVideoSlide;
      setSlideDirection('right');
      setIsAnimating(true);
      
      const newSlideIndex = currentVideoSlide === mockVideos.length - 1 ? 0 : currentVideoSlide + 1;
      
      requestAnimationFrame(() => {
        setCurrentVideoSlide(newSlideIndex);
        
        // After animation completes, reset animation state
        setTimeout(() => {
          setIsAnimating(false);
          setSlideDirection(null);
          setAnimationPhase('initial');
        }, 600); // Match transition duration
      });
    }, 2000); // Change slide every 2 seconds

    return () => clearInterval(autoPlayInterval);
  }, [isAutoPlayPaused, isAnimating, currentVideoSlide, mockVideos.length]);

  // Map API data to component format
  const influencerData = useMemo(() => {
    if (!influencer) return null;

    // Determine which platforms the influencer has based on platformFollowers
    const platforms: Array<'instagram' | 'youtube' | 'tiktok' | 'x' | 'facebook'> = [];
    if (influencer.platformFollowers?.x) platforms.push('x');
    if (influencer.platformFollowers?.youtube) platforms.push('youtube');
    if (influencer.platformFollowers?.facebook) platforms.push('facebook');
    if (influencer.platformFollowers?.instagram) platforms.push('instagram');
    if (influencer.platformFollowers?.tiktok) platforms.push('tiktok');

    // Format location
    const locationStr = influencer.location 
      ? `${influencer.location.city || ''}${influencer.location.city && influencer.location.country ? ', ' : ''}${influencer.location.country || ''}`.trim()
      : '';

    return {
      id: influencer._id,
      name: influencer.user?.name || 'Influencer',
      image: influencer.coverImage,
      profileImage: influencer.profileImage || influencer.user?.avatar,
      rating: influencer.rating,
      description: influencer.description || influencer.bio || '',
      location: locationStr,
      isTopCreator: influencer.isTopCreator,
      hasVerifiedPayment: influencer.hasVerifiedPayment,
      platformFollowers: influencer.platformFollowers || {},
      platforms,
    };
  }, [influencer]);

  // Handler to refresh influencer data
  const refreshInfluencerData = useCallback(async () => {
    if (!id) return;
    
    try {
      if (isMongoObjectId(id)) {
        await fetchInfluencerById(id);
      } else {
        await fetchInfluencer(id);
      }
    } catch (err: any) {
      console.error('Failed to refresh influencer data:', err);
    }
  }, [id, fetchInfluencerById, fetchInfluencer]);

  // Handler for saving name
  const handleSaveName = useCallback(async (name: string) => {
    try {
      setIsUpdatingName(true);
      
      // Update user name via auth API
      await apiService.put('/auth/me', { name });
      
      // Refresh influencer data
      await refreshInfluencerData();
      setShowEditName(false);
    } catch (err: any) {
      console.error('Error updating name:', err);
      alert(err.message || 'Failed to update name');
    } finally {
      setIsUpdatingName(false);
    }
  }, [refreshInfluencerData]);

  // Handler for saving description
  const handleSaveDescription = useCallback(async (description: string) => {
    if (!user?.id) {
      alert('You must be logged in to update your profile');
      return;
    }

    try {
      setIsUpdatingDescription(true);
      
      await influencerService.updateInfluencer(user.id, {
        description,
      });
      
      await refreshInfluencerData();
      setShowEditDescription(false);
    } catch (err: any) {
      console.error('Error updating description:', err);
      alert(err.message || 'Failed to update description');
    } finally {
      setIsUpdatingDescription(false);
    }
  }, [user, refreshInfluencerData]);

  // Handler for saving location
  const handleSaveLocation = useCallback(async (location: {
    city?: string;
    country?: string;
    state?: string;
    address?: string;
    pincode?: string;
  }) => {
    if (!user?.id) {
      alert('You must be logged in to update your profile');
      return;
    }

    try {
      setIsUpdatingLocation(true);
      
      await influencerService.updateInfluencer(user.id, {
        location,
      });
      
      await refreshInfluencerData();
      setShowEditLocation(false);
    } catch (err: any) {
      console.error('Error updating location:', err);
      alert(err.message || 'Failed to update location');
    } finally {
      setIsUpdatingLocation(false);
    }
  }, [user, refreshInfluencerData]);

  // Handler for saving profile image
  const handleSaveProfileImage = useCallback(async (profileImageFile: File | null) => {
    if (!user?.id) {
      alert('You must be logged in to update your profile');
      return;
    }

    if (!profileImageFile) {
      setShowEditProfileImage(false);
      return;
    }

    try {
      setIsUpdatingProfileImage(true);
      
      await influencerService.updateInfluencer(
        user.id,
        {},
        profileImageFile
      );
      
      await refreshInfluencerData();
      setShowEditProfileImage(false);
    } catch (err: any) {
      console.error('Error updating profile image:', err);
      alert(err.message || 'Failed to update profile image');
    } finally {
      setIsUpdatingProfileImage(false);
    }
  }, [user, refreshInfluencerData]);

  // Handler for saving background image
  const handleSaveBackgroundImage = useCallback(async (coverImageFile: File | null) => {
    if (!user?.id) {
      alert('You must be logged in to update your profile');
      return;
    }

    if (!coverImageFile) {
      setShowEditBackgroundImage(false);
      return;
    }

    try {
      setIsUpdatingBackgroundImage(true);
      
      await influencerService.updateInfluencer(
        user.id,
        {},
        undefined,
        coverImageFile
      );
      
      await refreshInfluencerData();
      setShowEditBackgroundImage(false);
    } catch (err: any) {
      console.error('Error updating background image:', err);
      alert(err.message || 'Failed to update background image');
    } finally {
      setIsUpdatingBackgroundImage(false);
    }
  }, [user, refreshInfluencerData]);

  const scrollVideos = (direction: 'left' | 'right') => {
    if (isAnimating) return; // Prevent rapid clicking during animation
    
    // Pause auto-play when user manually navigates
    setIsAutoPlayPaused(true);
    
    // Store previous slide index before changing
    prevSlideRef.current = currentVideoSlide;
    
    setSlideDirection(direction);
    setIsAnimating(true);
    
    // Calculate new slide index
    const newSlideIndex = direction === 'left' 
      ? (currentVideoSlide === 0 ? mockVideos.length - 1 : currentVideoSlide - 1)
      : (currentVideoSlide === mockVideos.length - 1 ? 0 : currentVideoSlide + 1);
    
    // First, set the initial animation state (slides at offset positions)
    // Then after a tiny delay, update the slide index to trigger the animation
    requestAnimationFrame(() => {
      setCurrentVideoSlide(newSlideIndex);
      
      // After animation completes, reset animation state
      setTimeout(() => {
        setIsAnimating(false);
        setSlideDirection(null);
        setAnimationPhase('initial');
        
        // Resume auto-play after 5 seconds of inactivity
        setTimeout(() => {
          setIsAutoPlayPaused(false);
        }, 5000);
      }, 600); // Match transition duration
    });
  };

  // Helper function to get video index with wrapping
  const getVideoIndex = (baseIndex: number, offset: number): number => {
    const total = mockVideos.length;
    let newIndex = baseIndex + offset;
    if (newIndex < 0) {
      newIndex = total + newIndex; // Wrap to end
    } else if (newIndex >= total) {
      newIndex = newIndex - total; // Wrap to start
    }
    return newIndex;
  };

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

  // Loading state
  if (isLoading) {
    return (
      <>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div 
          className="min-h-screen py-8"
          style={{
            background: 'linear-gradient(135deg, rgba(235, 188, 254, 0.3) 0%, rgba(240, 196, 105, 0.3) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #783C91',
              borderTop: '4px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{ fontFamily: 'Poppins', color: '#666' }}>
              Loading influencer profile...
            </p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error || !influencerData) {
    return (
      <div 
        className="min-h-screen py-8"
        style={{
          background: 'linear-gradient(135deg, rgba(235, 188, 254, 0.3) 0%, rgba(240, 196, 105, 0.3) 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(getDiscoverPath())}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '24px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              color: '#783C91'
            }}
          >
            <img src={BackwardIcon} alt="Back" style={{ width: '16px', height: '16px' }} />
            <span>Back to campaign listing</span>
          </button>
          <div style={{ 
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            padding: '32px',
            textAlign: 'center'
          }}>
            <h2 style={{ fontFamily: 'Poppins', fontSize: '20px', color: '#1E002B', marginBottom: '8px' }}>
              {error || 'Influencer not found'}
            </h2>
            <p style={{ fontFamily: 'Poppins', fontSize: '14px', color: '#666' }}>
              The influencer profile you're looking for doesn't exist or couldn't be loaded.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-8"
      style={{
        background: 'linear-gradient(135deg, rgba(235, 188, 254, 0.3) 0%, rgba(240, 196, 105, 0.3) 100%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(getDiscoverPath())}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '24px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            fontFamily: 'Poppins, sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            color: '#783C91'
          }}
        >
          <img src={BackwardIcon} alt="Back" style={{ width: '16px', height: '16px' }} />
          <span>Back to campaign listing</span>
        </button>

        {/* Main Content Frame */}
        <div
          style={{
            width: '1440px',
            maxWidth: '100%',
            height: '3510px',
            gap: '16px',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            margin: '0 auto'
          }}
        >
          {/* First Frame - Background Image */}
          <InfluencerDetailFrame
            backgroundImage={influencerData.image}
            profileImage={influencerData.profileImage}
            name={influencerData.name}
            location={influencerData.location}
            description={influencerData.description}
            platformFollowers={influencerData.platformFollowers}
            onEditProfileImage={() => setShowEditProfileImage(true)}
            onEditName={() => setShowEditName(true)}
            onEditLocation={() => setShowEditLocation(true)}
            onEditDescription={() => setShowEditDescription(true)}
            onEditBackgroundImage={() => setShowEditBackgroundImage(true)}
          />

         

            {/* Platform Followers Section - Left Aligned */}
            {influencerData.platformFollowers && (
              <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
                {influencerData.platformFollowers.x !== undefined && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: `1px solid ${getPlatformColor('x')}`,
                      fontSize: '14px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ color: getPlatformColor('x'), display: 'flex', alignItems: 'center' }}>
                      <PlatformIcon platform="x" size={20} />
                    </div>
                    <span style={{ fontFamily: 'Poppins, sans-serif', color: '#333', fontWeight: 600 }}>
                      {formatFollowers(influencerData.platformFollowers.x)} Followers
                    </span>
                  </div>
                )}
                {influencerData.platformFollowers.youtube !== undefined && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: `1px solid ${getPlatformColor('youtube')}`,
                      fontSize: '14px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ color: getPlatformColor('youtube'), display: 'flex', alignItems: 'center' }}>
                      <PlatformIcon platform="youtube" size={20} />
                    </div>
                    <span style={{ fontFamily: 'Poppins, sans-serif', color: '#333', fontWeight: 600 }}>
                      {formatFollowers(influencerData.platformFollowers.youtube)} Followers
                    </span>
                  </div>
                )}
                {influencerData.platformFollowers.facebook !== undefined && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: `1px solid ${getPlatformColor('facebook')}`,
                      fontSize: '14px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ color: getPlatformColor('facebook'), display: 'flex', alignItems: 'center' }}>
                      <PlatformIcon platform="facebook" size={20} />
                    </div>
                    <span style={{ fontFamily: 'Poppins, sans-serif', color: '#333', fontWeight: 600 }}>
                      {formatFollowers(influencerData.platformFollowers.facebook)} Followers
                    </span>
                  </div>
                )}
                {influencerData.platformFollowers.instagram !== undefined && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: `1px solid ${getPlatformColor('instagram')}`,
                      fontSize: '14px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ color: getPlatformColor('instagram'), display: 'flex', alignItems: 'center' }}>
                      <PlatformIcon platform="instagram" size={20} />
                    </div>
                    <span style={{ fontFamily: 'Poppins, sans-serif', color: '#333', fontWeight: 600 }}>
                      {formatFollowers(influencerData.platformFollowers.instagram)} Followers
                    </span>
                  </div>
                )}
                {influencerData.platformFollowers.tiktok !== undefined && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: `1px solid ${getPlatformColor('tiktok')}`,
                      fontSize: '14px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ color: getPlatformColor('tiktok'), display: 'flex', alignItems: 'center' }}>
                      <PlatformIcon platform="tiktok" size={20} />
                    </div>
                    <span style={{ fontFamily: 'Poppins, sans-serif', color: '#333', fontWeight: 600 }}>
                      {formatFollowers(influencerData.platformFollowers.tiktok)} Followers
                    </span>
                  </div>
                )}
              </div>
            )}

          {/* Verified Payment and Top Creator Badges - Left Aligned */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {influencerData.hasVerifiedPayment && (
              <div
                style={{
                  width: '388px',
                  height: '62px',
                  opacity: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  paddingTop: '8px',
                  paddingRight: '12px',
                  paddingBottom: '8px',
                  paddingLeft: '12px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E0E0E0',
                  borderWidth: '1px'
                }}
                >
                <img src={VerifiedIcon} alt="Verified" style={{ width: '24px', height: '24px', flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                  <div style={{ 
                    fontFamily: 'Poppins, sans-serif', 
                    fontSize: '16px', 
                    fontWeight: 600,
                    fontStyle: 'normal',
                    lineHeight: '100%',
                    letterSpacing: '0%',
                    color: '#1E002B'
                  }}>
                    Verified payment
                  </div>
                  <div style={{ 
                    fontFamily: 'Poppins, sans-serif', 
                    fontSize: '12px', 
                    fontWeight: 400,
                    fontStyle: 'normal',
                    lineHeight: '100%',
                    letterSpacing: '0%',
                    color: '#666'
                  }}>
                    The profile has been successfully verified and authenticated.
                  </div>
                </div>
              </div>
            )}
            {influencerData.isTopCreator && (
              <div
                style={{
                  width: '388px',
                  height: '62px',
                  opacity: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  paddingTop: '8px',
                  paddingRight: '12px',
                  paddingBottom: '8px',
                  paddingLeft: '12px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E0E0E0',
                  borderWidth: '1px'
                }}
              >
                <img src={BadgeIcon} alt="Top Creator" style={{ width: '24px', height: '24px', flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                  <div style={{ 
                    fontFamily: 'Poppins, sans-serif', 
                    fontSize: '16px', 
                    fontWeight: 600,
                    fontStyle: 'normal',
                    lineHeight: '100%',
                    letterSpacing: '0%',
                    color: '#1E002B'
                  }}>
                    Top Creator
                  </div>
                  <div style={{ 
                    fontFamily: 'Poppins, sans-serif', 
                    fontSize: '12px', 
                    fontWeight: 400,
                    fontStyle: 'normal',
                    lineHeight: '100%',
                    letterSpacing: '0%',
                    color: '#666'
                  }}>
                    Top creators have high ratings and completed multiple orders.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description Section */}
          <div style={{ marginBottom: '32px' }}>
            {/* Description Heading */}
            <h2
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '24px',
                fontWeight: 600,
                color: '#1E002B',
                marginBottom: '16px',
                textAlign: 'left'
              }}
            >
              Description
            </h2>
            
            {/* Description Body Text */}
            <p
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                color: '#666',
                lineHeight: '1.5',
                textAlign: 'left',
                marginBottom: '32px'
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>

            {/* Social Media Dropdown */}
            <div style={{ marginTop: '32px', marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#1E002B',
                  marginBottom: '10px'
                }}
              >
                Social media
              </label>
              <div
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '232px'
                }}
              >
                <select
                  style={{
                    width: '100%',
                    height: '56px',
                    opacity: 1,
                    padding: '12px 16px',
                    paddingRight: '40px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#1E002B',
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #783C91',
                    borderWidth: '2px',
                    borderRadius: '4px',
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                  defaultValue="instagram"
                >
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="facebook">Facebook</option>
                  <option value="x">X (Twitter)</option>
                  <option value="tiktok">TikTok</option>
                </select>
                <img
                  src={ArrowDropDownIcon}
                  alt="Dropdown"
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '20px',
                    height: '20px',
                    pointerEvents: 'none',
                    zIndex: 1
                  }}
                />
              </div>
            </div>
          </div>

          {/* Content Grid - Second Half */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {/* Shorts Section */}
            <div>
              {/* Shorts Header with Dropdown */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}
              >
                <h3
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '24px',
                    fontWeight: 600,
                    fontStyle: 'normal',
                    lineHeight: '100%',
                    letterSpacing: '0%',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    color: '#1E002B',
                    margin: 0
                  }}
                >
                  Shorts
                </h3>
                <div
                  style={{
                    position: 'relative',
                    display: 'inline-block'
                  }}
                >
                  <select
                    style={{
                      padding: '8px 32px 8px 12px',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      fontStyle: 'normal',
                      lineHeight: '100%',
                      letterSpacing: '0%',
                      verticalAlign: 'middle',
                      color: '#1E002B',
                      backgroundColor: '#FFFFFF',
                      border: 'none',
                      outline: 'none',
                      appearance: 'none',
                      cursor: 'pointer'
                    }}
                    defaultValue="7days"
                  >
                    <option value="7days">Last 7 days</option>
                    <option value="30days">Last 30 days</option>
                    <option value="90days">Last 90 days</option>
                  </select>
                  <img
                    src={ArrowDropDownIcon}
                    alt="Dropdown"
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '16px',
                      height: '16px',
                      pointerEvents: 'none',
                      zIndex: 1
                    }}
                  />
                </div>
              </div>
              
              {/* Shorts Slider */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '1376px',
                  height: '400px',
                  opacity: 1,
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  display: 'flex',
                  gap: '16px',
                  scrollBehavior: 'smooth',
                  scrollbarWidth: 'thin',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {mockShorts.map((short) => (
                  <div
                    key={short.id}
                    style={{
                      width: '245px',
                      height: '400px',
                      flexShrink: 0,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    <img
                      src={short.thumbnail}
                      alt={short.id}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Videos Section */}
            <div>
              {/* Videos Header with Dropdown */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}
              >
                <h3
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '24px',
                    fontWeight: 600,
                    fontStyle: 'normal',
                    lineHeight: '100%',
                    letterSpacing: '0%',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    color: '#1E002B',
                    margin: 0,
                    marginRight: '16px'
                  }}
                >
                  Videos
                </h3>
                <div
                  style={{
                    position: 'relative',
                    display: 'inline-block'
                  }}
                >
                  <select
                    style={{
                      padding: '8px 32px 8px 12px',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      fontStyle: 'normal',
                      lineHeight: '100%',
                      letterSpacing: '0%',
                      verticalAlign: 'middle',
                      color: '#1E002B',
                      backgroundColor: '#FFFFFF',
                      border: 'none',
                      outline: 'none',
                      appearance: 'none',
                      cursor: 'pointer'
                    }}
                    defaultValue="7days"
                  >
                    <option value="7days">Last 7 days</option>
                    <option value="30days">Last 30 days</option>
                    <option value="90days">Last 90 days</option>
                  </select>
                  <img
                    src={ArrowDropDownIcon}
                    alt="Dropdown"
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '16px',
                      height: '16px',
                      pointerEvents: 'none',
                      zIndex: 1
                    }}
                  />
                </div>
              </div>

              {/* Videos Slider */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '1376px',
                  height: '400px',
                  opacity: 1,
                  marginBottom: '16px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={() => setIsAutoPlayPaused(true)}
                onMouseLeave={() => setIsAutoPlayPaused(false)}
              >
                {(() => {
                  // Get all videos to display (active + 1 left + 1 right, with wrapping)
                  const videosToShow: Array<{ index: number; position: 'left' | 'center' | 'right'; distance: number }> = [];
                  
                  // Add active video
                  videosToShow.push({ index: currentVideoSlide, position: 'center', distance: 0 });
                  
                  // Add 1 video to the left (with wrapping)
                  const leftIndex = getVideoIndex(currentVideoSlide, -1);
                  // Ensure left video is different from active video
                  if (leftIndex !== currentVideoSlide) {
                    videosToShow.push({ index: leftIndex, position: 'left', distance: 1 });
                  }
                  
                  // Add 1 video to the right (with wrapping)
                  const rightIndex = getVideoIndex(currentVideoSlide, 1);
                  // Ensure right video is different from active video
                  if (rightIndex !== currentVideoSlide) {
                    videosToShow.push({ index: rightIndex, position: 'right', distance: 1 });
                  }
                  
                  return videosToShow.map(({ index, position, distance }) => {
                    const video = mockVideos[index];
                    const isActive = position === 'center';
                    
                    // Calculate position and size based on distance from active slide
                    let left: string | number = 0;
                    let width = '300px';
                    let height = '300px';
                    let borderRadius = '20px';
                    let opacity = 0.6;
                    let zIndex = distance; // Closer videos have higher z-index
                    let transform = 'scale(0.85)';
                    
                    // Calculate animation offset based on slide direction
                    let translateX = 0;
                    // Active videos always have full opacity, regardless of animation state
                    let animationOpacity = isActive ? 1 : opacity;
                    
                    if (isAnimating && slideDirection) {
                      if (isActive) {
                        // Check if this is the new slide (just became active) or old slide (was active)
                        const isNewSlide = index === currentVideoSlide;
                        const wasOldSlide = index === prevSlideRef.current;
                        
                        if (isNewSlide && !wasOldSlide) {
                          // New slide: animate in from opposite direction
                          // Keep full opacity - don't blur the active video
                          if (animationPhase === 'initial') {
                            // Start position: offset from center
                            translateX = slideDirection === 'right' ? 250 : -250;
                            animationOpacity = 1; // Keep full opacity
                          } else {
                            // Animate to center
                            translateX = 0;
                            animationOpacity = 1; // Keep full opacity
                          }
                        } else if (wasOldSlide && !isNewSlide) {
                          // Old slide: animate out in the direction of navigation
                          translateX = slideDirection === 'right' ? -250 : 250;
                          animationOpacity = 0.2;
                        } else {
                          // Active slide that's not animating - keep full opacity
                          animationOpacity = 1;
                        }
                      } else if (position === 'left') {
                        // Left slide: when sliding right, it moves further left and fades
                        if (slideDirection === 'right') {
                          translateX = -100;
                          animationOpacity = Math.max(0.2, opacity - 0.4);
                        }
                      } else if (position === 'right') {
                        // Right slide: when sliding left, it moves further right and fades
                        if (slideDirection === 'left') {
                          translateX = 100;
                          animationOpacity = Math.max(0.2, opacity - 0.4);
                        }
                      }
                    }
                    
                    if (isActive) {
                      // Center video - prominent
                      // Always ensure full opacity for active video, never transparent
                      left = '200px';
                      width = '748px';
                      height = '400px';
                      borderRadius = '40px';
                      opacity = 1; // Always full opacity for active video
                      zIndex = 10;
                      transform = `scale(1) translateX(${translateX}px)`;
                    } else if (position === 'left') {
                      // Background video - 588px wide, 320px tall, 80% overlapped (20% visible)
                      width = '588px';
                      height = '320px';
                      opacity = animationOpacity;
                      // Active video starts at 200px
                      // 80% overlapped means right edge should be at 200 + (588 * 0.8) = 670.4px
                      // So left = 670.4 - 588 = 82.4px
                      const overlappedWidth = 588 * 0.8; // 80% overlapped
                      left = `${200 + overlappedWidth - 588}px`;
                      transform = `scale(0.85) translateX(${translateX}px)`;
                    } else {
                      // Background video - 588px wide, 320px tall, 80% overlapped (20% visible)
                      width = '588px';
                      height = '320px';
                      opacity = animationOpacity;
                      // Active video ends at 200 + 748 = 948px
                      // 80% overlapped means left edge should be at 948 - (588 * 0.8) = 477.6px
                      const overlappedWidth = 588 * 0.8; // 80% overlapped
                      left = `${948 - overlappedWidth}px`;
                      transform = `scale(0.85) translateX(${translateX}px)`;
                    }
                  
                  return (
                    <div
                      key={`${position}-${index}-${video.id}`}
                      onClick={() => {
                        if (isAnimating) return;
                        setIsAutoPlayPaused(true);
                        prevSlideRef.current = currentVideoSlide;
                        setSlideDirection(index > currentVideoSlide ? 'right' : 'left');
                        setIsAnimating(true);
                        
                        requestAnimationFrame(() => {
                          setCurrentVideoSlide(index);
                          
                          setTimeout(() => {
                            setIsAnimating(false);
                            setSlideDirection(null);
                            setAnimationPhase('initial');
                            
                            // Resume auto-play after 5 seconds of inactivity
                            setTimeout(() => {
                              setIsAutoPlayPaused(false);
                            }, 5000);
                          }, 600);
                        });
                      }}
                      style={{
                        position: 'absolute',
                        left: left,
                        width: width,
                        height: height,
                        borderRadius: borderRadius,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        opacity: opacity,
                        zIndex: zIndex,
                        transform: transform,
                        transition: isAnimating 
                          ? 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)' 
                          : 'all 0.3s ease',
                        boxShadow: isActive ? '0 8px 24px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.1)',
                        willChange: isAnimating ? 'transform, left, opacity' : 'auto'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.opacity = '0.8';
                          e.currentTarget.style.transform = 'scale(0.9)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.opacity = '0.6';
                          e.currentTarget.style.transform = 'scale(0.85)';
                        }
                      }}
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.id}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  );
                });
                })()}
              </div>

              {/* Navigation Controls */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px'
                }}
              >
                {/* Left Arrow */}
                <button
                  onClick={() => scrollVideos('left')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img
                    src={ArrowLeftIcon}
                    alt="Previous"
                    style={{
                      width: '24px',
                      height: '24px',
                      filter: 'brightness(0) saturate(100%) invert(27%) sepia(89%) saturate(2000%) hue-rotate(260deg) brightness(90%) contrast(90%)'
                    }}
                  />
                </button>

                {/* Dots Indicator */}
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                  }}
                >
                  {mockVideos.map((_, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        if (isAnimating || index === currentVideoSlide) return;
                        setIsAutoPlayPaused(true);
                        prevSlideRef.current = currentVideoSlide;
                        setSlideDirection(index > currentVideoSlide ? 'right' : 'left');
                        setIsAnimating(true);
                        
                        requestAnimationFrame(() => {
                          setCurrentVideoSlide(index);
                          
                          setTimeout(() => {
                            setIsAnimating(false);
                            setSlideDirection(null);
                            setAnimationPhase('initial');
                            
                            // Resume auto-play after 5 seconds of inactivity
                            setTimeout(() => {
                              setIsAutoPlayPaused(false);
                            }, 5000);
                          }, 600);
                        });
                      }}
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: index === currentVideoSlide ? '#783C91' : '#E0E0E0',
                        transition: 'background-color 0.2s',
                        cursor: index === currentVideoSlide ? 'default' : 'pointer'
                      }}
                    />
                  ))}
                </div>

                {/* Right Arrow */}
                <button
                  onClick={() => scrollVideos('right')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img
                    src={ArrowRightIcon}
                    alt="Next"
                    style={{
                      width: '24px',
                      height: '24px',
                      filter: 'brightness(0) saturate(100%) invert(27%) sepia(89%) saturate(2000%) hue-rotate(260deg) brightness(90%) contrast(90%)'
                    }}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div style={{ marginTop: '40px', marginBottom: '32px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '16px'
              }}
            >
              <h3
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#1E002B',
                  margin: 0,
                  marginRight: '16px'
                }}
              >
                Stats
              </h3>
              <div
                style={{
                  position: 'relative',
                  display: 'inline-block'
                }}
              >
                <select
                  style={{
                    padding: '8px 32px 8px 12px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#1E002B',
                    backgroundColor: '#FFFFFF',
                    border: 'none',
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                  defaultValue="7days"
                >
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="90days">Last 90 days</option>
                </select>
                <img
                  src={ArrowDropDownIcon}
                  alt="Dropdown"
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '16px',
                    height: '16px',
                    pointerEvents: 'none',
                    zIndex: 1
                  }}
                />
              </div>
            </div>

            {/* Stats Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                marginBottom: '32px'
              }}
            >
              {/* Views Chart Card */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E0E0E0',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '28px',
                      fontWeight: 600,
                      color: '#1E002B'
                    }}
                  >
                    14,744
                  </span>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>⋯</span>
                  </button>
                </div>
                <div
                  style={{
                    height: '120px',
                    background: 'linear-gradient(180deg, rgba(120, 60, 145, 0.2) 0%, rgba(120, 60, 145, 0.05) 100%)',
                    borderRadius: '4px',
                    position: 'relative'
                  }}
                >
                  {/* Simple bar chart representation */}
                  <svg width="100%" height="100%" style={{ display: 'block' }}>
                    {Array.from({ length: 30 }, (_, i) => (
                      <rect
                        key={i}
                        x={`${(i * 100) / 30}%`}
                        y={`${Math.random() * 50 + 20}%`}
                        width="2.5%"
                        height={`${Math.random() * 60 + 20}%`}
                        fill={i < 15 ? '#783C91' : '#DB9400'}
                        opacity="0.8"
                      />
                    ))}
                  </svg>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#783C91', borderRadius: '2px' }} />
                    <span style={{ color: '#666' }}>Organic</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#DB9400', borderRadius: '2px' }} />
                    <span style={{ color: '#666' }}>Sponsored</span>
                  </div>
                </div>
              </div>

              {/* Engagement Card */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E0E0E0',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '120px',
                    height: '120px',
                    marginBottom: '12px'
                  }}
                >
                  <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="#E0E0E0"
                      strokeWidth="10"
                      fill="none"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="#4CAF50"
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 50 * 0.65} ${2 * Math.PI * 50}`}
                    />
                  </svg>
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center'
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '24px',
                        fontWeight: 600,
                        color: '#1E002B'
                      }}
                    >
                      32,456
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    color: '#666'
                  }}
                >
                  Aggregate engagement
                </span>
              </div>

              {/* Campaign Stats Card */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E0E0E0',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '14px',
                      color: '#666',
                      marginBottom: '8px'
                    }}
                  >
                    Number of campaigns
                  </div>
                  <div
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '28px',
                      fontWeight: 600,
                      color: '#1E002B'
                    }}
                  >
                    12
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '14px',
                      color: '#666',
                      marginBottom: '8px'
                    }}
                  >
                    Avg campaign budget
                  </div>
                  <div
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '28px',
                      fontWeight: 600,
                      color: '#1E002B'
                    }}
                  >
                    ₹ 1,400
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '14px',
                      color: '#666',
                      marginBottom: '8px'
                    }}
                  >
                    Max campaign budget
                  </div>
                  <div
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '28px',
                      fontWeight: 600,
                      color: '#1E002B'
                    }}
                  >
                    ₹ 1,400
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Stats Badges */}
          <div style={{ marginBottom: '32px' }}>
            <h3
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '24px',
                fontWeight: 600,
                color: '#1E002B',
                marginBottom: '16px'
              }}
            >
              Campaign Stats
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#FFF9E6',
                  borderRadius: '20px',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#1E002B'
                }}
              >
                Level 1
              </span>
              <span
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#FFF9E6',
                  borderRadius: '20px',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#1E002B'
                }}
              >
                Level 2
              </span>
              <span
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#FFF9E6',
                  borderRadius: '20px',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#1E002B'
                }}
              >
                Rising 31
              </span>
              <span
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#FFF9E6',
                  borderRadius: '20px',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#1E002B'
                }}
              >
                Rising 21
              </span>
            </div>
          </div>

          {/* Reviews Section */}
          <div style={{ marginBottom: '32px' }}>
            <h3
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '24px',
                fontWeight: 600,
                color: '#1E002B',
                marginBottom: '8px'
              }}
            >
              Reviews (0)
            </h3>
            <p
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                color: '#666',
                marginBottom: '24px'
              }}
            >
              Share your review at the end of the project. Important ratings and reviews information.
            </p>

            {/* Sample Reviews */}
            {[1, 2, 3].map((review) => (
              <div
                key={review}
                style={{
                  borderBottom: '1px solid #E0E0E0',
                  paddingBottom: '16px',
                  marginBottom: '16px'
                }}
              >
                <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#E0E0E0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}
                  >
                    <img
                      src={`https://i.pravatar.cc/40?img=${review + 5}`}
                      alt="Reviewer"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#1E002B',
                        marginBottom: '4px'
                      }}
                    >
                      by Niko Tulg
                    </div>
                    <p
                      style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '14px',
                        color: '#666',
                        lineHeight: '1.5',
                        margin: 0
                      }}
                    >
                      Wow I love it launched at the end of the project. Important ratings and reviews information.
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <button
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: '#783C91',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              See more reviews →
            </button>
          </div>

          {/* Similar Influencers Section */}
          <div style={{ marginBottom: '32px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}
            >
              <h3
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#1E002B',
                  margin: 0
                }}
              >
                Similar influencers
              </h3>
              <button
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#783C91',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                See All
              </button>
            </div>

            {/* Influencer Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '16px'
              }}
            >
              {[1, 2, 3, 4, 5].map((influencer) => (
                <div
                  key={influencer}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Image */}
                  <div style={{ position: 'relative', paddingBottom: '100%' }}>
                    <img
                      src={`https://picsum.photos/300/300?random=${influencer + 50}`}
                      alt="Influencer"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                  {/* Info */}
                  <div style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#F0F0F0',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: 500
                        }}
                      >
                        5.0
                      </span>
                      <span
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#F0F0F0',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: 500
                        }}
                      >
                        210
                      </span>
                      <span
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#F0F0F0',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: 500
                        }}
                      >
                        K15
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#1E002B',
                        marginBottom: '4px'
                      }}
                    >
                      Influencer {influencer}
                    </div>
                    <div
                      style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '12px',
                        color: '#666'
                      }}
                    >
                      Cooking, Unfiltered
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modals */}
      <EditName
        isOpen={showEditName}
        onClose={() => {
          if (!isUpdatingName) {
            setShowEditName(false);
          }
        }}
        initialValue={influencerData?.name || ''}
        onSave={handleSaveName}
        title="Edit Name"
        instruction="Update your display name."
      />

      <EditDescription
        isOpen={showEditDescription}
        onClose={() => {
          if (!isUpdatingDescription) {
            setShowEditDescription(false);
          }
        }}
        initialValue={influencerData?.description || ''}
        onSave={handleSaveDescription}
        title="Edit Description"
        instruction="Share a brief overview of what you do and experiences that set you apart."
      />

      <EditLocation
        isOpen={showEditLocation}
        onClose={() => {
          if (!isUpdatingLocation) {
            setShowEditLocation(false);
          }
        }}
        initialValue={influencer?.location || {}}
        onSave={handleSaveLocation}
        title="Edit Location"
        instruction="Update your location information."
      />

      <EditProfilePhoto
        isOpen={showEditProfileImage}
        onClose={() => {
          if (!isUpdatingProfileImage) {
            setShowEditProfileImage(false);
          }
        }}
        initialPhoto={influencerData?.profileImage || ''}
        maxSize={10}
        maxDimensions="300x300"
        onSave={handleSaveProfileImage}
        title="Edit Profile Photo"
      />

      <EditProfilePhoto
        isOpen={showEditBackgroundImage}
        onClose={() => {
          if (!isUpdatingBackgroundImage) {
            setShowEditBackgroundImage(false);
          }
        }}
        initialPhoto={influencerData?.image || ''}
        maxSize={10}
        maxDimensions="1408x504"
        onSave={handleSaveBackgroundImage}
        title="Edit Background Image"
      />
    </div>
  );
};

