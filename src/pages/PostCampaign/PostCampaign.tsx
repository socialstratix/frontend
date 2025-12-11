import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { Input } from '../../components/atoms/Input';
import { Textarea } from '../../components/atoms/Textarea';
import { Button } from '../../components/atoms/Button';
import { useCampaign } from '../../hooks/useCampaign';
import { useAuth } from '../../contexts/AuthContext';
import { useBrand } from '../../hooks/useBrand';
import {
    YouTubeIcon,
    FacebookIcon,
    InstagramIcon,
    TikTokIcon,
    XIcon,
    AttachFileIcon,
    CheckSelectedIcon,
} from '../../assets/icons';

export const PostCampaign: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editCampaignId = searchParams.get('edit');
    const isEditMode = !!editCampaignId;
    
    const { user } = useAuth();
    const { brand, isLoading: isLoadingBrand } = useBrand({
        userId: user?.userType === 'brand' ? user?.id : undefined,
        autoFetch: user?.userType === 'brand' && !!user?.id,
    });
    const { campaign, createCampaign, updateCampaign, isLoading: isCampaignLoading, error: campaignError } = useCampaign({
        campaignId: editCampaignId || undefined,
        autoFetch: isEditMode && !!editCampaignId,
    });
    
    const [campaignName, setCampaignName] = useState('');
    const [campaignDescription, setCampaignDescription] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['youtube', 'facebook']);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [campaignBudget, setCampaignBudget] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Populate form fields when campaign data is loaded (edit mode)
    useEffect(() => {
        if (campaign && isEditMode) {
            setCampaignName(campaign.name || '');
            setCampaignDescription(campaign.description || '');
            setSelectedPlatforms(campaign.platforms || []);
            setTags(campaign.tags || []);
            setCampaignBudget(campaign.budget?.toString() || '');
        }
    }, [campaign, isEditMode]);

    const platforms = [
        { id: 'youtube', name: 'YouTube', icon: YouTubeIcon, color: '#FF0000' },
        { id: 'facebook', name: 'Facebook', icon: FacebookIcon, color: '#1877F2' },
        { id: 'instagram', name: 'Instagram', icon: InstagramIcon, color: '#E4405F' },
        { id: 'tiktok', name: 'TikTok', icon: TikTokIcon, color: '#000000' },
        { id: 'x', name: 'X', icon: XIcon, color: '#000000' },
    ];

    const togglePlatform = (platformId: string) => {
        setSelectedPlatforms((prev) =>
            prev.includes(platformId)
                ? prev.filter((p) => p !== platformId)
                : [...prev, platformId]
        );
    };

    const handleAddTag = (e?: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e && e.key !== 'Enter') return;
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };


    const handlePostCampaign = async () => {
        setError(null);

        // Validate form
        if (!campaignName.trim()) {
            setError('Campaign name is required');
            return;
        }

        if (!campaignDescription.trim()) {
            setError('Campaign description is required');
            return;
        }

        if (selectedPlatforms.length === 0) {
            setError('Please select at least one platform');
            return;
        }

        if (!campaignBudget.trim()) {
            setError('Campaign budget is required');
            return;
        }

        const budgetNum = Number(campaignBudget);
        if (isNaN(budgetNum) || budgetNum < 0) {
            setError('Budget must be a valid number greater than or equal to 0');
            return;
        }

        // Check if brand exists
        if (!brand || !brand._id) {
            setError('Brand profile not found. Please complete your brand profile first.');
            return;
        }

        try {
            if (isEditMode && editCampaignId) {
                // Update existing campaign
                const updateData = {
                    name: campaignName.trim(),
                    description: campaignDescription.trim(),
                    budget: budgetNum,
                    platforms: selectedPlatforms,
                    tags: tags.filter(tag => tag.trim() !== ''),
                };

                await updateCampaign(editCampaignId, updateData);

                // Navigate to brand profile to see the updated campaign
                if (brand && brand._id) {
                    navigate(`/brand/brand/${brand._id}`);
                } else if (user?.id) {
                    navigate(`/brand/brand/${user.id}`);
                } else {
                    navigate('/brand');
                }
            } else {
                // Create new campaign
                const campaignData = {
                    brandId: brand._id,
                    name: campaignName.trim(),
                    description: campaignDescription.trim(),
                    budget: budgetNum,
                    platforms: selectedPlatforms,
                    tags: tags.filter(tag => tag.trim() !== ''),
                };

                await createCampaign(campaignData);

                // Navigate to brand profile to see the newly created campaign
                if (brand && brand._id) {
                    navigate(`/brand/brand/${brand._id}`);
                } else if (user?.id) {
                    navigate(`/brand/brand/${user.id}`);
                } else {
                    navigate('/brand');
                }
            }
        } catch (err: any) {
            setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} campaign. Please try again.`);
        }
    };

    const isStep1Valid = campaignName.trim() !== '' && campaignDescription.trim() !== '' && selectedPlatforms.length > 0;
    const isStep2Valid = campaignBudget.trim() !== '' && !isNaN(Number(campaignBudget)) && Number(campaignBudget) >= 0;
    const isLoading = isCampaignLoading || isLoadingBrand;
    const displayError = error || campaignError;

    return (
        <div
            style={{
                minHeight: '100vh',
                padding: '40px',
                background: 'linear-gradient(135deg, rgba(235, 188, 254, 0.3) 0%, rgba(240, 196, 105, 0.3) 100%)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
            }}
        >
            <div
                style={{
                    width: '888px',
                    paddingTop: '16px',
                    paddingRight: '32px',
                    paddingBottom: '16px',
                    paddingLeft: '32px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 1)',
                    opacity: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '32px',
                    overflow: 'auto',
                }}
            >
                {/* Step 1: Campaign details */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px',
                    }}
                >
                    {/* Step Header */}
                    <div
                        style={{
                            width: '800px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            paddingTop: '16px',
                            paddingBottom: '16px',
                            opacity: 1,
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    borderWidth: '1px',
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(30, 0, 43, 1)',
                                    border: '1px solid rgba(219, 148, 0, 1)',
                                    opacity: 1,
                                    color: colors.primary.white,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                }}
                            >
                                1
                            </div>
                            <h2
                                style={{
                                    width: '100%',
                                    fontFamily: 'Poppins',
                                    fontWeight: 400,
                                    fontStyle: 'normal',
                                    fontSize: '14px',
                                    lineHeight: '100%',
                                    letterSpacing: '0%',
                                    // background: 'rgba(43, 43, 43, 1)',
                                    opacity: 1,
                                    color: colors.text.primary,
                                    margin: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0 8px',
                                }}
                            >
                                Campaign details
                            </h2>
                        </div>
                        <hr className='border-t-1 border-gray-300' style={{ marginBottom: '12px' }} />
                        <p
                            style={{
                                width: '800px',
                                fontFamily: 'Poppins',
                                fontWeight: 400,
                                fontStyle: 'normal',
                                fontSize: '14px',
                                lineHeight: '1.5',
                                letterSpacing: '0%',
                                color: 'rgba(103, 103, 103, 1)',
                                opacity: 1,
                                margin: 0,
                                marginTop: '8px',
                            }}
                        >
                            Share details about the influencers you'd like to target. We'll gather campaign specifics, including content needs and product descriptions, once your targeting is set.
                        </p>
                    </div>

                    {/* Campaign Name */}
                    <div>
                        <h3
                            style={{
                                ...typography.heading,
                                margin: 0,
                                marginBottom: '8px',
                            }}
                        >
                            What is the Campaign name?
                            <span style={{ color: colors.red.main, marginLeft: '4px' }}>*</span>
                        </h3>
                        <Input
                            label="Campaign name"
                            placeholder="Campaign name"
                            value={campaignName}
                            onChange={(e) => setCampaignName(e.target.value)}

                            variant="floating"
                        />
                    </div>

                    {/* Campaign Description */}
                    <div>
                        <h3
                            style={{
                                width: '800px',
                                ...typography.heading,
                                margin: 0,
                                marginBottom: '8px',
                            }}
                        >
                            Write description of the Campaign?
                            <span style={{ color: colors.red.main, marginLeft: '4px' }}>*</span>
                        </h3>
                        <Textarea

                            placeholder="Description"
                            value={campaignDescription}
                            onChange={(e) => setCampaignDescription(e.target.value)}
                            variant="custom"
                        />
                    </div>

                    {/* Platform Selection */}
                    <div>
                        <h3
                            style={{
                                width: '800px',
                                ...typography.heading,
                                margin: 0,
                                marginBottom: '12px',
                            }}
                        >
                            Where Campaign?
                            <span style={{ color: colors.red.main, marginLeft: '4px' }}>*</span>
                        </h3>
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '12px',
                            }}
                        >
                            {platforms.map((platform) => {
                                const isSelected = selectedPlatforms.includes(platform.id);
                                return (
                                    <button
                                        key={platform.id}
                                        onClick={() => togglePlatform(platform.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            height: '32px',
                                            padding: '0 12px',
                                            backgroundColor: 'rgba(255, 255, 255, 1)',
                                            color: colors.text.primary,
                                            border: `1px solid ${platform.color}`,
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '14px',
                                            fontWeight: 400,
                                            position: 'relative',
                                            justifyContent: 'space-between',
                                            opacity: 1,
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <img
                                                src={platform.icon}
                                                alt={platform.name}
                                                style={{ width: '20px', height: '20px' }}
                                            />
                                            <span>{platform.name}</span>
                                        </div>
                                        {isSelected && (
                                            <img
                                                src={CheckSelectedIcon}
                                                alt="Selected"
                                                style={{ width: '20px', height: '20px' }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <h3
                            style={{
                                width: '800px',
                                ...typography.heading,
                                margin: 0,
                                marginBottom: '8px',
                            }}
                        >
                            Add tags
                        </h3>

                        <Textarea
                            placeholder="Type a tag and press Enter"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddTag(e);
                                }
                            }}
                            variant="custom"
                        />
                        {tags.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                                {tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '4px 12px',
                                            backgroundColor: colors.secondary.light,
                                            borderRadius: '16px',
                                            fontFamily: 'Poppins',
                                            fontSize: '14px',
                                            color: colors.text.primary,
                                        }}
                                    >
                                        {tag}
                                        <button
                                            onClick={() => handleRemoveTag(tag)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '16px',
                                                color: colors.text.secondary,
                                                padding: 0,
                                                lineHeight: 1,
                                            }}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Attachments */}
                    <div>
                        <h3
                            style={{
                                width: '800px',
                                ...typography.heading,
                                margin: 0,
                                marginBottom: '12px',
                            }}
                        >
                            Add Attachments
                        </h3>
                        <div
                            style={{
                                width: '800px',
                                display: 'flex',
                                gap: '8px',
                                opacity: 1,
                            }}
                        >
                            {[1, 2, 3].map((index) => (
                                <button
                                    key={index}
                                    style={{
                                        width: '261.33px',
                                        height: '56px',
                                        borderWidth: '1px',
                                        border: '1px solid rgba(117, 80, 2, 1)',
                                        borderRadius: '4px',
                                        opacity: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '0 16px',
                                        backgroundColor: colors.primary.white,
                                        cursor: 'pointer',
                                        fontFamily: 'Poppins, sans-serif',
                                        fontSize: '14px',
                                        color: colors.text.primary,
                                    }}
                                >
                                    <img
                                        src={AttachFileIcon}
                                        alt="Attach"
                                        style={{ width: '20px', height: '20px' }}
                                    />
                                    Attach files
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error Message */}
                    {displayError && (
                        <div
                            style={{
                                padding: '12px 16px',
                                backgroundColor: '#fee',
                                border: `1px solid ${colors.red.main}`,
                                borderRadius: '8px',
                                color: colors.red.main,
                                fontFamily: 'Poppins',
                                fontSize: '14px',
                            }}
                        >
                            {displayError}
                        </div>
                    )}

                    {/* NEXT Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                        <Button
                            variant="filled"
                            onClick={() => {
                                const step2Element = document.getElementById('step-2');
                                if (step2Element) {
                                    step2Element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            }}
                            disabled={!isStep1Valid || isLoading}
                            style={{
                                minWidth: '120px',
                                height: '48px',
                                backgroundColor: !isStep1Valid || isLoading ? colors.grey.disabled : undefined,
                                color: !isStep1Valid || isLoading ? colors.text.secondary : undefined,
                            }}
                        >
                            {isLoading ? 'LOADING...' : 'NEXT'}
                        </Button>
                    </div>
                </div>

                {/* Step 2: Pricing details */}
                <div
                    id="step-2"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px',
                        marginTop: '32px',
                        paddingTop: '32px',
                        borderTop: '1px solid #E0E0E0',
                    }}
                >
                    {/* Step Header */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    borderWidth: '1px',
                                    borderRadius: '12px',
                                    background: 'rgba(240, 226, 196, 1)',
                                    border: '1px solid rgba(219, 148, 0, 1)',
                                    opacity: 1,
                                    color: colors.text.primary,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                }}
                            >
                                2
                            </div>
                            <h2
                                style={{
                                    width: '100%',
                                    fontFamily: 'Poppins',
                                    fontWeight: 400,
                                    fontStyle: 'normal',
                                    fontSize: '14px',
                                    lineHeight: '100%',
                                    letterSpacing: '0%',
                                    // background: 'rgba(43, 43, 43, 1)',
                                    opacity: 1,
                                    color: colors.text.primary,
                                    margin: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0 8px',
                                }}
                            >
                                Pricing details
                            </h2>
                        </div>
                        <hr className='border-t-1 border-gray-300' style={{ marginBottom: '12px' }} />
                        <p
                            style={{
                                width: '800px',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '14px',
                                lineHeight: '1.5',
                                color: 'rgba(103, 103, 103, 1)',
                                margin: 0,
                                marginTop: '8px',
                            }}
                        >
                            Provide your pricing details, and estimate costs based on your campaign goals and influencer reach. Get a clear breakdown to align with your targeting strategy.
                        </p>
                    </div>

                    {/* Campaign Budget */}
                    <div>
                        <h3
                            style={{
                                width: '800px',
                                ...typography.heading,
                                margin: 0,
                                marginBottom: '8px',
                            }}
                        >
                            What is the Campaign budget?
                            <span style={{ color: colors.red.main, marginLeft: '4px' }}>*</span>
                        </h3>
                        <Input
                            label="Campaign budget"
                            placeholder="Campaign budget"
                            value={campaignBudget}
                            onChange={(e) => setCampaignBudget(e.target.value)}
                            required
                            variant="floating"
                        />
                    </div>


                </div>

                {/* Error Message */}
                {displayError && (
                    <div
                        style={{
                            padding: '12px 16px',
                            backgroundColor: '#fee',
                            border: `1px solid ${colors.red.main}`,
                            borderRadius: '8px',
                            color: colors.red.main,
                            fontFamily: 'Poppins',
                            fontSize: '14px',
                        }}
                    >
                        {displayError}
                    </div>
                )}

                {/* POST/UPDATE CAMPAIGN Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <Button
                        variant="filled"
                        onClick={handlePostCampaign}
                        disabled={(!isStep1Valid || !isStep2Valid) || isLoading}
                        style={{
                            minWidth: '160px',
                            height: '48px',
                            backgroundColor: (!isStep1Valid || !isStep2Valid) || isLoading ? colors.grey.disabled : undefined,
                            color: (!isStep1Valid || !isStep2Valid) || isLoading ? colors.text.secondary : undefined,
                        }}
                    >
                        {isLoading 
                            ? (isEditMode ? 'UPDATING...' : 'POSTING...') 
                            : (isEditMode ? 'UPDATE CAMPAIGN' : 'POST CAMPAIGN')}
                    </Button>
                </div>
            </div>

        </div>
    );
};

