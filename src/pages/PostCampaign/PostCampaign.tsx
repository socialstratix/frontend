import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { INFLUENCER_TAGS } from '../../constants/tags';
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
    CheckIcon,
} from '../../assets/icons';
import { postCampaignSchema } from '../../utils/validationSchemas';
import type { PostCampaignFormData } from '../../utils/validationSchemas';

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
    
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [attachments, setAttachments] = useState<File[]>([]);
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        trigger,
    } = useForm<PostCampaignFormData>({
        resolver: zodResolver(postCampaignSchema),
        mode: 'onBlur',
        defaultValues: {
            campaignName: '',
            campaignDescription: '',
            selectedPlatforms: ['youtube', 'facebook'],
            tags: [],
            campaignBudget: '',
        },
    });
    
    const selectedPlatforms = watch('selectedPlatforms') || [];

    // Populate form fields when campaign data is loaded (edit mode)
    useEffect(() => {
        if (campaign && isEditMode) {
            setValue('campaignName', campaign.name || '');
            setValue('campaignDescription', campaign.description || '');
            setValue('selectedPlatforms', campaign.platforms || []);
            setTags(campaign.tags || []);
            setValue('tags', campaign.tags || []);
            setValue('campaignBudget', campaign.budget?.toString() || '');
        }
    }, [campaign, isEditMode, setValue]);

    const platforms = [
        { id: 'youtube', name: 'YouTube', icon: YouTubeIcon, color: '#FF0000' },
        { id: 'facebook', name: 'Facebook', icon: FacebookIcon, color: '#1877F2' },
        { id: 'instagram', name: 'Instagram', icon: InstagramIcon, color: '#E4405F' },
        { id: 'tiktok', name: 'TikTok', icon: TikTokIcon, color: '#000000' },
        { id: 'x', name: 'X', icon: XIcon, color: '#000000' },
    ];

    const togglePlatform = (platformId: string) => {
        const currentPlatforms = watch('selectedPlatforms') || [];
        const newPlatforms = currentPlatforms.includes(platformId)
            ? currentPlatforms.filter((p) => p !== platformId)
            : [...currentPlatforms, platformId];
        setValue('selectedPlatforms', newPlatforms);
        trigger('selectedPlatforms');
    };

    const handleAddTag = (e?: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e && e.key !== 'Enter') return;
        // Parse comma-separated tags from input
        const inputTags = tagInput.split(',').map(tag => tag.trim()).filter(tag => tag && !tags.includes(tag));
        if (inputTags.length > 0) {
            const newTags = [...tags, ...inputTags];
            setTags(newTags);
            setValue('tags', newTags);
            setTagInput(newTags.join(', '));
        } else if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            const newTags = [...tags, tagInput.trim()];
            setTags(newTags);
            setValue('tags', newTags);
            setTagInput(newTags.join(', '));
        }
    };

    const handleAddTagFromSuggestion = (tag: string) => {
        if (!tags.includes(tag)) {
            const newTags = [...tags, tag];
            setTags(newTags);
            setValue('tags', newTags);
            setTagInput(newTags.join(', '));
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        const newTags = tags.filter((tag) => tag !== tagToRemove);
        setTags(newTags);
        setValue('tags', newTags);
        setTagInput(newTags.join(', '));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const maxFiles = 5;
        const currentCount = attachments.length;
        const remainingSlots = maxFiles - currentCount;

        if (remainingSlots <= 0) {
            setError(`Maximum ${maxFiles} attachments allowed. Please remove some files first.`);
            e.target.value = '';
            return;
        }

        const validFiles: File[] = [];
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
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
            // Check file type
            if (!allowedTypes.includes(file.type)) {
                setError(`File "${file.name}" is not a valid format. Please upload PDF, Word, or Image files.`);
                return;
            }

            // Check file size
            if (file.size > maxSize) {
                setError(`File "${file.name}" exceeds 5MB. Please upload a smaller file.`);
                return;
            }

            validFiles.push(file);
        });

        if (validFiles.length > 0) {
            setAttachments((prev) => {
                const newAttachments = [...prev, ...validFiles];
                if (newAttachments.length > maxFiles) {
                    setError(`Maximum ${maxFiles} attachments allowed. Only the first ${maxFiles} files were added.`);
                    return newAttachments.slice(0, maxFiles);
                }
                return newAttachments;
            });
            setError(null);
        }

        // Reset input
        e.target.value = '';
    };

    const handleRemoveAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
        setError(null);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const onSubmit = async (data: PostCampaignFormData) => {
        setError(null);

        // Check if brand exists
        if (!brand || !brand._id) {
            setError('Brand profile not found. Please complete your brand profile first.');
            return;
        }

        const budgetNum = Number(data.campaignBudget);

        try {
            if (isEditMode && editCampaignId) {
                // Update existing campaign
                const updateData = {
                    name: data.campaignName.trim(),
                    description: data.campaignDescription.trim(),
                    budget: budgetNum,
                    platforms: data.selectedPlatforms,
                    tags: tags.filter(tag => tag.trim() !== ''),
                };

                await updateCampaign(editCampaignId, updateData, attachments.length > 0 ? attachments : undefined);

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
                    name: data.campaignName.trim(),
                    description: data.campaignDescription.trim(),
                    budget: budgetNum,
                    platforms: data.selectedPlatforms,
                    tags: tags.filter(tag => tag.trim() !== ''),
                };

                await createCampaign(campaignData, attachments.length > 0 ? attachments : undefined);

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

    const campaignName = watch('campaignName') || '';
    const campaignDescription = watch('campaignDescription') || '';
    const campaignBudget = watch('campaignBudget') || '';
    
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
                            variant="floating"
                            error={errors.campaignName?.message}
                            {...register('campaignName')}
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
                            variant="custom"
                            error={errors.campaignDescription?.message}
                            {...register('campaignDescription')}
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
                        {errors.selectedPlatforms && (
                            <p style={{ color: colors.red.main, fontSize: '12px', marginTop: '8px', fontFamily: 'Poppins, sans-serif' }}>
                                {errors.selectedPlatforms.message}
                            </p>
                        )}
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
                            placeholder="Selected tags will appear here"
                            value={tags.length > 0 ? tags.join(', ') : tagInput}
                            onChange={(e) => {
                                // Allow manual editing, but sync with tags when user types
                                setTagInput(e.target.value);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddTag(e);
                                }
                            }}
                            variant="custom"
                        />
                        
                        {/* Tags Display - Scrollable with all tags */}
                        <div 
                            style={{ 
                                maxHeight: '200px',
                                overflowY: 'auto',
                                overflowX: 'hidden',
                                marginTop: '16px',
                                padding: '4px',
                                scrollbarWidth: 'thin',
                                scrollbarColor: `${colors.primary.main || '#783C91'} ${colors.secondary.light || '#F5F0F8'}`,
                            }}
                        >
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {INFLUENCER_TAGS.map((tag, index) => {
                                    const isSelected = tags.includes(tag);
                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => {
                                                if (isSelected) {
                                                    handleRemoveTag(tag);
                                                } else {
                                                    handleAddTagFromSuggestion(tag);
                                                }
                                            }}
                                            style={{
                                                padding: '8px 16px',
                                                backgroundColor: isSelected 
                                                    ? (colors.primary.main || '#783C91')
                                                    : (colors.grey.light || '#E0E0E0'),
                                                borderRadius: '20px',
                                                border: 'none',
                                                fontFamily: 'Poppins, sans-serif',
                                                fontSize: '14px',
                                                color: isSelected 
                                                    ? '#FFFFFF'
                                                    : (colors.text.secondary || '#676767'),
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = isSelected
                                                    ? (colors.primary.dark || '#3F214C')
                                                    : (colors.primary.main || '#783C91');
                                                e.currentTarget.style.color = '#FFFFFF';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = isSelected
                                                    ? (colors.primary.main || '#783C91')
                                                    : (colors.grey.light || '#E0E0E0');
                                                e.currentTarget.style.color = isSelected
                                                    ? '#FFFFFF'
                                                    : (colors.text.secondary || '#676767');
                                            }}
                                        >
                                            {isSelected && (
                                                <img 
                                                    src={CheckIcon} 
                                                    alt="Selected" 
                                                    style={{ 
                                                        width: '14px', 
                                                        height: '14px',
                                                        filter: 'brightness(0) invert(1)'
                                                    }} 
                                                />
                                            )}
                                            {tag}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Attachments */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <h3
                                style={{
                                    width: 'auto',
                                    ...typography.heading,
                                    margin: 0,
                                }}
                            >
                                Add Attachments
                            </h3>
                            <span style={{ 
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '14px',
                                color: colors.text.secondary,
                            }}>
                                {attachments.length}/5 attachments
                            </span>
                        </div>
                        <input
                            type="file"
                            id="file-upload"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                            multiple
                            onChange={handleFileChange}
                            disabled={attachments.length >= 5}
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="file-upload">
                            <div
                                style={{
                                    width: '800px',
                                    height: '56px',
                                    borderWidth: '1px',
                                    border: '1px solid rgba(117, 80, 2, 1)',
                                    borderRadius: '4px',
                                    opacity: attachments.length >= 5 ? 0.6 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '0 16px',
                                    backgroundColor: colors.primary.white,
                                    cursor: attachments.length >= 5 ? 'not-allowed' : 'pointer',
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
                                {attachments.length >= 5 
                                    ? 'Maximum 5 attachments reached' 
                                    : 'Attach files (PDF, Word, Images)'}
                            </div>
                        </label>
                        
                        {/* Selected Files List */}
                        {attachments.length > 0 && (
                            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {attachments.map((file, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '8px 12px',
                                            backgroundColor: colors.primary.white,
                                            border: `1px solid ${colors.border.light}`,
                                            borderRadius: '4px',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '14px',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                                            <img
                                                src={AttachFileIcon}
                                                alt="File"
                                                style={{ width: '16px', height: '16px', flexShrink: 0 }}
                                            />
                                            <span style={{ 
                                                color: colors.text.primary,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {file.name}
                                            </span>
                                            <span style={{ 
                                                color: colors.text.secondary,
                                                fontSize: '12px',
                                                flexShrink: 0,
                                            }}>
                                                ({formatFileSize(file.size)})
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
                                                flexShrink: 0,
                                            }}
                                            aria-label="Remove file"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
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
                            variant="floating"
                            error={errors.campaignBudget?.message}
                            {...register('campaignBudget')}
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
                        onClick={handleSubmit(onSubmit)}
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

