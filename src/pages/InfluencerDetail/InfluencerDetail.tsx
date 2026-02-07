import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { InfluencerDetailFrame } from '../../components';
import { InfluencerCard } from '../../components/molecules/InfluencerCard/InfluencerCard';
import { EditName } from '../../components/molecules/EditName/EditName';
import { EditDescription } from '../../components/molecules/EditDescription/EditDescription';
import { EditLocation } from '../../components/molecules/EditLocation/EditLocation';
import { EditProfilePhoto } from '../../components/molecules/EditProfilePhoto/EditProfilePhoto';
import { EditTags } from '../../components/molecules/EditTags/EditTags';
import { EditSocialAccounts } from '../../components/molecules/EditSocialAccounts/EditSocialAccounts';
import { FloatingButton } from '../../components/molecules/FloatingButton/FloatingButton';
import { toastService } from '../../utils/toast';
import { EditButton } from '../../components/atoms/EditButton';
import { useInfluencer } from '../../hooks';
import { useAuth } from '../../contexts/AuthContext';
import { influencerService, type ContentItem, type FollowersResponse, type Influencer } from '../../services/influencerService';
import { apiService } from '../../services/api';
import { INFLUENCER_TAGS } from '../../constants/tags';
import { useConversations } from '../../hooks/useConversations';
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
  // Check if viewer is a brand (not an influencer) - Campaign Stats should only be visible to brands
  // Hide for influencers regardless of route - if userType is 'influencer', never show
  const userType = user?.userType?.toLowerCase();
  const isBrand = userType === 'influencer' 
    ? false 
    : (userType === 'brand' || location.pathname.startsWith('/brand'));
  
  // Fetch influencer data using the hook
  const { influencer, isLoading, error, fetchInfluencerById, fetchInfluencer } = useInfluencer();
  
  // Conversations hook for sending messages
  const { createConversation } = useConversations();
  
  // Check if the current user is viewing their own profile
  // Only allow editing if user is an influencer viewing their own profile
  // Brands should NEVER see edit buttons
  const isOwnProfile = useMemo(() => {
    if (!user || !influencer) {
      console.log('isOwnProfile check: missing user or influencer', { user: !!user, influencer: !!influencer });
      return false;
    }
    // If user is a brand, never allow editing
    if (isBrand || userType === 'brand') {
      console.log('isOwnProfile check: user is brand', { isBrand, userType });
      return false;
    }
    // Only allow editing if user is an influencer viewing their own profile
    // User object has 'id' field (not '_id')
    const influencerUserId = typeof influencer.userId === 'object' 
      ? (influencer.userId as any)?._id?.toString() 
      : influencer.userId?.toString();
    const currentUserId = user.id?.toString();
    
    // Also check if accessing by influencer _id and it matches
    const influencerId = influencer._id?.toString();
    const urlId = id;
    
    // Check if the influencer's userId matches the current user's id
    // OR if the URL id (influencer _id) matches and the user owns this influencer profile
    const matchesByUserId = influencerUserId === currentUserId;
    const matchesByInfluencerId = urlId && influencerId === urlId && influencerUserId === currentUserId;
    
    const result = (matchesByUserId || matchesByInfluencerId) && userType === 'influencer';
    
    console.log('isOwnProfile check:', {
      userType,
      currentUserId,
      influencerUserId,
      influencerId,
      urlId,
      matchesByUserId,
      matchesByInfluencerId,
      result
    });
    
    return result;
  }, [user, influencer, userType, isBrand, id]);

  // State for shorts, videos, and followers
  const [shorts, setShorts] = useState<ContentItem[]>([]);
  const [videos, setVideos] = useState<ContentItem[]>([]);
  const [followers, setFollowers] = useState<FollowersResponse | null>(null);
  const [shortsPeriod, setShortsPeriod] = useState<'7d' | '30d'>('7d');
  const [videosPeriod, setVideosPeriod] = useState<'7d' | '30d'>('7d');
  const [followersPeriod, setFollowersPeriod] = useState<'7d' | '30d'>('7d');
  const [isLoadingShorts, setIsLoadingShorts] = useState(false);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Use influencerId endpoint if it's a MongoDB ObjectId, otherwise use userId endpoint
    if (isMongoObjectId(id)) {
      fetchInfluencerById(id);
    } else {
      fetchInfluencer(id);
    }
    // fetchInfluencerById and fetchInfluencer are stable from useCallback, safe to omit from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fetch shorts, videos, and followers when influencer ID or period changes
  useEffect(() => {
    if (!id || !isMongoObjectId(id)) return;

    const fetchContentData = async () => {
      try {
        // Fetch shorts
        setIsLoadingShorts(true);
        const shortsData = await influencerService.getInfluencerShorts(id, shortsPeriod);
        setShorts(shortsData.items || []);
        setIsLoadingShorts(false);
      } catch (error) {
        console.error('Failed to fetch shorts:', error);
        setIsLoadingShorts(false);
        setShorts([]);
      }

      try {
        // Fetch videos
        setIsLoadingVideos(true);
        const videosData = await influencerService.getInfluencerVideos(id, videosPeriod);
        setVideos(videosData.items || []);
        setIsLoadingVideos(false);
        // Reset video slide to 0 when videos change
        setCurrentVideoSlide(0);
      } catch (error) {
        console.error('Failed to fetch videos:', error);
        setIsLoadingVideos(false);
        setVideos([]);
      }

      try {
        // Fetch followers
        setIsLoadingFollowers(true);
        const followersData = await influencerService.getInfluencerFollowers(id, followersPeriod);
        setFollowers(followersData);
        setIsLoadingFollowers(false);
      } catch (error) {
        console.error('Failed to fetch followers:', error);
        setIsLoadingFollowers(false);
        setFollowers(null);
      }
    };

    fetchContentData();
  }, [id, shortsPeriod, videosPeriod, followersPeriod]);

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
  const [showEditTags, setShowEditTags] = useState(false);
  const [showEditSocialAccounts, setShowEditSocialAccounts] = useState(false);
  
  // Profile completion state
  const [isProfileCompletionDismissed, setIsProfileCompletionDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('profileCompletionDismissed');
      return dismissed === 'true';
    }
    return false;
  });

  // Edit operation loading states
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isUpdatingDescription, setIsUpdatingDescription] = useState(false);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [isUpdatingProfileImage, setIsUpdatingProfileImage] = useState(false);
  const [isUpdatingBackgroundImage, setIsUpdatingBackgroundImage] = useState(false);
  const [isUpdatingTags, setIsUpdatingTags] = useState(false);
  const [isUpdatingSocialAccounts, setIsUpdatingSocialAccounts] = useState(false);
  
  // Similar influencers state
  const [similarInfluencers, setSimilarInfluencers] = useState<Influencer[]>([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  
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
    if (isAutoPlayPaused || isAnimating || videos.length === 0) return;

    const autoPlayInterval = setInterval(() => {
      // Auto-advance to next slide (right direction)
      prevSlideRef.current = currentVideoSlide;
      setSlideDirection('right');
      setIsAnimating(true);
      
      const newSlideIndex = currentVideoSlide === videos.length - 1 ? 0 : currentVideoSlide + 1;
      
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
  }, [isAutoPlayPaused, isAnimating, currentVideoSlide, videos.length]);

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
      name: influencer.user?.name || 'Influencer Name',
      image: influencer.coverImage || undefined, // Use URL directly as-is
      profileImage: influencer.profileImage || influencer.user?.avatar || undefined, // Use URL directly as-is
      rating: influencer.rating,
      description: influencer.description || influencer.bio || '',
      location: locationStr || 'Location not specified',
      isTopCreator: influencer.isTopCreator,
      hasVerifiedPayment: influencer.hasVerifiedPayment,
      platformFollowers: influencer.platformFollowers || {},
      platforms,
      tags: influencer.tags && influencer.tags.length > 0 ? influencer.tags : ['Tag 1', 'Tag 2', 'Tag 3'],
    };
  }, [influencer]);

  // Map social media platforms to profile URLs
  const socialProfilesMap = useMemo(() => {
    const map: Record<string, string> = {};
    influencer?.socialProfiles?.forEach(profile => {
      if (profile.profileUrl) {
        map[profile.platform] = profile.profileUrl;
      }
    });
    return map;
  }, [influencer]);

  // Calculate profile completion
  const profileCompletion = useMemo(() => {
    if (!influencer) return { percentage: 0, hasProfilePic: false, hasTags: false, hasDescription: false, hasSocialAccounts: false };
    
    const hasProfilePic = !!(influencer.profileImage || influencer.user?.avatar);
    const hasTags = !!(influencer.tags && influencer.tags.length > 0);
    const hasDescription = !!(influencer.description || influencer.bio);
    const hasSocialAccounts = !!(influencer.socialProfiles && influencer.socialProfiles.length > 0);
    
    let percentage = 0;
    if (hasProfilePic) percentage += 25;
    if (hasTags) percentage += 25;
    if (hasDescription) percentage += 25;
    if (hasSocialAccounts) percentage += 25;
    
    return {
      percentage,
      hasProfilePic,
      hasTags,
      hasDescription,
      hasSocialAccounts,
    };
  }, [influencer]);

  // Track previous completion percentage to detect transition to 100%
  const prevCompletionRef = useRef<number>(0);
  
  // Show toast and auto-dismiss when profile reaches 100%
  // Reset dismissed state when percentage drops below 100%
  useEffect(() => {
    const currentPercentage = profileCompletion.percentage;
    const prevPercentage = prevCompletionRef.current;
    
    // Only show toast when transitioning from <100% to 100%
    if (currentPercentage === 100 && prevPercentage < 100 && isOwnProfile) {
      toastService.success(' Congratulations! Your profile is 100% complete!');
      // Auto-dismiss the floating button when 100% complete
      setIsProfileCompletionDismissed(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('profileCompletionDismissed', 'true');
      }
    } else if (currentPercentage < 100 && isProfileCompletionDismissed && isOwnProfile) {
      // Reset dismissed state when percentage drops below 100% so button can show again
      setIsProfileCompletionDismissed(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('profileCompletionDismissed');
      }
    }
    
    // Update previous percentage
    prevCompletionRef.current = currentPercentage;
  }, [profileCompletion.percentage, isOwnProfile, isProfileCompletionDismissed]);

  // Handle profile completion dismiss
  const handleProfileCompletionDismiss = useCallback(() => {
    setIsProfileCompletionDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('profileCompletionDismissed', 'true');
    }
  }, []);

  // Handle view profiles navigation
  const handleViewProfiles = useCallback(() => {
    const baseRoute = location.pathname.split('/')[1] || 'influencer';
    // Navigate to landing page which shows influencer listings
    navigate(`/${baseRoute}`);
  }, [navigate, location.pathname]);

  // Fetch similar influencers based on tags
  useEffect(() => {
    const fetchSimilarInfluencers = async () => {
      if (!influencer?._id || !influencer?.tags?.length) {
        setSimilarInfluencers([]);
        return;
      }
      
      try {
        setIsLoadingSimilar(true);
        // Fetch influencers with matching tags
        const response = await influencerService.getAllInfluencers({
          tags: influencer.tags,
          limit: 10,
        });
        
        // Filter out current influencer
        const filtered = response.influencers.filter(
          inf => inf._id !== influencer._id
        );
        
        setSimilarInfluencers(filtered.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch similar influencers:', error);
        setSimilarInfluencers([]);
      } finally {
        setIsLoadingSimilar(false);
      }
    };
    
    fetchSimilarInfluencers();
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
      toastService.error(err.message || 'Failed to update name');
    } finally {
      setIsUpdatingName(false);
    }
  }, [refreshInfluencerData]);

  // Handler for saving description
  const handleSaveDescription = useCallback(async (description: string) => {
    if (!user?.id) {
      toastService.warning('You must be logged in to update your profile');
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
      toastService.error(err.message || 'Failed to update description');
    } finally {
      setIsUpdatingDescription(false);
    }
  }, [user, refreshInfluencerData]);

  // Handler for saving tags
  const handleSaveTags = useCallback(async (tags: string[]) => {
    if (!user?.id) {
      toastService.warning('You must be logged in to update your profile');
      return;
    }

    try {
      setIsUpdatingTags(true);
      
      await influencerService.updateInfluencer(user.id, {
        tags,
      });
      
      await refreshInfluencerData();
      setShowEditTags(false);
    } catch (err: any) {
      console.error('Error updating tags:', err);
      toastService.error(err.message || 'Failed to update tags');
    } finally {
      setIsUpdatingTags(false);
    }
  }, [user, refreshInfluencerData]);

  // Handler for saving social accounts
  const handleSaveSocialAccounts = useCallback(async (socialMedia: Array<{ platform: string; username: string; profileUrl: string }>) => {
    if (!user?.id) {
      toastService.warning('You must be logged in to update your profile');
      return;
    }

    try {
      setIsUpdatingSocialAccounts(true);
      
      await influencerService.updateInfluencer(user.id, {
        socialMedia,
      });
      
      await refreshInfluencerData();
      toastService.success('Social media accounts updated successfully');
      setShowEditSocialAccounts(false);
    } catch (err: any) {
      console.error('Error updating social accounts:', err);
      toastService.error(err.message || 'Failed to update social accounts');
    } finally {
      setIsUpdatingSocialAccounts(false);
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
      toastService.warning('You must be logged in to update your profile');
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
      toastService.error(err.message || 'Failed to update location');
    } finally {
      setIsUpdatingLocation(false);
    }
  }, [user, refreshInfluencerData]);

  // Handler for saving profile image
  const handleSaveProfileImage = useCallback(async (profileImageFile: File | null) => {
    if (!user?.id) {
      toastService.warning('You must be logged in to update your profile');
      return;
    }

    try {
      setIsUpdatingProfileImage(true);
      
      // Update influencer with new profile image or remove it
      await influencerService.updateInfluencer(
        user.id,
        {},
        profileImageFile // null means remove, File means upload
      );
      
      // Small delay to ensure backend has processed the update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Force refresh to get latest data from server with updated URLs
      const isMongoId = isMongoObjectId(id || '');
      if (isMongoId && id) {
        await fetchInfluencerById(id);
      } else if (user.id) {
        await fetchInfluencer(user.id);
      }
      
      toastService.success(profileImageFile ? 'Profile image updated successfully' : 'Profile image removed successfully');
      setShowEditProfileImage(false);
    } catch (err: any) {
      console.error('Error updating profile image:', err);
      toastService.error(err.message || 'Failed to update profile image');
    } finally {
      setIsUpdatingProfileImage(false);
    }
  }, [user, id, fetchInfluencerById, fetchInfluencer]);

  // Handler for saving background image
  // Handle sending a message to the influencer
  const handleSendMessage = useCallback(async () => {
    if (!influencer || !user || !isBrand) return;
    
    try {
      // Get the influencer's userId (not _id)
      const influencerUserId = typeof influencer.userId === 'object' 
        ? (influencer.userId as any)?._id?.toString() 
        : influencer.userId?.toString();
      
      if (!influencerUserId) {
        console.error('Influencer userId not found');
        return;
      }
      
      // Create or get existing conversation
      const conversation = await createConversation(influencerUserId);
      
      if (conversation) {
        // Navigate to messages page with conversation ID
        const baseRoute = location.pathname.split('/')[1] || 'brand';
        navigate(`/${baseRoute}/messages/${conversation._id}`);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  }, [influencer, user, isBrand, createConversation, navigate, location.pathname]);

  const handleSaveBackgroundImage = useCallback(async (coverImageFile: File | null) => {
    if (!user?.id) {
      toastService.warning('You must be logged in to update your profile');
      return;
    }

    try {
      setIsUpdatingBackgroundImage(true);
      
      // Update influencer with new cover image or remove it
      await influencerService.updateInfluencer(
        user.id,
        {},
        undefined,
        coverImageFile // null means remove, File means upload
      );
      
      // Small delay to ensure backend has processed the update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Force refresh to get latest data from server with updated URLs
      const isMongoId = isMongoObjectId(id || '');
      if (isMongoId && id) {
        await fetchInfluencerById(id);
      } else if (user.id) {
        await fetchInfluencer(user.id);
      }
      
      toastService.success(coverImageFile ? 'Background image updated successfully' : 'Background image removed successfully');
      setShowEditBackgroundImage(false);
    } catch (err: any) {
      console.error('Error updating background image:', err);
      toastService.error(err.message || 'Failed to update background image');
    } finally {
      setIsUpdatingBackgroundImage(false);
    }
  }, [user, id, fetchInfluencerById, fetchInfluencer]);

  const scrollVideos = (direction: 'left' | 'right') => {
    if (isAnimating || videos.length === 0) return; // Prevent rapid clicking during animation
    
    // Pause auto-play when user manually navigates
    setIsAutoPlayPaused(true);
    
    // Store previous slide index before changing
    prevSlideRef.current = currentVideoSlide;
    
    setSlideDirection(direction);
    setIsAnimating(true);
    
    // Calculate new slide index
    const newSlideIndex = direction === 'left' 
      ? (currentVideoSlide === 0 ? videos.length - 1 : currentVideoSlide - 1)
      : (currentVideoSlide === videos.length - 1 ? 0 : currentVideoSlide + 1);
    
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
    const total = videos.length;
    if (total === 0) return 0;
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
        background: 'linear-gradient(135deg, rgba(235, 188, 254, 0.3) 0%, rgba(240, 196, 105, 0.3) 100%)',
        position: 'relative'
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
            minHeight: 'auto',
            height: 'auto',
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
            tags={influencerData.tags}
            platformFollowers={influencerData.platformFollowers}
            onEditProfileImage={isOwnProfile ? () => setShowEditProfileImage(true) : undefined}
            onEditName={isOwnProfile ? () => setShowEditName(true) : undefined}
            onEditLocation={isOwnProfile ? () => setShowEditLocation(true) : undefined}
            onEditDescription={isOwnProfile ? () => setShowEditDescription(true) : undefined}
            onEditTags={isOwnProfile ? () => setShowEditTags(true) : undefined}
            onEditBackgroundImage={isOwnProfile ? () => setShowEditBackgroundImage(true) : undefined}
            onShare={isBrand && influencer && !isOwnProfile ? () => {
              // TODO: Implement share functionality
              console.log('Share clicked');
            } : undefined}
            onShortlist={isBrand && influencer && !isOwnProfile ? () => {
              // TODO: Implement shortlist functionality
              console.log('Shortlist clicked');
            } : undefined}
            onConnect={isBrand && influencer && !isOwnProfile ? handleSendMessage : undefined}
          />

         

            {/* Platform Followers Section - Left Aligned */}
            {(followers || isLoadingFollowers || isOwnProfile) && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '20px', fontWeight: 600, color: '#1E002B', margin: 0 }}>
                    Followers
                  </h3>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
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
                      value={followersPeriod === '7d' ? '7days' : '30days'}
                      onChange={(e) => {
                        const newPeriod = e.target.value === '7days' ? '7d' : '30d';
                        setFollowersPeriod(newPeriod);
                      }}
                    >
                      <option value="7days">Last 7 days</option>
                      <option value="30days">Last 30 days</option>
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
                {isLoadingFollowers ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', minHeight: '60px' }}>
                    <span style={{ color: '#1E002B' }}>Loading followers...</span>
                  </div>
                ) : followers && (followers.platformFollowers?.x !== undefined || followers.platformFollowers?.youtube !== undefined || followers.platformFollowers?.facebook !== undefined || followers.platformFollowers?.instagram !== undefined || followers.platformFollowers?.tiktok !== undefined) ? (
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', minHeight: '44px' }}>
                  {followers.platformFollowers.x !== undefined && (
                  <a
                    href={socialProfilesMap['x'] || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!socialProfilesMap['x']) {
                        e.preventDefault();
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: `1px solid ${getPlatformColor('x')}`,
                      fontSize: '14px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      cursor: socialProfilesMap['x'] ? 'pointer' : 'default',
                      textDecoration: 'none',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (socialProfilesMap['x']) {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div style={{ color: getPlatformColor('x'), display: 'flex', alignItems: 'center' }}>
                      <PlatformIcon platform="x" size={20} />
                    </div>
                    <span style={{ fontFamily: 'Poppins, sans-serif', color: '#333', fontWeight: 600 }}>
                      {formatFollowers(followers.platformFollowers.x)} Followers
                    </span>
                  </a>
                  )}
                  {followers.platformFollowers.youtube !== undefined && (
                  <a
                    href={socialProfilesMap['youtube'] || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!socialProfilesMap['youtube']) {
                        e.preventDefault();
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: `1px solid ${getPlatformColor('youtube')}`,
                      fontSize: '14px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      cursor: socialProfilesMap['youtube'] ? 'pointer' : 'default',
                      textDecoration: 'none',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (socialProfilesMap['youtube']) {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div style={{ color: getPlatformColor('youtube'), display: 'flex', alignItems: 'center' }}>
                      <PlatformIcon platform="youtube" size={20} />
                    </div>
                    <span style={{ fontFamily: 'Poppins, sans-serif', color: '#333', fontWeight: 600 }}>
                      {formatFollowers(followers.platformFollowers.youtube)} Followers
                    </span>
                  </a>
                  )}
                  {followers.platformFollowers.facebook !== undefined && (
                  <a
                    href={socialProfilesMap['facebook'] || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!socialProfilesMap['facebook']) {
                        e.preventDefault();
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: `1px solid ${getPlatformColor('facebook')}`,
                      fontSize: '14px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      cursor: socialProfilesMap['facebook'] ? 'pointer' : 'default',
                      textDecoration: 'none',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (socialProfilesMap['facebook']) {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div style={{ color: getPlatformColor('facebook'), display: 'flex', alignItems: 'center' }}>
                      <PlatformIcon platform="facebook" size={20} />
                    </div>
                    <span style={{ fontFamily: 'Poppins, sans-serif', color: '#333', fontWeight: 600 }}>
                      {formatFollowers(followers.platformFollowers.facebook)} Followers
                    </span>
                  </a>
                  )}
                  {followers.platformFollowers.instagram !== undefined && (
                  <a
                    href={socialProfilesMap['instagram'] || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!socialProfilesMap['instagram']) {
                        e.preventDefault();
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: `1px solid ${getPlatformColor('instagram')}`,
                      fontSize: '14px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      cursor: socialProfilesMap['instagram'] ? 'pointer' : 'default',
                      textDecoration: 'none',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (socialProfilesMap['instagram']) {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div style={{ color: getPlatformColor('instagram'), display: 'flex', alignItems: 'center' }}>
                      <PlatformIcon platform="instagram" size={20} />
                    </div>
                    <span style={{ fontFamily: 'Poppins, sans-serif', color: '#333', fontWeight: 600 }}>
                      {formatFollowers(followers.platformFollowers.instagram)} Followers
                    </span>
                  </a>
                  )}
                  {followers.platformFollowers.tiktok !== undefined && (
                  <a
                    href={socialProfilesMap['tiktok'] || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!socialProfilesMap['tiktok']) {
                        e.preventDefault();
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: `1px solid ${getPlatformColor('tiktok')}`,
                      fontSize: '14px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      cursor: socialProfilesMap['tiktok'] ? 'pointer' : 'default',
                      textDecoration: 'none',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (socialProfilesMap['tiktok']) {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div style={{ color: getPlatformColor('tiktok'), display: 'flex', alignItems: 'center' }}>
                      <PlatformIcon platform="tiktok" size={20} />
                    </div>
                    <span style={{ fontFamily: 'Poppins, sans-serif', color: '#333', fontWeight: 600 }}>
                      {formatFollowers(followers.platformFollowers.tiktok)} Followers
                    </span>
                  </a>
                  )}
                  {isOwnProfile && <EditButton onClick={() => setShowEditSocialAccounts(true)} />}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', minHeight: '44px' }}>
                    <span style={{ color: '#999', fontStyle: 'italic' }}>
                      {isOwnProfile ? 'No followers data yet. Add social media accounts to see follower counts.' : 'No followers data available'}
                    </span>
                  </div>
                )}
              </div>
            )}

          {/* Verified Payment and Top Creator Badges - Left Aligned */}
          {(influencerData.hasVerifiedPayment || influencerData.isTopCreator) && (
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
          )}

          {/* Description Section - Only show if description exists or user can edit */}
          {(influencerData?.description || isOwnProfile) && (
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
              
              {/* Description Body Text with Edit Button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  marginBottom: influencerData?.description ? '32px' : '0',
                }}
              >
                {influencerData?.description ? (
                  <p
                    style={{
                      fontFamily: 'Poppins',
                      fontSize: '14px',
                      fontWeight: 400,
                      fontStyle: 'normal',
                      color: '#1E002B',
                      lineHeight: '100%',
                      letterSpacing: '0%',
                      verticalAlign: 'middle',
                      textAlign: 'left',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      wordBreak: 'break-word',
                      flex: 1,
                      margin: 0,
                    }}
                  >
                    {influencerData.description}
                  </p>
                ) : isOwnProfile ? (
                  <p
                    style={{
                      fontFamily: 'Poppins',
                      fontSize: '14px',
                      fontWeight: 400,
                      fontStyle: 'normal',
                      color: '#999',
                      lineHeight: '100%',
                      letterSpacing: '0%',
                      verticalAlign: 'middle',
                      textAlign: 'left',
                      flex: 1,
                      margin: 0,
                      fontStyle: 'italic',
                    }}
                  >
                    No description yet. Click edit to add one.
                  </p>
                ) : null}
                {isOwnProfile && <EditButton onClick={() => setShowEditDescription(true)} />}
              </div>
            </div>
          )}

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
                    value={shortsPeriod === '7d' ? '7days' : '30days'}
                    onChange={(e) => {
                      const newPeriod = e.target.value === '7days' ? '7d' : '30d';
                      setShortsPeriod(newPeriod);
                    }}
                  >
                    <option value="7days">Last 7 days</option>
                    <option value="30days">Last 30 days</option>
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
                {isLoadingShorts ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '400px' }}>
                    <span style={{ color: '#1E002B' }}>Loading shorts...</span>
                  </div>
                ) : shorts.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '400px' }}>
                    <span style={{ color: '#1E002B' }}>No shorts available</span>
                  </div>
                ) : (
                  shorts.map((short) => (
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
                        alt={short.title || short.id}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  ))
                )}
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
                    value={videosPeriod === '7d' ? '7days' : '30days'}
                    onChange={(e) => {
                      const newPeriod = e.target.value === '7days' ? '7d' : '30d';
                      setVideosPeriod(newPeriod);
                    }}
                  >
                    <option value="7days">Last 7 days</option>
                    <option value="30days">Last 30 days</option>
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
                {isLoadingVideos ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '400px' }}>
                    <span style={{ color: '#1E002B' }}>Loading videos...</span>
                  </div>
                ) : videos.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '400px' }}>
                    <span style={{ color: '#1E002B' }}>No videos available</span>
                  </div>
                ) : (() => {
                  // Get all videos to display (active + 2 left + 2 right for 3 layers, with wrapping)
                  const videosToShow: Array<{ index: number; position: 'far-left' | 'left' | 'center' | 'right' | 'far-right'; distance: number }> = [];
                  
                  // Add active video
                  videosToShow.push({ index: currentVideoSlide, position: 'center', distance: 0 });
                  
                  // Add 2 videos to the left (with wrapping) for 3-layer effect
                  const leftIndex1 = getVideoIndex(currentVideoSlide, -1);
                  const leftIndex2 = getVideoIndex(currentVideoSlide, -2);
                  if (leftIndex1 !== currentVideoSlide) {
                    videosToShow.push({ index: leftIndex1, position: 'left', distance: 1 });
                  }
                  if (leftIndex2 !== currentVideoSlide && leftIndex2 !== leftIndex1) {
                    videosToShow.push({ index: leftIndex2, position: 'far-left', distance: 2 });
                  }
                  
                  // Add 2 videos to the right (with wrapping) for 3-layer effect
                  const rightIndex1 = getVideoIndex(currentVideoSlide, 1);
                  const rightIndex2 = getVideoIndex(currentVideoSlide, 2);
                  if (rightIndex1 !== currentVideoSlide) {
                    videosToShow.push({ index: rightIndex1, position: 'right', distance: 1 });
                  }
                  if (rightIndex2 !== currentVideoSlide && rightIndex2 !== rightIndex1) {
                    videosToShow.push({ index: rightIndex2, position: 'far-right', distance: 2 });
                  }
                  
                  return videosToShow.map(({ index, position, distance }) => {
                    const video = videos[index];
                    if (!video) return null;
                    const isActive = position === 'center';
                    
                    // Calculate position and size based on distance from active slide
                    let left: string | number = 0;
                    let width = '300px';
                    let height = '300px';
                    let borderRadius = '20px';
                    let opacity = 0.4; // Base opacity for background layers
                    let zIndex = distance; // Closer videos have higher z-index
                    let transform = 'scale(0.75)'; // Base scale for background layers
                    
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
                      } else if (position === 'left' || position === 'far-left') {
                        // Left slides: when sliding right, they move further left and fade
                        if (slideDirection === 'right') {
                          translateX = position === 'far-left' ? -150 : -100;
                          animationOpacity = Math.max(0.1, opacity - 0.3);
                        }
                      } else if (position === 'right' || position === 'far-right') {
                        // Right slides: when sliding left, they move further right and fade
                        if (slideDirection === 'left') {
                          translateX = position === 'far-right' ? 150 : 100;
                          animationOpacity = Math.max(0.1, opacity - 0.3);
                        }
                      }
                    }
                    
                    if (isActive) {
                      // Center video - prominent (Layer 1)
                      // Always ensure full opacity for active video, never transparent
                      left = '200px';
                      width = '748px';
                      height = '400px';
                      borderRadius = '40px';
                      opacity = 1; // Always full opacity for active video
                      zIndex = 10;
                      transform = `scale(1) translateX(${translateX}px)`;
                    } else if (position === 'left') {
                      // Left video - Layer 2 (closer to center)
                      width = '588px';
                      height = '320px';
                      borderRadius = '30px';
                      opacity = animationOpacity || 0.6;
                      zIndex = 5;
                      // Active video starts at 200px
                      // 80% overlapped means right edge should be at 200 + (588 * 0.8) = 670.4px
                      // So left = 670.4 - 588 = 82.4px
                      const overlappedWidth = 588 * 0.8; // 80% overlapped
                      left = `${200 + overlappedWidth - 588}px`;
                      transform = `scale(0.85) translateX(${translateX}px)`;
                    } else if (position === 'right') {
                      // Right video - Layer 2 (closer to center)
                      width = '588px';
                      height = '320px';
                      borderRadius = '30px';
                      opacity = animationOpacity || 0.6;
                      zIndex = 5;
                      // Active video ends at 200 + 748 = 948px
                      // 80% overlapped means left edge should be at 948 - (588 * 0.8) = 477.6px
                      const overlappedWidth = 588 * 0.8; // 80% overlapped
                      left = `${948 - overlappedWidth}px`;
                      transform = `scale(0.85) translateX(${translateX}px)`;
                    } else if (position === 'far-left') {
                      // Far-left video - Layer 3 (furthest back)
                      width = '500px';
                      height = '280px';
                      borderRadius = '25px';
                      opacity = animationOpacity || 0.4;
                      zIndex = 2;
                      // Position further left than the left video
                      const leftVideoOverlappedWidth = 588 * 0.8;
                      const leftVideoLeft = 200 + leftVideoOverlappedWidth - 588;
                      // Position this one further left, with more overlap
                      left = `${leftVideoLeft - 200}px`;
                      transform = `scale(0.75) translateX(${translateX}px)`;
                    } else if (position === 'far-right') {
                      // Far-right video - Layer 3 (furthest back)
                      width = '500px';
                      height = '280px';
                      borderRadius = '25px';
                      opacity = animationOpacity || 0.4;
                      zIndex = 2;
                      // Position further right than the right video
                      const rightVideoOverlappedWidth = 588 * 0.8;
                      const rightVideoLeft = 948 - rightVideoOverlappedWidth;
                      // Position this one further right, with more overlap
                      left = `${rightVideoLeft + 200}px`;
                      transform = `scale(0.75) translateX(${translateX}px)`;
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
                  {videos.map((_, index) => (
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

          {/* Campaign Stats Badges - Only visible for brands, hidden for influencers */}
          {isBrand === true && userType !== 'influencer' && (
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
          )}

          {/* Reviews Section - Only visible for brands, hidden for influencers */}
          {isBrand === true && userType !== 'influencer' && (
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
            {[1, 2, 3].map((review, index) => {
              const reviewNames = ['Sarah Johnson', 'Michael Chen', 'Emily Rodriguez'];
              return (
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
                      by {reviewNames[index]}
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
              );
            })}

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
          )}

          {/* Similar Influencers Section - Only visible for brands, hidden for influencers */}
          {isBrand === true && userType !== 'influencer' && (
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
                onClick={() => {
                  const baseRoute = location.pathname.split('/')[1];
                  navigate(`/${baseRoute}/discover`);
                }}
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
            {isLoadingSimilar ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                <span style={{ fontFamily: 'Poppins, sans-serif', color: '#666' }}>Loading similar influencers...</span>
              </div>
            ) : similarInfluencers.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '16px'
                }}
              >
                {similarInfluencers.map((inf) => (
                  <InfluencerCard
                    key={inf._id}
                    name={inf.user?.name || 'Influencer'}
                    image={inf.coverImage}
                    profileImage={inf.profileImage || inf.user?.avatar}
                    rating={inf.rating}
                    description={inf.bio || inf.description}
                    isTopCreator={inf.isTopCreator}
                    influencerId={inf._id}
                    platformFollowers={inf.platformFollowers}
                    onClick={() => {
                      const baseRoute = location.pathname.split('/')[1];
                      navigate(`/${baseRoute}/influencer/${inf._id}`);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                <span style={{ fontFamily: 'Poppins, sans-serif', color: '#666' }}>No similar influencers found</span>
              </div>
            )}
          </div>
          )}
        </div>
      </div>

      {/* Edit Modals - Only show if user is viewing their own profile */}
      {isOwnProfile && (
        <>
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

          <EditTags
            isOpen={showEditTags}
            onClose={() => {
              if (!isUpdatingTags) {
                setShowEditTags(false);
              }
            }}
            initialTags={influencerData?.tags || []}
            onSave={handleSaveTags}
            suggestedTags={[...INFLUENCER_TAGS]}
            title="Edit Tags"
            instruction="Add tags that clearly highlight your skills and expertise, making it easy for brands to understand you."
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

          <EditSocialAccounts
            isOpen={showEditSocialAccounts}
            onClose={() => {
              if (!isUpdatingSocialAccounts) {
                setShowEditSocialAccounts(false);
              }
            }}
            initialSocialProfiles={influencer?.socialProfiles || []}
            onSave={handleSaveSocialAccounts}
          />
        </>
      )}

      {/* Profile Completion Floating Button - Only show when less than 100% */}
      {(() => {
        console.log('FloatingButton render condition:', {
          isOwnProfile,
          profileCompletion: profileCompletion.percentage,
          isDismissed: isProfileCompletionDismissed
        });
        return isOwnProfile && profileCompletion.percentage < 100 && !isProfileCompletionDismissed;
      })() && (
        <FloatingButton
          completionPercentage={profileCompletion.percentage}
          hasProfilePic={profileCompletion.hasProfilePic}
          hasTags={profileCompletion.hasTags}
          hasDescription={profileCompletion.hasDescription}
          hasSocialAccounts={profileCompletion.hasSocialAccounts}
          onViewProfiles={handleViewProfiles}
          onEditProfilePic={() => setShowEditProfileImage(true)}
          onEditTags={() => setShowEditTags(true)}
          onEditDescription={() => setShowEditDescription(true)}
          onEditSocialAccounts={() => setShowEditSocialAccounts(true)}
          isDismissed={isProfileCompletionDismissed}
          onDismiss={handleProfileCompletionDismiss}
        />
      )}
    </div>
  );
};

