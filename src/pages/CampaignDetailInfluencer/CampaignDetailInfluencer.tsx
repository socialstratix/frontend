import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { colors, PLACEHOLDER_IMAGE } from '../../constants';
import { Button } from '../../components/atoms/Button/Button';
import LocationIcon from '../../assets/icons/ui/Location.svg';
import FavoriteIcon from '../../assets/icons/ui/favorite.svg';
import VerifiedIcon from '../../assets/icons/ui/verified.svg';
import ArrowLeftIcon from '../../assets/icons/ui/backward.svg';
import FlagIcon from '../../assets/icons/ui/flag.svg';
import CopyIcon from '../../assets/icons/ui/content_copy.svg';
import OpenInNewIcon from '../../assets/icons/ui/open_in_new.svg';
import AttachFileIcon from '../../assets/icons/ui/attach_file.svg';
import InstagramIcon from '../../assets/icons/social/Icon=Instagram.svg';
import FacebookIcon from '../../assets/icons/social/Icon=Facebook.svg';
import XIcon from '../../assets/icons/social/Icon=X.svg';
import YoutubeIcon from '../../assets/icons/social/Icon=Youtube.svg';
import TiktokIcon from '../../assets/icons/social/Icon=Tiktok.svg';
import { useCampaign } from '../../hooks/useCampaign';
import { campaignService } from '../../services/campaignService';
import type { Campaign as CampaignType } from '../../services/campaignService';

