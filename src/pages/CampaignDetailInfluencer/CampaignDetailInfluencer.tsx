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
import { savedCampaignService } from '../../services/savedCampaignService';
import { useAuth } from '../../contexts/AuthContext';
import { EditButton } from '../../components/atoms/EditButton';
import { EditName } from '../../components/molecules/EditName';
import { EditDescription } from '../../components/molecules/EditDescription';
import { EditTags } from '../../components/molecules/EditTags';
import { toastService } from '../../utils/toast';

// Edit Attachments Modal Component
const EditAttachmentsModal: React.FC<{
  campaign: CampaignType;
  onClose: () => void;
  onSave: (updatedAttachments: string[], newFiles?: File[]) => Promise<void>;
}> = ({ campaign, onClose, onSave }) => {
  const [currentAttachments, setCurrentAttachments] = useState<string[]>(campaign.attachments || []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxFiles = 5;
  const totalCount = currentAttachments.length + newFiles.length;

  const handleRemoveAttachment = (index: number) => {
    setCurrentAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = maxFiles - totalCount;
    if (remainingSlots <= 0) {
      setError(`Maximum ${maxFiles} attachments allowed. Please remove some files first.`);
      e.target.value = '';
      return;
    }

    const validFiles: File[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    
    filesToProcess.forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        setError(`File "${file.name}" is not a valid format.`);
        return;
      }
      if (file.size > maxSize) {
        setError(`File "${file.name}" exceeds 5MB.`);
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setNewFiles((prev) => {
        const combined = [...prev, ...validFiles];
        if (combined.length > remainingSlots) {
          setError(`Maximum ${maxFiles} attachments allowed. Only the first ${remainingSlots} files were added.`);
          return combined.slice(0, remainingSlots);
        }
        return combined;
      });
      setError(null);
    }

    e.target.value = '';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileName = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const fileName = pathname.split('/').pop() || pathname;
      return decodeURIComponent(fileName);
    } catch {
      const parts = url.split('/');
      const fileName = parts[parts.length - 1].split('?')[0];
      return decodeURIComponent(fileName);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await onSave(currentAttachments, newFiles.length > 0 ? newFiles : undefined);
    } catch (err: any) {
      setError(err.message || 'Failed to save attachments');
    } finally {
      setIsSaving(false);
    }
  };

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
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: colors.primary.white,
          borderRadius: '8px',
          padding: '32px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontFamily: 'Poppins',
            fontSize: '20px',
            fontWeight: 600,
            marginBottom: '8px',
          }}
        >
          Edit Attachments
        </h2>
        <p style={{ 
          fontFamily: 'Poppins', 
          fontSize: '14px', 
          color: colors.text.secondary, 
          marginBottom: '24px' 
        }}>
          {totalCount}/{maxFiles} attachments
        </p>

        {/* Current Attachments */}
        {currentAttachments.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              fontFamily: 'Poppins', 
              fontSize: '16px', 
              fontWeight: 600, 
              marginBottom: '12px' 
            }}>
              Current Attachments
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentAttachments.map((url, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: colors.elevated.background,
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                    <img src={AttachFileIcon} alt="File" style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                    <span style={{ 
                      fontSize: '14px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {getFileName(url)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: colors.red.main,
                      fontSize: '18px',
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Files */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ 
            fontFamily: 'Poppins', 
            fontSize: '16px', 
            fontWeight: 600, 
            marginBottom: '12px' 
          }}>
            Add New Files
          </h3>
          <input
            type="file"
            id="edit-file-upload"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
            multiple
            onChange={handleFileChange}
            disabled={totalCount >= maxFiles}
            style={{ display: 'none' }}
          />
          <label htmlFor="edit-file-upload">
            <div
              style={{
                width: '100%',
                height: '56px',
                border: `1px solid ${colors.border.light}`,
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '0 16px',
                backgroundColor: colors.primary.white,
                cursor: totalCount >= maxFiles ? 'not-allowed' : 'pointer',
                opacity: totalCount >= maxFiles ? 0.6 : 1,
                fontFamily: 'Poppins',
                fontSize: '14px',
              }}
            >
              <img src={AttachFileIcon} alt="Attach" style={{ width: '20px', height: '20px' }} />
              {totalCount >= maxFiles 
                ? 'Maximum 5 attachments reached' 
                : 'Attach files (PDF, Word, Images)'}
            </div>
          </label>

          {/* New Files List */}
          {newFiles.length > 0 && (
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {newFiles.map((file, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: colors.elevated.background,
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                    <img src={AttachFileIcon} alt="File" style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                    <span style={{ 
                      fontSize: '14px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {file.name}
                    </span>
                    <span style={{ fontSize: '12px', color: colors.text.secondary }}>
                      ({formatFileSize(file.size)})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveNewFile(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: colors.red.main,
                      fontSize: '18px',
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fee',
            border: `1px solid ${colors.red.main}`,
            borderRadius: '4px',
            color: colors.red.main,
            fontSize: '14px',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              backgroundColor: colors.elevated.background,
              color: colors.text.primary,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Poppins',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '12px 24px',
              backgroundColor: colors.primary.main,
              color: colors.primary.white,
              border: 'none',
              borderRadius: '8px',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.6 : 1,
              fontFamily: 'Poppins',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const CampaignDetailInfluencer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isBrand = user?.userType === 'brand';
  const [isSaved, setIsSaved] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [brandAvatarError, setBrandAvatarError] = useState(false);
  const [similarCampaignAvatarErrors, setSimilarCampaignAvatarErrors] = useState<{ [key: string]: boolean }>({});
  const [openMenu, setOpenMenu] = useState(false);
  const [campaignTab, setCampaignTab] = useState<'active' | 'closed'>('active');
  
  // Edit modal states
  const [showEditName, setShowEditName] = useState(false);
  const [showEditDescription, setShowEditDescription] = useState(false);
  const [showEditPlatforms, setShowEditPlatforms] = useState(false);
  const [showEditTags, setShowEditTags] = useState(false);
  const [showEditAttachments, setShowEditAttachments] = useState(false);

  // Fetch campaign data using the hook
  const { campaign: apiCampaign, isLoading, error, updateCampaign, deleteCampaign } = useCampaign({
    campaignId: id,
    autoFetch: !!id,
  });

  // Fetch saved status on mount for influencers
  useEffect(() => {
    const fetchSavedStatus = async () => {
      if (!id || isBrand) return;
      try {
        const saved = await savedCampaignService.checkIfSaved(id);
        setIsSaved(saved);
      } catch (err) {
        console.error('Failed to check saved status:', err);
      }
    };

    fetchSavedStatus();
  }, [id, isBrand]);

  // Get base route for back navigation
  const baseRoute = location.pathname.split('/')[1];
  
  // Function to get back route dynamically
  const getBackRoute = () => {
    if (isBrand && apiCampaign?.brandId) {
      return `/${baseRoute}/brand/${apiCampaign.brandId}`;
    }
    return `/${baseRoute}`;
  };

  // Handler for marking campaign as complete
  const handleMarkAsComplete = async () => {
    if (!id) return;
    try {
      await updateCampaign(id, { status: 'completed' });
      setOpenMenu(false);
      // Refresh to show updated status
      window.location.reload();
    } catch (err) {
      console.error('Failed to mark campaign as complete:', err);
    }
  };

  // Handler for reopening campaign
  const handleReopenCampaign = async () => {
    if (!id) return;
    try {
      await updateCampaign(id, { status: 'active' });
      setOpenMenu(false);
      // Refresh to show updated status
      window.location.reload();
    } catch (err) {
      console.error('Failed to reopen campaign:', err);
    }
  };

  // Handler for applying to campaign
  const handleApplyToCampaign = async () => {
    if (!id || isBrand || !user) return;
    
    try {
      setIsApplying(true);
      const result = await campaignService.applyToCampaign(id);
      
      console.log('Application successful, conversation ID:', result.conversationId);
      
      // Small delay to ensure the conversation is saved
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigate to messages page with the conversation
      const baseRoute = location.pathname.split('/')[1] || 'influencer';
      navigate(`/${baseRoute}/messages/${result.conversationId}`);
    } catch (error: any) {
      console.error('Failed to apply to campaign:', error);
      toastService.error(error.message || 'Failed to apply to campaign. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  // Handler for deleting campaign
  const handleDeleteCampaign = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteCampaign(id);
      setOpenMenu(false);
      // Navigate back to profile
      navigate(getBackRoute());
    } catch (err) {
      console.error('Failed to delete campaign:', err);
    }
  };

  // Handler for toggling save status
  const handleToggleSave = async () => {
    if (!id) return;
    try {
      const wasSaved = isSaved;
      // Optimistic update
      setIsSaved(!wasSaved);
      
      // Make API call
      if (wasSaved) {
        await savedCampaignService.unsaveCampaign(id);
      } else {
        await savedCampaignService.saveCampaign(id);
      }
    } catch (error) {
      console.error('Failed to toggle save:', error);
      // Revert on error
      setIsSaved(isSaved);
    }
  };

  // Handler for saving campaign name
  const handleSaveName = async (name: string) => {
    if (!id) return;
    try {
      await updateCampaign(id, { name });
      setShowEditName(false);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (err) {
      console.error('Failed to update campaign name:', err);
    }
  };

  // Handler for saving description
  const handleSaveDescription = async (description: string) => {
    if (!id) return;
    try {
      await updateCampaign(id, { description });
      setShowEditDescription(false);
      window.location.reload();
    } catch (err) {
      console.error('Failed to update description:', err);
    }
  };

  // Handler for saving tags
  const handleSaveTags = async (tags: string[]) => {
    if (!id) return;
    try {
      await updateCampaign(id, { tags });
      setShowEditTags(false);
      window.location.reload();
    } catch (err) {
      console.error('Failed to update tags:', err);
    }
  };

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
      isClosed: apiCampaign.isClosed || apiCampaign.status === 'closed' || apiCampaign.status === 'completed',
    };
  }, [apiCampaign]);

  // Similar campaigns state
  const [similarCampaigns, setSimilarCampaigns] = useState<CampaignType[]>([]);
  const [savedSimilarCampaigns, setSavedSimilarCampaigns] = useState<Set<string>>(new Set());
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);

  // Brand campaigns state (for brands viewing their own campaigns)
  const [brandCampaigns, setBrandCampaigns] = useState<CampaignType[]>([]);
  const [isLoadingBrandCampaigns, setIsLoadingBrandCampaigns] = useState(false);

  // Fetch similar campaigns for influencers OR brand's other campaigns for brands
  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!id) return;

      if (isBrand && apiCampaign?.brandId) {
        // For brands, fetch all campaigns from the same brand
        setIsLoadingBrandCampaigns(true);
        try {
          const response = await campaignService.getCampaignsByBrandId(apiCampaign.brandId);
          setBrandCampaigns(response.campaigns || response || []);
        } catch (error) {
          console.error('Error fetching brand campaigns:', error);
          setBrandCampaigns([]);
        } finally {
          setIsLoadingBrandCampaigns(false);
        }
      } else {
        // For influencers, fetch similar campaigns
        setIsLoadingSimilar(true);
        try {
          const response = await campaignService.getSimilarCampaigns(id, 3);
          setSimilarCampaigns(response.campaigns);
          
          // Check which campaigns are saved
          const savedIds = new Set<string>();
          for (const campaign of response.campaigns) {
            try {
              const isSaved = await savedCampaignService.checkIfSaved(campaign._id);
              if (isSaved) {
                savedIds.add(campaign._id);
              }
            } catch (error) {
              console.error(`Error checking saved status for campaign ${campaign._id}:`, error);
            }
          }
          setSavedSimilarCampaigns(savedIds);
        } catch (error) {
          console.error('Error fetching similar campaigns:', error);
          setSimilarCampaigns([]);
        } finally {
          setIsLoadingSimilar(false);
        }
      }
    };

    fetchCampaigns();
  }, [id, isBrand, apiCampaign?.brandId]);

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
          onClick={() => navigate(getBackRoute())}
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
          onClick={() => navigate(getBackRoute())}
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
          {isBrand ? 'Back to profile' : 'Back to campaign listing'}
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
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <h1
                  style={{
                    fontFamily: 'Poppins',
                    fontSize: '32px',
                    fontWeight: 600,
                    color: colors.text.primary,
                    margin: 0,
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                  }}
                >
                  {campaign.campaignName}
                </h1>
                {isBrand && (
                  <EditButton 
                    onClick={() => setShowEditName(true)}
                  />
                )}
              </div>

              {/* Posted Time, Status Badge, and Verified Badge */}
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
                
                {/* Campaign Status Badge */}
                {apiCampaign?.status && (
                  <div
                    style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      backgroundColor: 
                        apiCampaign.status === 'active' ? 'rgba(46, 125, 50, 0.1)' :
                        apiCampaign.status === 'completed' || apiCampaign.status === 'closed' ? 'rgba(120, 60, 145, 0.1)' :
                        'rgba(158, 158, 158, 0.1)',
                      color:
                        apiCampaign.status === 'active' ? 'rgba(46, 125, 50, 1)' :
                        apiCampaign.status === 'completed' || apiCampaign.status === 'closed' ? 'rgba(120, 60, 145, 1)' :
                        'rgba(97, 97, 97, 1)',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    {apiCampaign.status === 'completed' ? 'Closed' : apiCampaign.status}
                  </div>
                )}
               
                {campaign.isVerified && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <img src={VerifiedIcon} alt="Verified" style={{ width: '16px', height: '16px' }} />
                    <span style={{ fontSize: '12px', color: colors.text.secondary }}>verified payment</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <p
              style={{
                fontFamily: 'Poppins',
                fontSize: '14px',
                color: colors.text.secondary,
                lineHeight: '1.6',
                margin: 0,
                whiteSpace: 'pre-line',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
                flex: 1,
              }}
            >
              {campaign.description}
            </p>
            {isBrand && (
              <EditButton 
                onClick={() => setShowEditDescription(true)}
              />
            )}
          </div>

          {/* Post On */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <h3
                style={{
                  fontFamily: 'Poppins',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  margin: 0,
                }}
              >
                Post on
              </h3>
              {isBrand && (
                <EditButton 
                  onClick={() => setShowEditPlatforms(true)}
                />
              )}
            </div>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <h3
                style={{
                  fontFamily: 'Poppins',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  margin: 0,
                }}
              >
                Tags
              </h3>
              {isBrand && (
                <EditButton 
                  onClick={() => setShowEditTags(true)}
                />
              )}
            </div>
            <p
              style={{
                fontFamily: 'Poppins',
                fontSize: '14px',
                color: colors.text.primary,
                margin: 0,
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
              }}
            >
              {campaign.tags.join(', ')}
            </p>
          </div>

          {/* Attachments */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <h3
                style={{
                  fontFamily: 'Poppins',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  margin: 0,
                }}
              >
                Attachments
              </h3>
              {isBrand && (
                <EditButton 
                  onClick={() => setShowEditAttachments(true)}
                />
              )}
            </div>
            {campaign.attachments && campaign.attachments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {campaign.attachments.map((url, index) => {
                  // Extract filename from URL
                  const getFileName = (url: string): string => {
                    try {
                      const urlObj = new URL(url);
                      const pathname = urlObj.pathname;
                      const fileName = pathname.split('/').pop() || pathname;
                      // Decode URL-encoded characters
                      return decodeURIComponent(fileName);
                    } catch {
                      // If URL parsing fails, try to extract from path
                      const parts = url.split('/');
                      const fileName = parts[parts.length - 1].split('?')[0];
                      return decodeURIComponent(fileName);
                    }
                  };

                  const getFileType = (url: string): string => {
                    const fileName = getFileName(url).toLowerCase();
                    if (fileName.endsWith('.pdf')) return 'PDF';
                    if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) return 'Word';
                    if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.gif') || fileName.endsWith('.webp')) return 'Image';
                    return 'File';
                  };

                  const fileName = getFileName(url);
                  const fileType = getFileType(url);

                  return (
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
                        padding: '8px 12px',
                        backgroundColor: colors.primary.white,
                        border: `1px solid ${colors.border.light}`,
                        borderRadius: '4px',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.elevated.background;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = colors.primary.white;
                      }}
                    >
                      <img src={AttachFileIcon} alt="Attachment" style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                      <div style={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        minWidth: 0,
                      }}>
                        <span style={{ 
                          fontWeight: 500,
                          color: colors.text.primary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {fileName}
                        </span>
                        <span style={{
                          fontSize: '12px',
                          color: colors.text.secondary,
                        }}>
                          {fileType}
                        </span>
                      </div>
                    </a>
                  );
                })}
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
          {isBrand && (
            <div style={{ paddingRight: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <button
                  onClick={apiCampaign?.status === 'completed' || apiCampaign?.status === 'closed' ? handleReopenCampaign : handleMarkAsComplete}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    height: '44px',
                    backgroundColor: 'transparent',
                    border: `2px solid ${(apiCampaign?.status === 'completed' || apiCampaign?.status === 'closed') ? 'rgba(46, 125, 50, 1)' : 'rgba(120, 60, 145, 1)'}`,
                    borderRadius: '24px',
                    cursor: 'pointer',
                    fontFamily: 'Poppins',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: (apiCampaign?.status === 'completed' || apiCampaign?.status === 'closed') ? 'rgba(46, 125, 50, 1)' : 'rgba(120, 60, 145, 1)',
                  }}
                >
                  <span>{(apiCampaign?.status === 'completed' || apiCampaign?.status === 'closed') ? 'REOPEN CAMPAIGN' : 'CLOSE CAMPAIGN'}</span>
                </button>

                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setOpenMenu(!openMenu)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '44px',
                      height: '44px',
                      backgroundColor: 'transparent',
                      border: '2px solid rgba(120, 60, 145, 1)',
                      borderRadius: '24px',
                      cursor: 'pointer',
                      fontFamily: 'Poppins',
                      fontSize: '20px',
                      fontWeight: 600,
                      color: 'rgba(120, 60, 145, 1)',
                    }}
                  >
                    ⋮
                  </button>

                  {openMenu && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '8px',
                        minWidth: '200px',
                        padding: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                        borderRadius: '8px',
                        boxShadow: '0px 4px 12px 0px rgba(30, 0, 43, 0.15)',
                        zIndex: 10,
                      }}
                    >
                      <button
                        onClick={() => {
                          setShowEditName(true);
                          setOpenMenu(false);
                        }}
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
                          borderRadius: '6px',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.secondary.light;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        Edit Campaign Name
                      </button>
                      <button
                        onClick={() => {
                          navigate(`/${baseRoute}/campaigns/create?edit=${id}`);
                          setOpenMenu(false);
                        }}
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
                          borderRadius: '6px',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.secondary.light;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        Full Edit
                      </button>
                      <button
                        onClick={apiCampaign?.status === 'completed' || apiCampaign?.status === 'closed' ? handleReopenCampaign : handleMarkAsComplete}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          fontFamily: 'Poppins',
                          fontSize: '14px',
                          color: (apiCampaign?.status === 'completed' || apiCampaign?.status === 'closed') ? 'rgba(46, 125, 50, 1)' : colors.text.primary,
                          cursor: 'pointer',
                          borderRadius: '6px',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.secondary.light;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        {(apiCampaign?.status === 'completed' || apiCampaign?.status === 'closed') ? 'Reopen Campaign' : 'Close Campaign'}
                      </button>
                      <button
                        onClick={handleDeleteCampaign}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          fontFamily: 'Poppins',
                          fontSize: '14px',
                          color: colors.red.main,
                          cursor: 'pointer',
                          borderRadius: '6px',
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
            </div>
          )}

          {/* Campaign Link Section - Only for brands */}
          {isBrand && (
            <div style={{ paddingRight: '16px', marginBottom: '16px' }}>
              <h3
                style={{
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  marginBottom: '8px',
                }}
              >
                Campaign Link
              </h3>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: '4px',
                  backgroundColor: '#F9F9F9',
                }}
              >
                <span
                  style={{
                    flex: 1,
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    color: colors.text.secondary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {window.location.href}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    // Could add a toast notification here
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <img src={CopyIcon} alt="Copy" style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            </div>
          )}

          {/* Influencer Action Buttons */}
          {!isBrand && (
            <div style={{ display: 'flex', gap: '8px', paddingRight: '16px' }}>
              <button
                onClick={handleToggleSave}
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
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={isSaved ? '#FF0000' : 'none'}
                  stroke={isSaved ? '#FF0000' : '#666666'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                SAVE
              </button>

              <Button
                variant="filled"
                onClick={handleApplyToCampaign}
                disabled={isApplying || campaign.isClosed}
                style={{
                  flex: 1,
                  height: '36px',
                  fontSize: '14px',
                  fontWeight: 600,
                  padding: '0 16px',
                  borderRadius: '100px',
                }}
              >
                {isApplying ? 'APPLYING...' : 'APPLY'}
              </Button>
            </div>
          )}

          {/* Pricing Section */}
          <div style={{ paddingRight: '16px', marginBottom: '16px' }}>
            <h3
              style={{
                fontFamily: 'Poppins',
                fontSize: '16px',
                fontWeight: 600,
                color: colors.text.primary,
                marginBottom: '12px',
              }}
            >
              Pricing
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Poppins', fontSize: '14px', color: colors.text.secondary }}>
                  Costs per view:
                </span>
                <span style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 600, color: colors.text.primary }}>
                  ₹0.25
                </span>
              </div>
              {isBrand && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'Poppins', fontSize: '14px', color: colors.text.secondary }}>
                    Campaign Budget
                  </span>
                  <span style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 600, color: colors.text.primary }}>
                    ₹ {campaign.budget.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Location and Budget */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingRight: '16px', flexWrap: 'nowrap', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              <img src={LocationIcon} alt="Location" style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              <span style={{ 
                fontFamily: 'Poppins', 
                fontSize: '14px', 
                color: colors.text.secondary,
                whiteSpace: 'nowrap',
              }}>
                {campaign.location || 'Not specified'}
              </span>
            </div>
            <span style={{ color: colors.text.secondary, flexShrink: 0 }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              <span style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 600, color: colors.text.primary }}>Budget: </span>
              <span style={{ fontFamily: 'Poppins', fontSize: '14px', color: colors.text.secondary }}>
                ₹ {campaign.budget.toLocaleString()}
              </span>
            </div>
          </div>

           {/* About Brand - Only show for influencers */}
           {!isBrand && (
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
           )}

          {/* Requirements Section */}
          <div style={{ paddingRight: '16px', marginBottom: '16px' }}>
            <h3
              style={{
                fontFamily: 'Poppins',
                fontSize: '16px',
                fontWeight: 600,
                color: colors.text.primary,
                marginBottom: '12px',
              }}
            >
              Requirements
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Poppins', fontSize: '14px', color: colors.text.secondary }}>
                  Min number of followers:
                </span>
                <span style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 600, color: colors.text.primary }}>
                  1,000
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Poppins', fontSize: '14px', color: colors.text.secondary }}>
                  Duration:
                </span>
                <span style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 600, color: colors.text.primary }}>
                  60 days
                </span>
              </div>
            </div>
            {campaign.requirement && campaign.requirement !== 'Not specified' && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${colors.border.light}` }}>
                <p style={{ 
                  fontFamily: 'Poppins', 
                  fontSize: '14px', 
                  color: colors.text.secondary,
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                  margin: 0,
                }}>
                  {campaign.requirement}
                </p>
              </div>
            )}
          </div>

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
              <p style={{ 
                fontFamily: 'Poppins', 
                fontSize: '14px', 
                color: colors.text.secondary,
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
              }}>
                {campaign.duration}
              </p>
            </div>
          )}

          {/* Report Campaign - Only show for influencers */}
          {!isBrand && (
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
          )}

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

        {/* Brand's Other Campaigns Section - Only show for brands */}
        {isBrand && apiCampaign?.brandId && (
          <div
            style={{
              backgroundColor: colors.primary.white,
              borderRadius: '8px',
              padding: '32px',
              marginTop: '24px',
            }}
          >
            {/* Tabs for Active and Closed */}
            <div style={{ display: 'flex', gap: '32px', marginBottom: '24px', borderBottom: `2px solid ${colors.border.light}` }}>
              <button
                onClick={() => setCampaignTab('active')}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: '12px 0',
                  fontFamily: 'Poppins',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: campaignTab === 'active' ? colors.primary.main : colors.text.secondary,
                  borderBottom: campaignTab === 'active' ? `2px solid ${colors.primary.main}` : 'none',
                  marginBottom: '-2px',
                  cursor: 'pointer',
                }}
              >
                Active Campaign
              </button>
              <button
                onClick={() => setCampaignTab('closed')}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: '12px 0',
                  fontFamily: 'Poppins',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: campaignTab === 'closed' ? colors.primary.main : colors.text.secondary,
                  borderBottom: campaignTab === 'closed' ? `2px solid ${colors.primary.main}` : 'none',
                  marginBottom: '-2px',
                  cursor: 'pointer',
                }}
              >
                Closed Campaign
              </button>
            </div>

            {/* Campaign Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {isLoadingBrandCampaigns ? (
                <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'Poppins', color: colors.text.secondary }}>
                  Loading campaigns...
                </div>
              ) : brandCampaigns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'Poppins', color: colors.text.secondary }}>
                  No campaigns found
                </div>
              ) : brandCampaigns.filter(c => c._id !== id && (
                    campaignTab === 'active' 
                      ? (c.status === 'active' || !c.status)
                      : (c.status === 'completed' || c.status === 'closed')
                  )).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'Poppins', color: colors.text.secondary }}>
                  No {campaignTab} campaigns found
                </div>
              ) : (
                brandCampaigns
                  .filter(c => c._id !== id && (
                    campaignTab === 'active' 
                      ? (c.status === 'active' || !c.status)
                      : (c.status === 'completed' || c.status === 'closed')
                  ))
                  .slice(0, 10)
                  .map((camp) => {
                const briefDesc = camp.description 
                  ? (camp.description.length > 150 
                      ? camp.description.substring(0, 150) + '...' 
                      : camp.description)
                  : '';
                
                return (
                  <div
                    key={camp._id}
                    style={{
                      border: `1px solid ${colors.border.light}`,
                      borderRadius: '8px',
                      padding: '20px',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/${baseRoute}/campaigns/${camp._id}`)}
                  >
                    <h3
                      style={{
                        fontFamily: 'Poppins',
                        fontSize: '18px',
                        fontWeight: 600,
                        color: colors.text.primary,
                        margin: '0 0 12px 0',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                      }}
                    >
                      {camp.name}
                    </h3>
                    
                    <p
                      style={{
                        fontFamily: 'Poppins',
                        fontSize: '14px',
                        color: colors.text.secondary,
                        lineHeight: '1.6',
                        margin: '0 0 12px 0',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                      }}
                    >
                      {briefDesc}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                      {camp.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 600 }}>
                            Location:
                          </span>
                          <img src={LocationIcon} alt="Location" style={{ width: '16px', height: '16px' }} />
                          <span style={{ fontFamily: 'Poppins', fontSize: '14px', color: colors.text.secondary }}>
                            {camp.location}
                          </span>
                        </div>
                      )}

                      {camp.budget && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 600 }}>Budget:</span>
                          <span style={{ fontFamily: 'Poppins', fontSize: '14px', color: colors.text.secondary }}>
                            ₹ {camp.budget.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {camp.platforms && camp.platforms.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 600 }}>Post on:</span>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {camp.platforms.map((platform) => (
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
                );
              })
              )}
            </div>
          </div>
        )}

        {/* Similar Campaigns Section - Only show for influencers */}
        {!isBrand && (
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
                      onClick={() => {
                        const route = location.pathname.split('/')[1] || 'influencer';
                        navigate(`/${route}/campaigns/${simCampaign._id}`);
                      }}
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
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
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
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
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

                      <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const campaignId = simCampaign._id;
                            const isCurrentlySaved = savedSimilarCampaigns.has(campaignId);
                            
                            try {
                              // Optimistic update
                              setSavedSimilarCampaigns((prev) => {
                                const newSet = new Set(prev);
                                if (isCurrentlySaved) {
                                  newSet.delete(campaignId);
                                } else {
                                  newSet.add(campaignId);
                                }
                                return newSet;
                              });
                              
                              // Make API call
                              if (isCurrentlySaved) {
                                await savedCampaignService.unsaveCampaign(campaignId);
                                toastService.success('Campaign removed from saved');
                              } else {
                                await savedCampaignService.saveCampaign(campaignId);
                                toastService.success('Campaign saved');
                              }
                            } catch (error: any) {
                              console.error('Failed to toggle save:', error);
                              // Revert on error
                              setSavedSimilarCampaigns((prev) => {
                                const newSet = new Set(prev);
                                if (isCurrentlySaved) {
                                  newSet.add(campaignId);
                                } else {
                                  newSet.delete(campaignId);
                                }
                                return newSet;
                              });
                              toastService.error(error.message || 'Failed to save campaign');
                            }
                          }}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            border: `1px solid ${savedSimilarCampaigns.has(simCampaign._id) ? colors.red.main : colors.border.light}`,
                            backgroundColor: colors.primary.white,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = colors.red.main;
                          }}
                          onMouseLeave={(e) => {
                            if (!savedSimilarCampaigns.has(simCampaign._id)) {
                              e.currentTarget.style.borderColor = colors.border.light;
                            }
                          }}
                        >
                          <img
                            src={FavoriteIcon}
                            alt="Save"
                            style={{ 
                              width: '20px', 
                              height: '20px', 
                              filter: savedSimilarCampaigns.has(simCampaign._id) ? 'none' : 'grayscale(100%)',
                              opacity: savedSimilarCampaigns.has(simCampaign._id) ? 1 : 0.6,
                            }}
                          />
                        </button>

                        <Button
                          variant="filled"
                          onClick={(e) => {
                            e.stopPropagation();
                            const baseRoute = location.pathname.split('/')[1] || 'influencer';
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
        )}
      </div>

      {/* Edit Modals - Only for brands */}
      {isBrand && (
        <>
          <EditName
            isOpen={showEditName}
            onClose={() => setShowEditName(false)}
            initialValue={campaign.campaignName}
            onSave={handleSaveName}
          />

          <EditDescription
            isOpen={showEditDescription}
            onClose={() => setShowEditDescription(false)}
            initialValue={campaign.description}
            onSave={handleSaveDescription}
          />

          <EditTags
            isOpen={showEditTags}
            onClose={() => setShowEditTags(false)}
            initialTags={campaign.tags}
            suggestedTags={[]}
            maxTags={10}
            onSave={handleSaveTags}
          />

          {/* Simple Edit Platforms Modal */}
          {showEditPlatforms && (
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
              onClick={() => setShowEditPlatforms(false)}
            >
              <div
                style={{
                  backgroundColor: colors.primary.white,
                  borderRadius: '8px',
                  padding: '32px',
                  maxWidth: '500px',
                  width: '90%',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2
                  style={{
                    fontFamily: 'Poppins',
                    fontSize: '20px',
                    fontWeight: 600,
                    marginBottom: '16px',
                  }}
                >
                  Edit Platforms
                </h2>
                <p style={{ fontFamily: 'Poppins', fontSize: '14px', color: colors.text.secondary, marginBottom: '16px' }}>
                  Please edit platforms on the full edit page.
                </p>
                <button
                  onClick={() => {
                    setShowEditPlatforms(false);
                    navigate(`/${baseRoute}/campaigns/create?edit=${id}`);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: colors.primary.main,
                    color: colors.primary.white,
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontFamily: 'Poppins',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  Go to Edit Page
                </button>
              </div>
            </div>
          )}

          {/* Edit Attachments Modal */}
          {showEditAttachments && campaign && apiCampaign && (
            <EditAttachmentsModal
              campaign={apiCampaign}
              onClose={() => setShowEditAttachments(false)}
              onSave={async (updatedAttachments, newFiles) => {
                try {
                  await campaignService.updateCampaign(apiCampaign._id, {
                    attachments: updatedAttachments,
                  }, newFiles && newFiles.length > 0 ? newFiles : undefined);
                  toastService.success('Attachments updated successfully');
                  setShowEditAttachments(false);
                  // Refetch campaign data
                  if (id) {
                    await campaignService.getCampaignById(id);
                    // Update local campaign state if needed
                    window.location.reload(); // Simple refresh to show updated data
                  }
                } catch (error: any) {
                  toastService.error(error.message || 'Failed to update attachments');
                }
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

