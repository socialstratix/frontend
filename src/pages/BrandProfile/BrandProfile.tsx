import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { colors, PLACEHOLDER_IMAGE } from '../../constants';
import { Button } from '../../components/atoms/Button/Button';
import { EditButton } from '../../components/atoms/EditButton/EditButton';
import { EditDescription } from '../../components/molecules/EditDescription/EditDescription';
import { EditName } from '../../components/molecules/EditName/EditName';
import { EditTags } from '../../components/molecules/EditTags/EditTags';
import { EditProfilePhoto } from '../../components/molecules/EditProfilePhoto/EditProfilePhoto';
import EditIcon from '../../assets/icons/ui/edit.svg';
import MoreIcon from '../../assets/icons/ui/more.svg';
import LocationIcon from '../../assets/icons/ui/Location.svg';
import ArrowLeftIcon from '../../assets/icons/ui/arrow_left.svg';
import ShareIcon from '../../assets/icons/ui/ios_share.svg';
import InstagramIcon from '../../assets/icons/social/Icon=Instagram.svg';
import FacebookIcon from '../../assets/icons/social/Icon=Facebook.svg';
import XIcon from '../../assets/icons/social/Icon=X.svg';
import YoutubeIcon from '../../assets/icons/social/Icon=Youtube.svg';
import TiktokIcon from '../../assets/icons/social/Icon=Tiktok.svg';
import { brandService, type Brand as BrandServiceType } from '../../services/brandService';
import { apiService } from '../../services/api';
import { useCampaigns, useCampaign } from '../../hooks/useCampaign';
import type { Campaign as CampaignServiceType } from '../../services/campaignService';
import { useAuth } from '../../contexts/AuthContext';

interface Campaign {
  id: string;
  name: string;
  postedTime: string;
  brandName: string;
  categories: string[];
  description: string;
  location: string;
  budget: number;
  platforms: string[];
}

// Use Brand type from service
type Brand = BrandServiceType;