export const CampaignDetailInfluencer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [isSaved, setIsSaved] = useState(false);
  const [brandAvatarError, setBrandAvatarError] = useState(false);
  const [similarCampaignAvatarErrors, setSimilarCampaignAvatarErrors] = useState<{ [key: string]: boolean }>({});

  // Fetch campaign data using the hook
  const { campaign: apiCampaign, isLoading, error } = useCampaign({
    campaignId: id,
    autoFetch: !!id,
  });

  // Get base route for back navigation
  const baseRoute = location.pathname.split('/')[1];
  const backRoute = `/${baseRoute}`;

  // Format time ago helper
  const formatTimeAgo = (dateString?: string): string => {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  };

  // Map API campaign data to component format
  const campaign = useMemo(() => {
    if (!apiCampaign) {
      return null;
    }

    // Get brief description (first 200 characters of description)
    const briefDescription = apiCampaign.description 
      ? (apiCampaign.description.length > 200 
          ? apiCampaign.description.substring(0, 200) + '...' 
          : apiCampaign.description)
      : '';

    return {
      id: apiCampaign._id,
      brandName: apiCampaign.brandName || 'Unknown Brand',
      brandAvatar: apiCampaign.brandAvatar,
      campaignName: apiCampaign.name,
      postedTime: formatTimeAgo(apiCampaign.createdAt),
      isVerified: false, // This would come from brand data if available
      briefDescription,
      description: apiCampaign.description || '',
      location: apiCampaign.location || 'Not specified',
      budget: apiCampaign.budget || 0,
      duration: apiCampaign.deadline || 'Not specified',
      requirement: apiCampaign.requirements || 'Not specified',
      platforms: apiCampaign.platforms || [],
      tags: apiCampaign.tags || [],
      attachments: apiCampaign.attachments || [],
    };
  }, [apiCampaign]);

  // Similar campaigns state
  const [similarCampaigns, setSimilarCampaigns] = useState<CampaignType[]>([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);

  // Fetch similar campaigns using API
  useEffect(() => {
    const fetchSimilarCampaigns = async () => {
      if (!id) return;

      setIsLoadingSimilar(true);
      try {
        // Fetch similar campaigns from API based on matching tags
        const response = await campaignService.getSimilarCampaigns(id, 3);
        setSimilarCampaigns(response.campaigns);
      } catch (error) {
        console.error('Error fetching similar campaigns:', error);
        setSimilarCampaigns([]);
      } finally {
        setIsLoadingSimilar(false);
      }
    };

    fetchSimilarCampaigns();
  }, [id]);

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

  // Loading state
  if (isLoading) {
    return (
      <div style={{ backgroundColor: 'white', minHeight: '100vh', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Poppins', fontSize: '16px', color: colors.text.secondary }}>
          Loading campaign details...
        </div>
      </div>
    );
  }

  // Error state
  if (error || !campaign) {
    return (
      <div style={{ backgroundColor: 'white', minHeight: '100vh', padding: '24px' }}>
        <button
          onClick={() => navigate(backRoute)}
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'transparent',
            border: 'none',
            color: colors.primary.main,
            cursor: 'pointer',
            marginBottom: '24px',
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontWeight: 400,
            padding: '8px 0',
          }}
        >
          <img src={ArrowLeftIcon} alt="Back" style={{ width: '20px', height: '20px' }} />
          Back to campaign listing
        </button>
        <div style={{ textAlign: 'center', padding: '48px', fontFamily: 'Poppins' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: colors.text.primary, marginBottom: '8px' }}>
            {error || 'Campaign not found'}
          </h2>
          <p style={{ fontSize: '14px', color: colors.text.secondary }}>
            {error || 'The campaign you are looking for does not exist or has been removed.'}
          </p>
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
            backgroundColor: 'transparent',
            border: 'none',
            color: colors.primary.main,
            cursor: 'pointer',
            marginBottom: '24px',
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontWeight: 400,
            padding: '8px 0',
          }}
        >
          <img src={ArrowLeftIcon} alt="Back" style={{ width: '20px', height: '20px' }} />
          Back to campaign listing
        </button>
      </div>
      
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        border: `1px solid ${colors.border.light}`,
        backgroundColor: colors.primary.white,
        borderRadius: '8px',
      }}>

        {/* Main Content with Sidebar */}
        <div style={{ display: 'flex' }}>
          {/* Main Campaign Card */}
          <div
            style={{
              flex: 1,
              backgroundColor: colors.primary.white,
              borderRadius: '8px',
              padding: '32px',
            }}
          >
          {/* Header Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ flex: 1 }}>
              {/* Brand Avatar and Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: (campaign.brandAvatar && !brandAvatarError) ? 'transparent' : colors.text.primary,
                    color: colors.primary.white,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Poppins',
                    fontSize: '24px',
                    fontWeight: 600,
                    flexShrink: 0,
                    backgroundImage: (campaign.brandAvatar && !brandAvatarError) ? `url(${campaign.brandAvatar})` : (brandAvatarError ? `url(${PLACEHOLDER_IMAGE})` : 'none'),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  onClick={() => {
                    if (apiCampaign?.brandId) {
                      navigate(`/brand/brand/${apiCampaign.brandId}`);
                    }
                  }}
                >
                  {campaign.brandAvatar && !brandAvatarError ? (
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
                      onError={() => setBrandAvatarError(true)}
                    />
                  ) : null}
                  {(!campaign.brandAvatar || brandAvatarError) && (campaign.brandName?.charAt(0).toUpperCase() || 'B')}
                </div>
                <h2
                  onClick={() => {
                    if (apiCampaign?.brandId) {
                      navigate(`/brand/brand/${apiCampaign.brandId}`);
                    }
                  }}
                  style={{
                    fontFamily: 'Poppins',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: colors.text.primary,
                    margin: 0,
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = colors.primary.main;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = colors.text.primary;
                  }}
                >
                  {campaign.brandName}
                </h2>
              </div>

              {/* Campaign Name */}
              <h1
                style={{
                  fontFamily: 'Poppins',
                  fontSize: '32px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  margin: '0 0 12px 0',
                }}
              >
                {campaign.campaignName}
              </h1>

              {/* Posted Time and Verified Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontFamily: 'Poppins',
                  fontSize: '12px',
                  color: colors.text.secondary,
                }}
              >
                <span>Posted {campaign.postedTime}</span>
               
                {campaign.isVerified && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <img src={VerifiedIcon} alt="Verified" style={{ width: '16px', height: '16px' }} />
                    <span style={{ fontSize: '12px', color: colors.text.secondary }}>verified payment</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Brief Description */}
          <div style={{ marginBottom: '24px' }}>
            <p
              style={{
                fontFamily: 'Poppins',
                fontSize: '14px',
                color: colors.text.secondary,
                lineHeight: '1.6',
                margin: 0,
              }}
            >
              {campaign.briefDescription}
            </p>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '24px' }}>
            <h3
              style={{
                fontFamily: 'Poppins',
                fontSize: '16px',
                fontWeight: 600,
                color: colors.text.primary,
                marginBottom: '12px',
              }}
            >
              Description
            </h3>
            <p
              style={{
                fontFamily: 'Poppins',
                fontSize: '14px',
                color: colors.text.secondary,
                lineHeight: '1.6',
                margin: 0,
                whiteSpace: 'pre-line',
              }}
            >
              {campaign.description}
            </p>
          </div>

          {/* Post On */}
          <div style={{ marginBottom: '24px' }}>
            <h3
              style={{
                fontFamily: 'Poppins',
                fontSize: '16px',
                fontWeight: 600,
                color: colors.text.primary,
                marginBottom: '12px',
              }}
            >
              Post on
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {campaign.platforms.map((platform) => (
                <div
                  key={platform}
                  style={{
                    padding: '8px 16px',
                    border: `1px solid ${getPlatformColor(platform)}`,
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  <img
                    src={getPlatformIcon(platform)}
                    alt={platform}
                    style={{ width: '20px', height: '20px' }}
                  />
                  <span
                    style={{
                      fontFamily: 'Poppins',
                      fontSize: '14px',
                      color: colors.text.primary,
                      textTransform: 'capitalize',
                      fontWeight: 600,
                    }}
                  >
                    {platform}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '24px' }}>
            <h3
              style={{
                fontFamily: 'Poppins',
                fontSize: '16px',
                fontWeight: 600,
                color: colors.text.primary,
                marginBottom: '12px',
              }}
            >
              Tags
            </h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {campaign.tags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    padding: '6px 16px',
                    backgroundColor: colors.secondary.light,
                    borderRadius: '16px',
                    fontFamily: 'Poppins',
                    fontSize: '14px',
                    color: colors.text.primary,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Attachments */}
          <div>
            <h3
              style={{
                fontFamily: 'Poppins',
                fontSize: '16px',
                fontWeight: 600,
                color: colors.text.primary,
                marginBottom: '12px',
              }}
            >
              Attachments
            </h3>
            {campaign.attachments && campaign.attachments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {campaign.attachments.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: 'Poppins',
                      fontSize: '14px',
                      color: colors.primary.main,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <img src={AttachFileIcon} alt="Attachment" style={{ width: '16px', height: '16px' }} />
                    {url}
                  </a>
                ))}
              </div>
            ) : (
              <p style={{ fontFamily: 'Poppins', fontSize: '14px', color: colors.text.secondary, margin: 0 }}>
                No attachments
              </p>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div
          style={{
            width: '284px',
            height: '561px',
            paddingTop: '49px',
            paddingBottom: '24px',
            paddingLeft: '16px',
            gap: '24px',
            opacity: 1,
            backgroundColor: colors.primary.white,
            // borderRight: `1px solid ${colors.border.light}`,
             borderLeft: `1px solid ${colors.border.light}`,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '8px',
          }}
        >
          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', paddingRight: '16px' }}>
            <button
              onClick={() => setIsSaved(!isSaved)}
              style={{
                flex: 1,
                height: '36px',
                borderRadius: '100px',
                border: `1px solid ${colors.border.light}`,
                backgroundColor: colors.primary.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontWeight: 400,
                color: colors.text.primary,
              }}
            >
              <img
                src={FavoriteIcon}
                alt="Save"
                style={{
                  width: '20px',
                  height: '20px',
                  filter: isSaved ? 'none' : 'grayscale(100%)',
                }}
              />
              SAVE
            </button>

            <Button
              variant="filled"
              style={{
                flex: 1,
                height: '36px',
                fontSize: '14px',
                fontWeight: 600,
                padding: '0 16px',
                borderRadius: '100px',
              }}
            >
              APPLY
            </Button>
          </div>

          {/* Location and Budget */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingRight: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <img src={LocationIcon} alt="Location" style={{ width: '16px', height: '16px' }} />
              <span style={{ fontFamily: 'Poppins', fontSize: '14px', color: colors.text.secondary }}>
                {campaign.location}
              </span>
            </div>
            <span style={{ color: colors.text.secondary }}>|</span>
            <div>
              <span style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 600 }}>Budget: </span>
              <span style={{ fontFamily: 'Poppins', fontSize: '14px', color: colors.text.secondary }}>
                ₹ {campaign.budget.toLocaleString()}
              </span>
            </div>
          </div>

           {/* About Brand */}
           <div style={{ paddingRight: '16px' }}>
             <button
               onClick={() => {
                 if (apiCampaign?.brandId) {
                   navigate(`/brand/brand/${apiCampaign.brandId}`);
                 }
               }}
               style={{
                 backgroundColor: 'transparent',
                 border: 'none',
                 padding: 0,
                 fontFamily: 'Poppins',
                 fontSize: '14px',
                 color: colors.text.primary,
                 cursor: 'pointer',
                 display: 'flex',
                 alignItems: 'center',
                 gap: '4px',
               }}
             >
               About Brand
               <img src={OpenInNewIcon} alt="Open" style={{ width: '16px', height: '16px' }} />
             </button>
           </div>

          {/* Requirements Section */}
          {campaign.requirement && campaign.requirement !== 'Not specified' && (
            <div style={{ paddingRight: '16px' }}>
              <h3
                style={{
                  fontFamily: 'Poppins',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  marginBottom: '8px',
                }}
              >
                Requirements
              </h3>
              <p style={{ fontFamily: 'Poppins', fontSize: '14px', color: colors.text.secondary }}>
                {campaign.requirement}
              </p>
            </div>
          )}

          {/* Duration Section */}
          {campaign.duration && campaign.duration !== 'Not specified' && (
            <div style={{ paddingRight: '16px' }}>
              <h3
                style={{
                  fontFamily: 'Poppins',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  marginBottom: '8px',
                }}
              >
                Duration
              </h3>
              <p style={{ fontFamily: 'Poppins', fontSize: '14px', color: colors.text.secondary }}>
                {campaign.duration}
              </p>
            </div>
          )}

          {/* Report Campaign */}
          <div style={{ paddingRight: '16px' }}>
            <button
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                padding: 0,
                fontFamily: 'Poppins',
                fontSize: '14px',
                color: colors.primary.main,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <img src={FlagIcon} alt="Flag" style={{ width: '16px', height: '16px' }} />
              Report campaign
            </button>
          </div>

          {/* Campaign Link - Only show if available */}
          {apiCampaign?.attachments && apiCampaign.attachments.length > 0 && (
            <div style={{ paddingRight: '16px' }}>
              <h3
                style={{
                  fontFamily: 'Poppins',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  marginBottom: '8px',
                }}
              >
                Campaign Resources
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {apiCampaign.attachments.slice(0, 3).map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: 'Poppins',
                      fontSize: '12px',
                      color: colors.primary.main,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      border: `1px solid ${colors.border.light}`,
                      borderRadius: '4px',
                      backgroundColor: '#F5F5F5',
                    }}
                  >
                    <img src={AttachFileIcon} alt="Attachment" style={{ width: '16px', height: '16px' }} />
                    <span
                      style={{
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {url.length > 30 ? url.substring(0, 30) + '...' : url}
                    </span>
                    <img src={CopyIcon} alt="Copy" style={{ width: '16px', height: '16px' }} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

        {/* Similar Campaigns Section */}
        <div
          style={{
            backgroundColor: colors.primary.white,
            borderRadius: '8px',
            padding: '32px',
            marginTop: '24px',
          }}
        >
          <h2
            style={{
              fontFamily: 'Poppins',
              fontSize: '20px',
              fontWeight: 600,
              color: colors.text.primary,
              marginBottom: '24px',
            }}
          >
            Similar Campaigns
          </h2>

          {isLoadingSimilar ? (
            <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'Poppins', color: colors.text.secondary }}>
              Loading similar campaigns...
            </div>
          ) : similarCampaigns.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {similarCampaigns.map((simCampaign) => {
                  const briefDesc = simCampaign.description 
                    ? (simCampaign.description.length > 200 
                        ? simCampaign.description.substring(0, 200) + '...' 
                        : simCampaign.description)
                    : '';
                  
                  return (
                    <div
                      key={simCampaign._id}
                      style={{
                        borderBottom: `1px solid ${colors.border.light}`,
                        borderRadius: '8px',
                        padding: '20px',
                        display: 'flex',
                        gap: '16px',
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate(`/${baseRoute}/campaigns/${simCampaign._id}`)}
                    >
                      {/* Avatar */}
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          backgroundColor: (simCampaign.brandAvatar && !similarCampaignAvatarErrors[simCampaign._id]) ? 'transparent' : colors.text.primary,
                          color: colors.primary.white,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'Poppins',
                          fontSize: '20px',
                          fontWeight: 600,
                          flexShrink: 0,
                          backgroundImage: (simCampaign.brandAvatar && !similarCampaignAvatarErrors[simCampaign._id]) ? `url(${simCampaign.brandAvatar})` : (similarCampaignAvatarErrors[simCampaign._id] ? `url(${PLACEHOLDER_IMAGE})` : 'none'),
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        {simCampaign.brandAvatar && !similarCampaignAvatarErrors[simCampaign._id] ? (
                          <img
                            src={simCampaign.brandAvatar}
                            alt={simCampaign.brandName || 'Brand'}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: '50%',
                              display: 'none', // Hidden, using backgroundImage instead
                            }}
                            onError={() => {
                              setSimilarCampaignAvatarErrors(prev => ({ ...prev, [simCampaign._id]: true }));
                            }}
                          />
                        ) : null}
                        {(!simCampaign.brandAvatar || similarCampaignAvatarErrors[simCampaign._id]) && (simCampaign.brandName?.charAt(0).toUpperCase() || 'B')}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontFamily: 'Poppins',
                            fontSize: '12px',
                            color: colors.text.secondary,
                            marginBottom: '4px',
                          }}
                        >
                          Posted {formatTimeAgo(simCampaign.createdAt)}
                        </div>
                         <button
                           onClick={(e) => {
                             e.stopPropagation();
                             navigate(`/brand/brand/${simCampaign.brandId}`);
                           }}
                           style={{
                             fontFamily: 'Poppins',
                             fontSize: '14px',
                             color: colors.primary.main,
                             marginBottom: '8px',
                             backgroundColor: 'transparent',
                             border: 'none',
                             padding: 0,
                             cursor: 'pointer',
                           }}
                         >
                           {simCampaign.brandName || 'Unknown Brand'} →
                         </button>

                        <h3
                          style={{
                            fontFamily: 'Poppins',
                            fontSize: '18px',
                            fontWeight: 600,
                            color: colors.text.primary,
                            margin: '0 0 12px 0',
                          }}
                        >
                          {simCampaign.name}
                        </h3>

                        <p
                          style={{
                            fontFamily: 'Poppins',
                            fontSize: '14px',
                            color: colors.text.secondary,
                            lineHeight: '1.6',
                            margin: '0 0 12px 0',
                          }}
                        >
                          {briefDesc}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                          {simCampaign.location && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 600 }}>
                                Location:
                              </span>
                              <img src={LocationIcon} alt="Location" style={{ width: '16px', height: '16px' }} />
                              <span style={{ fontFamily: 'Poppins', fontSize: '14px', color: colors.text.secondary }}>
                                {simCampaign.location}
                              </span>
                            </div>
                          )}

                          {simCampaign.budget && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 600 }}>Budget:</span>
                              <span style={{ fontFamily: 'Poppins', fontSize: '14px', color: colors.text.secondary }}>
                                ₹ {simCampaign.budget.toLocaleString()}
                              </span>
                            </div>
                          )}

                          {simCampaign.platforms && simCampaign.platforms.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 600 }}>Post on:</span>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {simCampaign.platforms.map((platform) => (
                                  <img
                                    key={platform}
                                    src={getPlatformIcon(platform)}
                                    alt={platform}
                                    style={{ width: '20px', height: '20px' }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle save functionality
                          }}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            border: `1px solid ${colors.border.light}`,
                            backgroundColor: colors.primary.white,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <img
                            src={FavoriteIcon}
                            alt="Save"
                            style={{ width: '20px', height: '20px', filter: 'grayscale(100%)' }}
                          />
                        </button>

                        <Button
                          variant="filled"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/${baseRoute}/campaigns/${simCampaign._id}`);
                          }}
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
                      </div>
                    </div>
                  );
                })}
              </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'Poppins', color: colors.text.secondary }}>
              No campaigns found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

