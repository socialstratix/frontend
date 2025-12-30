import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, PLACEHOLDER_IMAGE } from '../../constants';
import { Button } from '../../components/atoms/Button/Button';
import LocationIcon from '../../assets/icons/ui/Location.svg';
import InstagramIcon from '../../assets/icons/social/Icon=Instagram.svg';
import FacebookIcon from '../../assets/icons/social/Icon=Facebook.svg';
import XIcon from '../../assets/icons/social/Icon=X.svg';
import YoutubeIcon from '../../assets/icons/social/Icon=Youtube.svg';
import TiktokIcon from '../../assets/icons/social/Icon=Tiktok.svg';
import { campaignService, type Campaign as CampaignServiceType } from '../../services/campaignService';
import { savedCampaignService } from '../../services/savedCampaignService';

interface Campaign {
  id: string;
  brandId: string;
  brandName: string;
  brandAvatar: string;
  campaignName: string;
  postedTime: string;
  categories: string[];
  description: string;
  location: string;
  budget: number;
  platforms: string[];
  isClosed?: boolean;
  isSaved?: boolean;
}

export const InfluencerLanding: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'suggested' | 'saved'>('all');
  const [savedCampaigns, setSavedCampaigns] = useState<Set<string>>(new Set());
  const [apiCampaigns, setApiCampaigns] = useState<CampaignServiceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brandAvatarErrors, setBrandAvatarErrors] = useState<{ [key: string]: boolean }>({});
  const [showAllCampaigns, setShowAllCampaigns] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'budget' | 'name'>('date');

  // Fetch saved campaign IDs on mount
  useEffect(() => {
    const fetchSavedCampaignIds = async () => {
      try {
        const ids = await savedCampaignService.getSavedCampaignIds();
        setSavedCampaigns(new Set(ids));
      } catch (err: any) {
        console.error('Failed to fetch saved campaign IDs:', err);
      }
    };

    fetchSavedCampaignIds();
  }, []);

  // Fetch campaigns from API
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // If on saved tab, fetch saved campaigns
        if (activeTab === 'saved') {
          const savedResponse = await savedCampaignService.getSavedCampaigns(sortBy);
          setApiCampaigns(savedResponse.campaigns || []);
        } else {
          // Fetch both active and completed campaigns with sorting
          const [activeResponse, completedResponse] = await Promise.all([
            campaignService.getAllCampaigns('active', sortBy),
            campaignService.getAllCampaigns('completed', sortBy).catch(() => ({ campaigns: [], count: 0 })),
          ]);
          // Combine active and completed campaigns
          const allCampaigns = [...(activeResponse.campaigns || []), ...(completedResponse.campaigns || [])];
          setApiCampaigns(allCampaigns);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load campaigns');
        setApiCampaigns([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [sortBy, activeTab]);

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
      brandId: campaign.brandId,
      brandName: campaign.brandName || 'Brand',
      brandAvatar: campaign.brandAvatar || '',
      campaignName: campaign.name,
      postedTime: formatTimeAgo(campaign.createdAt || new Date()),
      categories: campaign.tags || [],
      description: campaign.description || '',
      location: campaign.location || '',
      budget: campaign.budget || 0,
      platforms: campaign.platforms || [],
      isClosed: campaign.isClosed || campaign.status === 'completed' || false,
    }));
  }, [apiCampaigns, formatTimeAgo]);


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

  const toggleSave = async (campaignId: string) => {
    try {
      const isSaved = savedCampaigns.has(campaignId);
      
      // Optimistic UI update
      setSavedCampaigns((prev) => {
        const newSet = new Set(prev);
        if (isSaved) {
          newSet.delete(campaignId);
        } else {
          newSet.add(campaignId);
        }
        return newSet;
      });

      // Make API call
      if (isSaved) {
        await savedCampaignService.unsaveCampaign(campaignId);
      } else {
        await savedCampaignService.saveCampaign(campaignId);
      }
    } catch (error: any) {
      console.error('Failed to toggle save:', error);
      // Revert optimistic update on error
      setSavedCampaigns((prev) => {
        const newSet = new Set(prev);
        if (savedCampaigns.has(campaignId)) {
          newSet.add(campaignId);
        } else {
          newSet.delete(campaignId);
        }
        return newSet;
      });
    }
  };

  const filteredCampaigns = campaigns.filter(() => {
    // All filtering is now handled by the API
    // For 'saved' tab, API returns only saved campaigns
    // For 'all' and 'suggested' tabs, API returns all campaigns
    return true;
  });

  // Get first letter of brand name for avatar fallback
  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'B';
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(235, 188, 254, 0.3) 0%, rgba(240, 196, 105, 0.3) 100%)', minHeight: '100vh', padding: '40px 40px 20px 20px' }}>
     
     <div style={{ width:'1380px', padding: '16px 16px', background: 'rgba(255, 255, 255, 1)' ,margin: '0 auto', alignContent: 'center', borderRadius: '8px'}}>
       {/* Hero Section */}
       <div
        style={{
          width: '100%',
          background: 'rgba(242, 235, 220, 1)',
          padding: '60px 24px',
          textAlign: 'center',
          margin: '0',
          borderRadius: '8px'
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1
            style={{
              fontFamily: 'Poppins',
              fontSize: '32px',
              fontWeight: 400,
              color: colors.text.primary,
              marginBottom: '16px',
            }}
          >
            Let brands connect with you.
          </h1>
          <h2
            style={{
              fontFamily: 'Poppins',
              fontSize: '48px',
              fontWeight: 700,
              background: 'linear-gradient(90deg, #DB9400 0%, #783C91 50%, #783C91 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '16px',
            }}
          >
            Get Discovered. Earn more!
          </h2>
          <p
            style={{
              fontFamily: 'Poppins',
              fontSize: '16px',
              fontWeight: 400,
              color: colors.text.secondary,
              marginBottom: '32px',
              lineHeight: '1.6',
            }}
          >
            Find campaigns that are tailored to your profile, increase your earnings, and enhance your visibility.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button
            //   variant="filled"
              style={{
                padding: '12px 32px',
                fontSize: '14px',
                fontWeight: 600,
                height: 'auto',
                borderRadius: '100px',
                backgroundColor: 'rgba(219, 148, 0, 1)',
              }}
            >
              LEARN MORE
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          width: '100%',
          gap: '10px',
          opacity: 1,
          padding: '8px',
          background: 'rgba(255, 255, 255, 1)',
          margin: '0',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '8px'
        }}
      >
        {/* Tabs and Filters */}
        <div
          style={{
            borderRadius: '8px',
            padding: '16px 24px',
          }}
        >
          {/* Tabs and Filters in same row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: `2px solid ${colors.border.light}`,
              marginBottom: '16px',
            }}
          >
            {/* Tabs */}
            <div
              style={{
                display: 'flex',
                gap: '32px',
              }}
            >
              <button
                onClick={() => {
                  setActiveTab('all');
                  setShowAllCampaigns(false);
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: '12px 0',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: activeTab === 'all' ? colors.primary.main : colors.text.secondary,
                  borderBottom: activeTab === 'all' ? `3px solid ${colors.primary.main}` : 'none',
                  marginBottom: '-2px',
                  cursor: 'pointer',
                }}
              >
                All listing
              </button>
              <button
                onClick={() => {
                  setActiveTab('suggested');
                  setShowAllCampaigns(false);
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: '12px 0',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: activeTab === 'suggested' ? colors.primary.main : colors.text.secondary,
                  borderBottom: activeTab === 'suggested' ? `3px solid ${colors.primary.main}` : 'none',
                  marginBottom: '-2px',
                  cursor: 'pointer',
                }}
              >
                Suggested
              </button>
              <button
                onClick={() => {
                  setActiveTab('saved');
                  setShowAllCampaigns(false);
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: '12px 0',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: activeTab === 'saved' ? colors.primary.main : colors.text.secondary,
                  borderBottom: activeTab === 'saved' ? `3px solid ${colors.primary.main}` : 'none',
                  marginBottom: '-2px',
                  cursor: 'pointer',
                }}
              >
                Saved
              </button>
            </div>

            {/* Filters and Sort */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Clear Filter Button */}
              <button
                onClick={() => {
                  setActiveTab('all');
                  setSortBy('date');
                  setShowAllCampaigns(false);
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  color: colors.text.secondary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Clear filter
                <span style={{ fontSize: '16px' }}>⊗</span>
              </button>

              {/* Sort By */}
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
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'budget' | 'name')}
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
                  <option value="date">Date Posted</option>
                  <option value="budget">Budget</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: colors.text.secondary }}>
              Loading campaigns...
            </div>
          ) : error ? (
            <div style={{ padding: '40px', textAlign: 'center', color: colors.red.main }}>
              {error}
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: colors.text.secondary }}>
              No campaigns available at the moment.
            </div>
          ) : (
            (showAllCampaigns ? filteredCampaigns : filteredCampaigns.slice(0, 4)).map((campaign) => (
            <div
              key={campaign.id}
              style={{
                backgroundColor: campaign.isClosed ? 'rgba(103, 103, 103, 0.7)' : colors.primary.white,
                borderRadius: '8px',
                padding: '24px',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                {/* Brand Avatar */}
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: (campaign.brandAvatar && !brandAvatarErrors[campaign.id]) ? 'transparent' : colors.text.primary,
                    color: colors.primary.white,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Poppins',
                    fontSize: '20px',
                    fontWeight: 600,
                    flexShrink: 0,
                    backgroundImage: (campaign.brandAvatar && !brandAvatarErrors[campaign.id]) ? `url(${campaign.brandAvatar})` : (brandAvatarErrors[campaign.id] ? `url(${PLACEHOLDER_IMAGE})` : 'none'),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {campaign.brandAvatar && !brandAvatarErrors[campaign.id] ? (
                    <img
                      src={campaign.brandAvatar}
                      alt={campaign.brandName || 'Brand'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '50%',
                        display: 'none', // Hidden, using backgroundImage instead
                      }}
                      onError={() => {
                        setBrandAvatarErrors(prev => ({ ...prev, [campaign.id]: true }));
                      }}
                    />
                  ) : null}
                  {(!campaign.brandAvatar || brandAvatarErrors[campaign.id]) && getInitial(campaign.brandName)}
                </div>

                {/* Campaign Content */}
                <div style={{ flex: 1 }}>
                  {/* Posted Time */}
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

                  {/* Brand Name */}
                  <button
                    onClick={() => navigate(`/brand/brand/${campaign.brandId}`)}
                    style={{
                      fontFamily: 'Poppins',
                      fontSize: '14px',
                      color: colors.primary.main,
                      marginBottom: '8px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {campaign.brandName} →
                  </button>

                  {/* Campaign Name */}
                  <h3
                    onClick={() => navigate(`campaigns/${campaign.id}`)}
                    style={{
                      fontFamily: 'Poppins',
                      fontSize: '18px',
                      fontWeight: 600,
                      color: colors.text.primary,
                      margin: '0 0 12px 0',
                      cursor: 'pointer',
                    }}
                  >
                    {campaign.campaignName}
                  </h3>

                  {/* Categories */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    {campaign.categories.map((category, index) => (
                      <span
                        key={index}
                        style={{
                          fontFamily: 'Poppins',
                          fontWeight: 400,
                          fontStyle: 'normal',
                          fontSize: '14px',
                          lineHeight: '100%',
                          letterSpacing: '0%',
                          verticalAlign: 'middle',
                          color: 'rgba(103, 103, 103, 1)',
                         
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
                      fontWeight: 400,
                      fontStyle: 'normal',
                      fontSize: '12px',
                      lineHeight: '100%',
                      letterSpacing: '0%',
                      verticalAlign: 'middle',
                      color: 'rgba(30, 0, 43, 1)',
                      margin: '0 0 16px 0',
                    }}
                  >
                    {campaign.description}
                  </p>

                  {/* Campaign Details */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
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
                          fontSize: '14px',
                          color: colors.text.secondary,
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

                {/* Action Buttons - Right Corner */}
                <div style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  alignItems: 'flex-start',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                }}>
                  {/* Save Button */}
                  <button
                    onClick={() => toggleSave(campaign.id)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: `1px solid ${colors.border.light}`,
                      backgroundColor: savedCampaigns.has(campaign.id) ? colors.secondary.light : colors.primary.white,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={savedCampaigns.has(campaign.id) ? '#FF0000' : 'none'}
                      stroke={savedCampaigns.has(campaign.id) ? '#FF0000' : '#666666'}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>

                  {/* Apply Button */}
                  {campaign.isClosed ? '' : (
                    <Button
                      variant="filled"
                      disabled={campaign.isClosed}
                      onClick={() => navigate(`campaigns/${campaign.id}`)}
                      style={{
                        padding: '8px 24px',
                        fontSize: '14px',
                        fontWeight: 600,
                        height: 'auto',
                        minWidth: '100px',
                      }}
                    >
                      APPLY
                    </Button>
                  )}
                </div>
              </div>

              {/* Closed Campaign Overlay */}
              {campaign.isClosed && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(103, 103, 103, 0.7)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                  }}
                >
                  <div
                    style={{
                    color: colors.primary.white,
                    padding: '16px 32px',
                    borderRadius: '8px',
                    fontFamily: 'Poppins',
                    fontSize: '16px',
                    fontWeight: 600,
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    alignItems: 'center',
                  }}
                >
                  <div>Campaign has been closed</div>
                  <button
                    style={{
                      backgroundColor: colors.grey.disabled,
                      color: colors.text.primary,
                      border: 'none',
                      borderRadius: '100px',
                      padding: '8px 24px',
                      fontFamily: 'Poppins',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                  >
                    REMOVE
                  </button>
                  </div>
                </div>
              )}
            </div>
            ))
          )}
        </div>

        {/* See More Button */}
        {filteredCampaigns.length > 4 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
            <button
              onClick={() => setShowAllCampaigns(!showAllCampaigns)}
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
              {showAllCampaigns ? 'See less ▲' : 'See more ▼'}
            </button>
          </div>
        )}
      </div>
    
      
     </div>
     </div>
  );
};