export const BrandProfile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isInfluencer = user?.userType === 'influencer';
  const [activeTab, setActiveTab] = useState<'active' | 'previous'>('active');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [brandAvatarError, setBrandAvatarError] = useState(false);
  
  // Edit modal states
  const [showEditName, setShowEditName] = useState(false);
  const [showEditDescription, setShowEditDescription] = useState(false);
  const [showEditTags, setShowEditTags] = useState(false);
  const [showEditPhoto, setShowEditPhoto] = useState(false);
  
  // Edit operation loading states
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isUpdatingDescription, setIsUpdatingDescription] = useState(false);
  const [isUpdatingTags, setIsUpdatingTags] = useState(false);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);

  // Use campaigns hook
  const statusFilter = activeTab === 'active' ? 'active' : 'previous';
  
  
  const {
    campaigns: apiCampaigns,
    isLoading: isLoadingCampaigns,
    error: campaignsError,
    refetch: refetchCampaigns,
  } = useCampaigns({
    brandId: brand?._id || undefined,
    status: statusFilter as 'active' | 'previous' | 'closed' | 'completed',
    autoFetch: !!brand?._id,
  });

  // Hook for individual campaign operations
  const { updateCampaign, deleteCampaign } = useCampaign();

  // Get base route (brand, home, or influencer)
  const baseRoute = location.pathname.split('/')[1];
  const backRoute = `/${baseRoute}`;

  // Check if id is a MongoDB ObjectId (24 hex characters) or userId
  const isMongoObjectId = (id: string): boolean => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  useEffect(() => {
    const fetchBrandData = async () => {
      if (!id) {
        setError('Brand ID is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Use brandId endpoint if it's a MongoDB ObjectId, otherwise use userId endpoint
        let brandData: Brand;
        if (isMongoObjectId(id)) {
          brandData = await brandService.getBrandById(id);
        } else {
          brandData = await brandService.getBrandByUserId(id);
        }
        
        setBrand(brandData);
      } catch (err: any) {
        setError(err.message || 'Failed to load brand data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrandData();
  }, [id]);

  // Handler to refresh brand data
  const refreshBrandData = useCallback(async () => {
    if (!id) return;
    
    try {
      let brandData: Brand;
      if (isMongoObjectId(id)) {
        brandData = await brandService.getBrandById(id);
      } else {
        brandData = await brandService.getBrandByUserId(id);
      }
      setBrand(brandData);
    } catch (err: any) {
      console.error('Failed to refresh brand data:', err);
      setError(err.message || 'Failed to refresh brand data');
    }
  }, [id]);

  // Handler for saving name
  const handleSaveName = useCallback(async (name: string) => {
    try {
      setIsUpdatingName(true);
      setError(null);
      
      // Update user name via auth API
      await apiService.put('/auth/me', { name });
      
      // Refresh brand data to get the latest complete data
      await refreshBrandData();
      setShowEditName(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update name');
      console.error('Error updating name:', err);
    } finally {
      setIsUpdatingName(false);
    }
  }, [refreshBrandData]);

  // Handler for saving description
  const handleSaveDescription = useCallback(async (description: string) => {
    if (!brand?.userId) {
      setError('Brand user ID is required');
      return;
    }

    try {
      setIsUpdatingDescription(true);
      setError(null);
      
      // Update the brand
      await brandService.updateBrand(brand.userId, {
        description,
      });
      
      // Refresh brand data to get the latest complete data
      await refreshBrandData();
      setShowEditDescription(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update description');
      console.error('Error updating description:', err);
    } finally {
      setIsUpdatingDescription(false);
    }
  }, [brand, refreshBrandData]);

  // Handler for saving tags
  const handleSaveTags = useCallback(async (tags: string[]) => {
    if (!brand?.userId) {
      setError('Brand user ID is required');
      return;
    }

    try {
      setIsUpdatingTags(true);
      setError(null);
      
      // Update the brand
      await brandService.updateBrand(brand.userId, {
        tags,
      });
      
      // Refresh brand data to get the latest complete data
      await refreshBrandData();
      setShowEditTags(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update tags');
      console.error('Error updating tags:', err);
    } finally {
      setIsUpdatingTags(false);
    }
  }, [brand, refreshBrandData]);

  // Handler for saving photo/logo
  const handleSavePhoto = useCallback(async (file: File | null) => {
    if (!brand?.userId) {
      setError('Brand user ID is required');
      return;
    }

    if (!file) {
      setError('No file selected');
      return;
    }

    try {
      setIsUpdatingPhoto(true);
      setError(null);
      
      // Update the brand
      await brandService.updateBrand(brand.userId, {}, file);
      
      // Refresh brand data to get the latest complete data
      await refreshBrandData();
      setShowEditPhoto(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update photo');
      console.error('Error updating photo:', err);
    } finally {
      setIsUpdatingPhoto(false);
    }
  }, [brand, refreshBrandData]);

  // Format time ago helper function
  const formatTimeAgo = useCallback((date: string | Date): string => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }
  }, []);


  // Map API campaigns to component's Campaign interface
  const campaigns: Campaign[] = useMemo(() => {
    if (!apiCampaigns || apiCampaigns.length === 0) return [];
    
    return apiCampaigns.map((campaign: CampaignServiceType) => ({
      id: campaign._id,
      name: campaign.name,
      postedTime: formatTimeAgo(campaign.createdAt || new Date()),
      brandName: brand?.user?.name || 'Brand',
      categories: campaign.tags || [],
      description: campaign.description || '',
      location: campaign.location || '',
      budget: campaign.budget || 0,
      platforms: campaign.platforms || [],
    }));
  }, [apiCampaigns, brand?.user?.name, formatTimeAgo]);

  // Calculate stats from campaigns
  const stats = useMemo(() => {
    if (!campaigns || campaigns.length === 0) {
      return {
        campaigns: 0,
        avgBudget: 0,
        influencers: 0, // TODO: Requires campaign applications API
        highestBudget: 0,
        totalSpent: 0,
      };
    }

    const budgets = campaigns.map(c => c.budget).filter(b => b > 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + budget, 0);
    const avgBudget = budgets.length > 0 ? totalSpent / budgets.length : 0;
    const highestBudget = budgets.length > 0 ? Math.max(...budgets) : 0;

    return {
      campaigns: campaigns.length,
      avgBudget: Math.round(avgBudget),
      influencers: 0, // TODO: Requires campaign applications API
      highestBudget,
      totalSpent,
    };
  }, [campaigns]);

  // Brand info from API data - all dynamic
  const brandInfo = brand ? {
    name: brand.user?.name || '',
    avatar: brand.logo || brand.user?.avatar || '',
    tags: brand.tags || [],
    description: brand.description || '',
    location: brand.location || '',
    website: brand.website || '',
  } : null;


  const getPlatformIcon = (platform: string) => {
    const icons: { [key: string]: string } = {
      instagram: InstagramIcon,
      facebook: FacebookIcon,
      x: XIcon,
      youtube: YoutubeIcon,
      tiktok: TiktokIcon,
    };
    return icons[platform];
  };

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleMarkAsComplete = async (campaignId: string) => {
    try {
      await updateCampaign(campaignId, { status: 'completed' });
      setOpenMenuId(null);
      // Refetch campaigns to update the list
      if (brand?._id) {
        await refetchCampaigns();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to mark campaign as complete');
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteCampaign(campaignId);
      setOpenMenuId(null);
      // Refetch campaigns to update the list
      if (brand?._id) {
        await refetchCampaigns();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete campaign');
    }
  };

  // Get first letter of brand name for avatar fallback
  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'B';
  };

  if (isLoading) {
    return (
      <>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{ background: 'linear-gradient(135deg, rgba(235, 188, 254, 0.3) 0%, rgba(240, 196, 105, 0.3) 100%)', minHeight: '100vh', padding: '24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              minHeight: '50vh',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: `4px solid ${colors.primary.main}`,
                borderTop: '4px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ fontFamily: 'Poppins', color: colors.text.secondary }}>
                Loading brand profile...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !brand) {
    return (
      <div style={{ background: 'linear-gradient(135deg, rgba(235, 188, 254, 0.3) 0%, rgba(240, 196, 105, 0.3) 100%)', minHeight: '100vh', padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <button
            onClick={() => navigate(backRoute)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              color: colors.primary.main,
              cursor: 'pointer',
              marginBottom: '24px',
              fontFamily: 'Poppins',
              fontSize: '14px',
              fontWeight: 400,
            }}
          >
            <img src={ArrowLeftIcon} alt="Back" style={{ width: '20px', height: '20px' }} />
            Back
          </button>
          <div style={{ 
            backgroundColor: colors.primary.white,
            borderRadius: '8px',
            padding: '32px',
            textAlign: 'center'
          }}>
            <h2 style={{ fontFamily: 'Poppins', fontSize: '20px', color: colors.text.primary, marginBottom: '8px' }}>
              {error || 'Brand not found'}
            </h2>
            <p style={{ fontFamily: 'Poppins', fontSize: '14px', color: colors.text.secondary }}>
              The brand profile you're looking for doesn't exist or couldn't be loaded.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(235, 188, 254, 0.3) 0%, rgba(240, 196, 105, 0.3) 100%)', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate(backRoute)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            color: colors.primary.main,
            cursor: 'pointer',
            marginBottom: '24px',
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontWeight: 400,
          }}
        >
          <img src={ArrowLeftIcon} alt="Back" style={{ width: '20px', height: '20px' }} />
          {isInfluencer ? 'Back to campaign listing' : 'Back to Influencers listing'}
        </button>

        {/* Brand Profile Section */}
        <div
          style={{
            backgroundColor: colors.primary.white,
            borderRadius: '8px',
            padding: '32px',
            marginBottom: '24px',
          }}
        >
          {/* Brand Header */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            {/* Avatar */}
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: brandInfo?.avatar ? 'transparent' : colors.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.primary.white,
                fontSize: '32px',
                fontWeight: 600,
                fontFamily: 'Poppins',
                position: 'relative',
                overflow: 'visible',
              }}
            >
              {/* Avatar Image/Initial Container */}
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundImage: (brandInfo?.avatar && !brandAvatarError) ? `url(${brandInfo.avatar})` : (brandAvatarError ? `url(${PLACEHOLDER_IMAGE})` : 'none'),
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {brandInfo?.avatar && !brandAvatarError ? (
                  <img
                    src={brandInfo.avatar}
                    alt={brandInfo.name || 'Brand'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%',
                      display: 'none', // Hidden, using backgroundImage instead
                    }}
                    onError={() => setBrandAvatarError(true)}
                  />
                ) : null}
                {(!brandInfo?.avatar || brandAvatarError) && brandInfo?.name && getInitial(brandInfo.name)}
              </div>
              {/* Edit Icon - Floating button on avatar with slight overlap */}
              {!isInfluencer && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    right: '-4px',
                    zIndex: 1,
                  }}
                >
                  <EditButton 
                    onClick={() => setShowEditPhoto(true)}
                    style={{ 
                      width: '28px', 
                      height: '28px',
                      borderRadius: '50%',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Brand Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <h1
                  style={{
                    fontFamily: 'Poppins',
                    fontWeight: 400,
                    fontStyle: 'normal',
                    fontSize: '33px',
                    lineHeight: '100%',
                    letterSpacing: '0%',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    color: 'rgba(30, 0, 43, 1)',
                    margin: 0,
                  }}
                >
                  {brandInfo?.name || brand?.user?.name || ''}
                </h1>
                {!isInfluencer && <EditButton onClick={() => setShowEditName(true)} />}
              </div>

              {/* Tags - Comma separated text */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                {brandInfo?.tags && brandInfo.tags.length > 0 ? (
                  <span
                    style={{
                      fontFamily: 'Poppins',
                      fontWeight: 400,
                      fontStyle: 'normal',
                      fontSize: '18px',
                      lineHeight: '100%',
                      letterSpacing: '0%',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      color: colors.text.secondary,
                    }}
                  >
                    {brandInfo.tags.join(', ')}
                  </span>
                ) : (
                  <span
                    style={{
                      fontFamily: 'Poppins',
                      fontWeight: 400,
                      fontStyle: 'normal',
                      fontSize: '18px',
                      lineHeight: '100%',
                      letterSpacing: '0%',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      color: colors.text.secondary,
                    }}
                  >
                    No tags
                  </span>
                )}
                {!isInfluencer && <EditButton onClick={() => setShowEditTags(true)} />}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outline" style={{ height: '40px', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={ShareIcon} alt="Share" style={{ width: '16px', height: '16px' }} />
                SHARE
              </Button>
              {isInfluencer ? (
                <Button
                  onClick={() => setIsFollowing(!isFollowing)}
                  variant="filled"
                  style={{
                    height: '40px',
                    padding: '0 24px',
                    backgroundColor: isFollowing ? colors.text.secondary : colors.primary.main,
                  }}
                >
                  {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
                </Button>
              ) : (
                <Button
                  onClick={() => navigate('/brand/campaigns/create')}
                  variant="filled"
                  style={{
                    height: '40px',
                    padding: '0 24px',
                    backgroundColor: colors.primary.main,
                  }}
                >
                  POST CAMPAIGN
                </Button>
              )}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <h2
                style={{
                  fontFamily: 'Poppins',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  margin: 0,
                }}
              >
                Description
              </h2>
              {!isInfluencer && <EditButton onClick={() => setShowEditDescription(true)} />}
            </div>
            <p
              style={{
                fontFamily: 'Poppins',
                fontWeight: 400,
                fontStyle: 'normal',
                fontSize: '14px',
                lineHeight: '1.6',
                letterSpacing: '0%',
                verticalAlign: 'middle',
                color: 'rgba(30, 0, 43, 1)',
                margin: 0,
              }}
            >
              {brandInfo?.description || brand?.description || ''}
            </p>
          </div>

        </div>

        {/* Stats Section */}
        <div
          style={{
            backgroundColor: colors.primary.white,
            borderRadius: '8px',
            padding: '32px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <h2
              style={{
                fontFamily: 'Poppins',
                fontSize: '20px',
                fontWeight: 600,
                color: colors.text.primary,
                margin: 0,
              }}
            >
              Brief Stats about past campaigns
            </h2>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
            {/* Card 1 - Number of campaigns */}
            <div
              style={{
                padding: '3px',
                background: 'linear-gradient(225deg, #EAFFC2 0%, #FFD4F6 100%)',
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  padding: '20px',
                  backgroundColor: colors.primary.white,
                  borderRadius: '5px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    color: colors.text.secondary,
                    marginBottom: '8px',
                  }}
                >
                  Number of campaigns
                </div>
                <div
                  style={{
                    fontFamily: 'Poppins',
                    fontSize: '24px',
                    fontWeight: 600,
                    color: colors.text.primary,
                  }}
                >
                  {stats.campaigns}
                </div>
              </div>
            </div>

            {/* Card 2 - AVG campaign budget */}
            <div
              style={{
                padding: '3px',
                background: 'linear-gradient(225deg, #FFD4F6 0%, #99FCFF 100%)',
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  padding: '20px',
                  backgroundColor: colors.primary.white,
                  borderRadius: '5px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    color: colors.text.secondary,
                    marginBottom: '8px',
                  }}
                >
                  AVG campaign budget
                </div>
                <div
                  style={{
                    fontFamily: 'Poppins',
                    fontSize: '24px',
                    fontWeight: 600,
                    color: colors.text.primary,
                  }}
                >
                  ₹ {stats.avgBudget.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Card 3 - Number of influencers */}
            <div
              style={{
                padding: '3px',
                background: 'linear-gradient(225deg, #EAFFC2 0%, #99FCFF 100%)',
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  padding: '20px',
                  backgroundColor: colors.primary.white,
                  borderRadius: '5px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    color: colors.text.secondary,
                    marginBottom: '8px',
                  }}
                >
                  Number of influencers
                </div>
                <div
                  style={{
                    fontFamily: 'Poppins',
                    fontSize: '24px',
                    fontWeight: 600,
                    color: colors.text.primary,
                  }}
                >
                  {stats.influencers}
                </div>
              </div>
            </div>

            {/* Card 4 - Highest campaign budget */}
            <div
              style={{
                padding: '3px',
                background: 'linear-gradient(225deg, #FFE2B6 0%, #99FCFF 100%)',
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  padding: '20px',
                  backgroundColor: colors.primary.white,
                  borderRadius: '5px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    color: colors.text.secondary,
                    marginBottom: '8px',
                  }}
                >
                  Highest campaign budget
                </div>
                <div
                  style={{
                    fontFamily: 'Poppins',
                    fontSize: '24px',
                    fontWeight: 600,
                    color: colors.text.primary,
                  }}
                >
                  ₹ {stats.highestBudget.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Card 5 - Total money spent */}
            <div
              style={{
                padding: '3px',
                background: 'linear-gradient(225deg, #FFE2B6 0%, #99FCFF 100%)',
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  padding: '20px',
                  backgroundColor: colors.primary.white,
                  borderRadius: '5px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    color: colors.text.secondary,
                    marginBottom: '8px',
                  }}
                >
                  Total money spent
                </div>
                <div
                  style={{
                    fontFamily: 'Poppins',
                    fontSize: '24px',
                    fontWeight: 600,
                    color: colors.text.primary,
                  }}
                >
                  ₹ {stats.totalSpent.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns Section */}
        <div
          style={{
            backgroundColor: colors.primary.white,
            borderRadius: '8px',
            padding: '32px',
          }}
        >
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '32px', marginBottom: '24px', borderBottom: `2px solid ${colors.border.light}` }}>
            <button
              onClick={() => setActiveTab('active')}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                padding: '12px 0',
                fontFamily: 'Poppins',
                fontSize: '16px',
                fontWeight: 600,
                color: activeTab === 'active' ? colors.primary.main : colors.text.secondary,
                borderBottom: activeTab === 'active' ? `2px solid ${colors.primary.main}` : 'none',
                marginBottom: '-2px',
                cursor: 'pointer',
              }}
            >
              Active Campaigns
            </button>
            <button
              onClick={() => setActiveTab('previous')}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                padding: '12px 0',
                fontFamily: 'Poppins',
                fontSize: '16px',
                fontWeight: 600,
                color: activeTab === 'previous' ? colors.primary.main : colors.text.secondary,
                borderBottom: activeTab === 'previous' ? `2px solid ${colors.primary.main}` : 'none',
                marginBottom: '-2px',
                cursor: 'pointer',
              }}
            >
              Previous Campaigns
            </button>
          </div>

          {/* Sort By */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  color: colors.text.secondary,
                }}
              >
                Sort by:
              </span>
              <select
                style={{
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option>Date Posted</option>
                <option>Budget</option>
                <option>Name</option>
              </select>
            </div>
          </div>

          {/* Campaign Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {campaignsError ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                color: colors.red.main,
                fontFamily: 'Poppins',
                backgroundColor: '#fee',
                borderRadius: '8px',
                border: `1px solid ${colors.red.main}`
              }}>
                <p style={{ fontWeight: 600, marginBottom: '8px' }}>Error loading campaigns</p>
                <p style={{ fontSize: '14px' }}>{campaignsError}</p>
              </div>
            ) : isLoadingCampaigns ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '40px',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: `4px solid ${colors.primary.main}`,
                  borderTop: '4px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ fontFamily: 'Poppins', color: colors.text.secondary }}>
                  Loading campaigns...
                </p>
              </div>
            ) : campaigns.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                color: colors.text.secondary,
                fontFamily: 'Poppins'
              }}>
                <p>No {activeTab === 'active' ? 'active' : 'previous'} campaigns found.</p>
                {brand?._id && (
                  <p style={{ fontSize: '12px', marginTop: '8px', color: colors.text.secondary }}>
                    Brand ID: {brand._id}
                  </p>
                )}
              </div>
            ) : (
              campaigns.map((campaign) => (
              <div
                key={campaign.id}
                style={{
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: '8px',
                  padding: '20px',
                  position: 'relative',
                }}
              >
                {/* Campaign Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <div
                      style={{
                        fontFamily: 'Poppins',
                        fontSize: '12px',
                        color: colors.text.secondary,
                        marginBottom: '4px',
                      }}
                    >
                      Posted {campaign.postedTime}
                    </div>
                    <div
                      style={{
                        fontFamily: 'Poppins',
                        fontSize: '14px',
                        color: colors.primary.main,
                        marginBottom: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      {campaign.brandName}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!isInfluencer && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <button
                        onClick={() => navigate(`/brand/campaigns/create?edit=${campaign.id}`)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          width: '96px',
                          height: '40px',
                          backgroundColor: 'rgba(232, 226, 235, 1)',
                          border: 'none',
                          borderRadius: '100px',
                          cursor: 'pointer',
                          fontFamily: 'Poppins',
                          fontSize: '14px',
                          fontWeight: 600,
                          fontStyle: 'normal',
                          lineHeight: '100%',
                          letterSpacing: '0%',
                          textAlign: 'center',
                          textTransform: 'uppercase',
                          color: colors.primary.main3,
                          opacity: 1,
                        }}
                      >
                        <img src={EditIcon} alt="Edit" style={{ width: '16px', height: '16px' }} />
                        <span style={{
                          width: '30px',
                          height: '21px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          EDIT
                        </span>
                      </button>

                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => toggleMenu(campaign.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            width: '50px',
                            height: '40px',
                            backgroundColor: colors.primary.white,
                            border: '1px solid rgba(120, 60, 145, 1)',
                            borderRadius: '100px',
                            cursor: 'pointer',
                            opacity: 1,
                          }}
                        >
                          <img src={MoreIcon} alt="More" style={{ width: '20px', height: '20px' }} />
                        </button>

                        {/* Dropdown Menu */}
                        {openMenuId === campaign.id && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '4px',
                            width: '200px',
                            height: '119px',
                            padding: '2px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                            borderBottomRightRadius: '8px',
                            borderBottomLeftRadius: '8px',
                            boxShadow: '0px 2px 3px 0px rgba(30, 0, 43, 0.16), 0px -1px 1px 0px rgba(30, 0, 43, 0.05)',
                            zIndex: 10,
                            opacity: 1,
                          }}
                        >
                          <button
                            onClick={() => handleMarkAsComplete(campaign.id)}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              textAlign: 'left',
                              fontFamily: 'Poppins',
                              fontSize: '14px',
                              color: colors.text.primary,
                              cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = colors.secondary.light;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            Mark as Complete
                          </button>
                          <button
                            onClick={() => handleDeleteCampaign(campaign.id)}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              textAlign: 'left',
                              fontFamily: 'Poppins',
                              fontSize: '14px',
                              color: colors.text.primary,
                              cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = colors.secondary.light;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            Delete Campaign
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  )}
                </div>

                {/* Campaign Name */}
                <h3
                  style={{
                    fontFamily: 'Poppins',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: colors.text.primary,
                    margin: '0 0 12px 0',
                  }}
                >
                  {campaign.name}
                </h3>

                {/* Categories */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  {campaign.categories.map((category, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '4px 12px',
                        backgroundColor: colors.secondary.light,
                        borderRadius: '16px',
                        fontFamily: 'Poppins',
                        fontSize: '12px',
                        color: colors.text.primary,
                      }}
                    >
                      {category}
                    </span>
                  ))}
                </div>

                {/* Description */}
                <p
                  style={{
                    fontFamily: 'Poppins',
                    fontSize: '14px',
                    color: colors.text.secondary,
                    lineHeight: '1.6',
                    margin: '0 0 16px 0',
                  }}
                >
                  {campaign.description}
                </p>

                {/* Campaign Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  {/* Location */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontFamily: 'Poppins',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: colors.text.primary,
                      }}
                    >
                      Location:
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <img src={LocationIcon} alt="Location" style={{ width: '16px', height: '16px' }} />
                      <span
                        style={{
                          fontFamily: 'Poppins',
                          fontSize: '14px',
                          color: colors.text.secondary,
                        }}
                      >
                        {campaign.location}
                      </span>
                    </div>
                  </div>

                  {/* Budget */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontFamily: 'Poppins',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: colors.text.primary,
                      }}
                    >
                      Budget:
                    </span>
                    <span
                      style={{
                        fontFamily: 'Poppins',
                        fontWeight: 600,
                        fontStyle: 'normal',
                        fontSize: '14px',
                        lineHeight: '100%',
                        letterSpacing: '0%',
                        verticalAlign: 'middle',
                        color: 'rgba(117, 80, 2, 1)',
                      }}
                    >
                      ₹ {campaign.budget.toLocaleString()}
                    </span>
                  </div>

                  {/* Post On */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontFamily: 'Poppins',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: colors.text.primary,
                      }}
                    >
                      Post on:
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {campaign.platforms.map((platform) => (
                        <img
                          key={platform}
                          src={getPlatformIcon(platform)}
                          alt={platform}
                          style={{ width: '20px', height: '20px' }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>

          {/* See More Button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
            <button
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontWeight: 600,
                color: colors.primary.main,
                cursor: 'pointer',
                padding: '8px 16px',
              }}
            >
              See more ˅
            </button>
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
        initialValue={brandInfo?.name || brand?.user?.name || ''}
        onSave={handleSaveName}
      />

      <EditDescription
        isOpen={showEditDescription}
        onClose={() => {
          if (!isUpdatingDescription) {
            setShowEditDescription(false);
          }
        }}
        initialValue={brandInfo?.description || brand?.description || ''}
        onSave={handleSaveDescription}
      />

      <EditTags
        isOpen={showEditTags}
        onClose={() => {
          if (!isUpdatingTags) {
            setShowEditTags(false);
          }
        }}
        initialTags={brandInfo?.tags || brand?.tags || []}
        suggestedTags={['Cooking', 'Unfiltered', 'Roastmaster', 'Gourmet', 'Placeholder']}
        maxTags={6}
        onSave={handleSaveTags}
      />

      <EditProfilePhoto
        isOpen={showEditPhoto}
        onClose={() => {
          if (!isUpdatingPhoto) {
            setShowEditPhoto(false);
          }
        }}
        initialPhoto={brandInfo?.avatar || brand?.logo || ''}
        maxSize={10}
        maxDimensions="300x300"
        onSave={handleSavePhoto}
      />
    </div>
  );
};

