import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { colors } from '../../constants/colors';
import { 
  InstagramIcon, 
  FacebookIcon, 
  TikTokIcon, 
  XIcon, 
  YouTubeIcon,
  BackwardIcon
} from '../../assets/icons';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import {
  onboardingStep1Schema,
  onboardingStep2Schema,
  onboardingStep3Schema,
  onboardingStep4Schema,
} from '../../utils/validationSchemas';
import type {
  OnboardingStep1Data,
  OnboardingStep2Data,
  OnboardingStep3Data,
  OnboardingStep4Data,
} from '../../utils/validationSchemas';
import InfluencerDescriptionImg from '../../assets/images/illustrations/InfluenerDes.png';
import TagsInfluencerImg from '../../assets/images/illustrations/TagsInfuencer.png';

interface OnboardingFormProps {
  onComplete?: () => void;
}

export const OnboardingForm: React.FC<OnboardingFormProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Question 3 - Tags (kept as state since it's a dynamic array)
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Question 5 - Profile pic
  const [, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string>('');
  
  // Form hooks for each step
  const step1Form = useForm<OnboardingStep1Data>({
    resolver: zodResolver(onboardingStep1Schema),
    mode: 'onBlur',
    defaultValues: {
      country: '',
      mobile: '',
      state: '',
      pincode: '',
      city: '',
      address: '',
    },
  });
  
  const step2Form = useForm<OnboardingStep2Data>({
    resolver: zodResolver(onboardingStep2Schema),
    mode: 'onBlur',
    defaultValues: {
      influencerDescription: '',
    },
  });
  
  const step3Form = useForm<OnboardingStep3Data>({
    resolver: zodResolver(onboardingStep3Schema),
    mode: 'onBlur',
    defaultValues: {
      tags: [],
    },
  });
  
  const step4Form = useForm<OnboardingStep4Data>({
    resolver: zodResolver(onboardingStep4Schema),
    mode: 'onBlur',
    defaultValues: {
      instagram: '',
      facebook: '',
      tiktok: '',
      x: '',
      youtube: '',
    },
  });

  const handleNext = async () => {
    let isValid = false;

    // Validate current step before proceeding
    if (currentStep === 1) {
      isValid = await step1Form.trigger();
    } else if (currentStep === 2) {
      isValid = await step2Form.trigger();
    } else if (currentStep === 3) {
      step3Form.setValue('tags', tags);
      isValid = await step3Form.trigger();
    } else if (currentStep === 4) {
      isValid = await step4Form.trigger();
    } else if (currentStep === 5) {
      // Step 5 is optional (profile pic)
      isValid = true;
    }

    if (!isValid) {
      return;
    }

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit onboarding data to backend
      await handleSubmitOnboarding();
    }
  };

  const handleSubmitOnboarding = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Get data from all steps
      const step1Data = step1Form.getValues();
      const step2Data = step2Form.getValues();
      const step4Data = step4Form.getValues();

      // Prepare social media data
      const socialMedia = [];
      if (step4Data.instagram) {
        socialMedia.push({
          platform: 'instagram' as const,
          username: step4Data.instagram,
          profileUrl: `https://instagram.com/${step4Data.instagram}`,
        });
      }
      if (step4Data.facebook) {
        socialMedia.push({
          platform: 'facebook' as const,
          username: step4Data.facebook,
          profileUrl: `https://facebook.com/${step4Data.facebook}`,
        });
      }
      if (step4Data.tiktok) {
        socialMedia.push({
          platform: 'tiktok' as const,
          username: step4Data.tiktok,
          profileUrl: `https://tiktok.com/@${step4Data.tiktok}`,
        });
      }
      if (step4Data.x) {
        socialMedia.push({
          platform: 'x' as const,
          username: step4Data.x,
          profileUrl: `https://x.com/${step4Data.x}`,
        });
      }
      if (step4Data.youtube) {
        socialMedia.push({
          platform: 'youtube' as const,
          username: step4Data.youtube,
          profileUrl: `https://youtube.com/@${step4Data.youtube}`,
        });
      }

      // Prepare onboarding data
      const onboardingData = {
        location: {
          country: step1Data.country,
          mobile: step1Data.mobile,
          state: step1Data.state,
          pincode: step1Data.pincode,
          city: step1Data.city,
          address: step1Data.address,
        },
        description: step2Data.influencerDescription,
        tags,
        socialMedia,
        profileImage: profilePicPreview, // Base64 encoded image
      };

      // Submit to backend
      await apiService.post('/onboarding/influencer', onboardingData);

      // Complete onboarding
      onComplete?.();
      
      // Redirect based on user type
      if (user?.userType === 'influencer') {
        navigate('/influencer');
      } else if (user?.userType === 'brand') {
        navigate('/brand');
      } else {
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete onboarding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePic(file); // Store file for upload later
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h2 
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                fontSize: '20px',
                lineHeight: '100%',
                color: colors.text.primary,
                marginBottom: '24px'
              }}
            >
              Where are you from?
            </h2>

            {/* Country Selector with Flag */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                {/* Country Code Dropdown with Flag */}
                <div style={{ position: 'relative', width: '100px', flexShrink: 0 }}>
                  <select
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '12px 28px 12px 10px',
                      border: `1px solid ${colors.border.purple}`,
                      borderRadius: '4px',
                      fontFamily: '"Segoe UI Emoji", "Noto Color Emoji", "Apple Color Emoji", Poppins, sans-serif',
                      fontSize: '16px',
                      backgroundColor: colors.primary.white,
                      cursor: 'pointer',
                      appearance: 'none',
                      lineHeight: '1',
                      overflow: 'hidden',
                      textOverflow: 'clip',
                      whiteSpace: 'nowrap',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="+91">🇮🇳 IN</option>
                    <option value="+1">🇺🇸 US</option>
                    <option value="+44">🇬🇧 UK</option>
                  </select>
                  <div style={{ 
                    position: 'absolute', 
                    right: '10px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    pointerEvents: 'none',
                    fontSize: '10px',
                    color: colors.text.secondary
                  }}>▼</div>
                </div>

                {/* Mobile Number Input */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Input
                    type="tel"
                    placeholder="10 digit mobile"
                    variant="default"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '14px',
                      border: `1px solid ${colors.border.purple}`,
                      borderRadius: '4px',
                      height: '48px',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                    error={step1Form.formState.errors.mobile?.message}
                    {...step1Form.register('mobile')}
                  />
                </div>
              </div>
            </div>

            {/* Select Country Dropdown */}
            <div style={{ marginBottom: '16px' }}>
              <select
                {...step1Form.register('country')}
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '12px',
                  border: `1px solid ${step1Form.formState.errors.country ? colors.red.main : colors.border.purple}`,
                  borderRadius: '4px',
                  fontFamily: '"Segoe UI Emoji", "Noto Color Emoji", "Apple Color Emoji", Poppins, sans-serif',
                  fontSize: '14px',
                  color: step1Form.watch('country') ? colors.text.primary : colors.text.secondary,
                  backgroundColor: colors.primary.white,
                  cursor: 'pointer',
                  lineHeight: '1.4',
                  overflow: 'hidden',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Select country</option>
                <option value="india">🇮🇳 India</option>
                <option value="usa">🇺🇸 United States</option>
                <option value="uk">🇬🇧 United Kingdom</option>
              </select>
              {step1Form.formState.errors.country && (
                <p style={{ color: colors.red.main, fontSize: '12px', marginTop: '4px', fontFamily: 'Poppins, sans-serif' }}>
                  {step1Form.formState.errors.country.message}
                </p>
              )}
            </div>

            {/* State Input */}
            <div style={{ marginBottom: '16px' }}>
              <Input
                type="text"
                placeholder="State"
                variant="default"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  border: `1px solid ${colors.border.purple}`,
                  borderRadius: '4px',
                  height: '48px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                error={step1Form.formState.errors.state?.message}
                {...step1Form.register('state')}
              />
            </div>

            {/* Pincode Input */}
            <div style={{ marginBottom: '16px' }}>
              <Input
                type="text"
                placeholder="Pincode"
                variant="default"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  border: `1px solid ${colors.border.purple}`,
                  borderRadius: '4px',
                  height: '48px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                error={step1Form.formState.errors.pincode?.message}
                {...step1Form.register('pincode')}
              />
            </div>

            {/* City Input */}
            <div style={{ marginBottom: '16px' }}>
              <Input
                type="text"
                placeholder="City"
                variant="default"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  border: `1px solid ${colors.border.purple}`,
                  borderRadius: '4px',
                  height: '48px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                error={step1Form.formState.errors.city?.message}
                {...step1Form.register('city')}
              />
            </div>

            {/* Address Textarea */}
            <div style={{ marginBottom: '24px' }}>
              <textarea
                placeholder="Address(optional)"
                {...step1Form.register('address')}
                style={{
                  width: '100%',
                  height: '80px',
                  padding: '12px',
                  border: `1px solid ${step1Form.formState.errors.address ? colors.red.main : colors.border.purple}`,
                  borderRadius: '4px',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  resize: 'none',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
              {step1Form.formState.errors.address && (
                <p style={{ color: colors.red.main, fontSize: '12px', marginTop: '4px', fontFamily: 'Poppins, sans-serif' }}>
                  {step1Form.formState.errors.address.message}
                </p>
              )}
            </div>
          </>
        );

      case 2:
        return (
          <>
            <h2 
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                fontSize: '20px',
                lineHeight: '130%',
                color: colors.text.primary,
                marginBottom: '8px'
              }}
            >
              Describe the kind of influencer you are
            </h2>
            <p 
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                color: colors.primary.main,
                marginBottom: '24px',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              View Example
            </p>

            {/* Description Input */}
            <textarea
              placeholder="Describe the kind of influencer you are (min 50 characters)"
              {...step2Form.register('influencerDescription')}
              style={{
                width: '100%',
                height: '56px',
                padding: '16px',
                border: `1px solid ${step2Form.formState.errors.influencerDescription ? colors.red.main : colors.border.light}`,
                borderRadius: '8px',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                resize: 'none',
                outline: 'none',
                marginBottom: step2Form.formState.errors.influencerDescription ? '8px' : '24px'
              }}
            />
            {step2Form.formState.errors.influencerDescription && (
              <p style={{ color: colors.red.main, fontSize: '12px', marginBottom: '24px', fontFamily: 'Poppins, sans-serif' }}>
                {step2Form.formState.errors.influencerDescription.message}
              </p>
            )}
          </>
        );

      case 3:
        return (
          <>
            <h2 
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                fontSize: '20px',
                lineHeight: '130%',
                color: colors.text.primary,
                marginBottom: '8px'
              }}
            >
              Add tags that clearly highlight your skills and expertise, making it easy for brands to understand you.
            </h2>
            <p 
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                color: colors.primary.main,
                marginBottom: '24px',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              View Example
            </p>

            {/* Tag Input */}
            <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
              <Input
                type="text"
                placeholder="Add Tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                variant="default"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  flex: 1
                }}
              />
              <Button
                onClick={handleAddTag}
                variant="filled"
                style={{ height: '48px', padding: '0 24px' }}
              >
                Add
              </Button>
            </div>

            {/* Tags Display */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              {tags.map((tag, index) => (
                <div
                  key={index}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: colors.grey.light,
                    borderRadius: '20px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              {tags.length === 0 && (
                <>
                  {['Placeholder', 'Placeholder', 'Placeholder', 'Placeholder', 'Placeholder', 'Placeholder', 'Placeholder', 'Placeholder', 'Placeholder'].map((tag, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '20px',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '14px',
                        color: '#999'
                      }}
                    >
                      {tag}
                    </div>
                  ))}
                </>
              )}
            </div>
          </>
        );

      case 4:
        return (
          <>
            <h2 
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                fontSize: '20px',
                lineHeight: '130%',
                color: colors.text.primary,
                marginBottom: '24px'
              }}
            >
              Link your Social media Account
            </h2>

            {/* Social Media Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Instagram */}
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: colors.text.primary,
                    marginBottom: '8px'
                  }}
                >
                  <img src={InstagramIcon} alt="Instagram" style={{ width: '20px', height: '20px' }} />
                  Instagram Account
                </label>
                <Input
                  type="text"
                  placeholder="Enter your Instagram username"
                  variant="default"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    width: '100%'
                  }}
                  error={step4Form.formState.errors.instagram?.message}
                  {...step4Form.register('instagram')}
                />
              </div>

              {/* Facebook */}
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: colors.text.primary,
                    marginBottom: '8px'
                  }}
                >
                  <img src={FacebookIcon} alt="Facebook" style={{ width: '20px', height: '20px' }} />
                  Facebook Account
                </label>
                <Input
                  type="text"
                  placeholder="Enter your Facebook username"
                  variant="default"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    width: '100%'
                  }}
                  error={step4Form.formState.errors.facebook?.message}
                  {...step4Form.register('facebook')}
                />
              </div>

              {/* TikTok */}
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: colors.text.primary,
                    marginBottom: '8px'
                  }}
                >
                  <img src={TikTokIcon} alt="TikTok" style={{ width: '20px', height: '20px' }} />
                  TikTok Account
                </label>
                <Input
                  type="text"
                  placeholder="Enter your TikTok username"
                  variant="default"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    width: '100%'
                  }}
                  error={step4Form.formState.errors.tiktok?.message}
                  {...step4Form.register('tiktok')}
                />
              </div>

              {/* X (Twitter) */}
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: colors.text.primary,
                    marginBottom: '8px'
                  }}
                >
                  <img src={XIcon} alt="X" style={{ width: '20px', height: '20px' }} />
                  X Account
                </label>
                <Input
                  type="text"
                  placeholder="Enter your X (Twitter) username"
                  variant="default"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    width: '100%'
                  }}
                  error={step4Form.formState.errors.x?.message}
                  {...step4Form.register('x')}
                />
              </div>

              {/* YouTube */}
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: colors.text.primary,
                    marginBottom: '8px'
                  }}
                >
                  <img src={YouTubeIcon} alt="YouTube" style={{ width: '20px', height: '20px' }} />
                  YouTube Account
                </label>
                <Input
                  type="text"
                  placeholder="Enter your YouTube channel name"
                  variant="default"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    width: '100%'
                  }}
                  error={step4Form.formState.errors.youtube?.message}
                  {...step4Form.register('youtube')}
                />
              </div>
            </div>
          </>
        );

      case 5:
        return (
          <>
            <h2 
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                fontSize: '20px',
                lineHeight: '130%',
                color: colors.text.primary,
                marginBottom: '24px'
              }}
            >
              Add your profile pic
            </h2>

            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
              {/* Upload Area */}
              <div style={{ flex: 1 }}>
                <label
                  htmlFor="profile-pic-upload"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '200px',
                    height: '200px',
                    border: `2px dashed ${colors.border.light}`,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    backgroundColor: profilePicPreview ? 'transparent' : colors.primary.white,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {profilePicPreview ? (
                    <img 
                      src={profilePicPreview} 
                      alt="Profile preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: colors.text.secondary, margin: 0 }}>
                        Add or drop
                      </p>
                      <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: colors.text.secondary, margin: 0 }}>
                        photo here
                      </p>
                    </div>
                  )}
                </label>
                <input
                  id="profile-pic-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  style={{ display: 'none' }}
                />
                <p 
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '12px',
                    color: colors.text.secondary,
                    textAlign: 'center',
                    marginTop: '12px'
                  }}
                >
                  200x200 Min/10 MB Max
                </p>
              </div>

              {/* Right Side */}
              <div style={{ flex: 1 }}>
                <h3 
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    fontSize: '16px',
                    color: colors.text.primary,
                    marginBottom: '16px'
                  }}
                >
                  Show clients the best version of yourself!
                </h3>

                {/* Avatar Preview Sizes */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  {[64, 48, 32, 24].map((size) => (
                    <div
                      key={size}
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        borderRadius: '50%',
                        backgroundColor: profilePicPreview ? 'transparent' : colors.grey.light,
                        overflow: 'hidden'
                      }}
                    >
                      {profilePicPreview && (
                        <img 
                          src={profilePicPreview} 
                          alt="Preview"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <p 
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '12px',
                    lineHeight: '140%',
                    color: colors.text.secondary
                  }}
                >
                  Must be an actual photo of you. Logos, clip-art, group photos, and digitally-altered photos are not recommended.{' '}
                  <span style={{ color: colors.primary.main, cursor: 'pointer', textDecoration: 'underline' }}>
                    Learn more
                  </span>
                </p>
              </div>
            </div>
          </>
        );

      default:
        return null;
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(235, 188, 254, 1) 0%, rgba(240, 196, 105, 1) 100%)',
        zIndex: 1000,
        backdropFilter: 'blur(10px)'
      }}
    >
      <div 
        style={{
          width: '550px',
          maxWidth: '90vw',
          height: '700px',
          maxHeight: '90vh',
          borderRadius: '8px',
          borderWidth: '1px',
          opacity: 1,
          gap: '8px',
          paddingTop: '16px',
          paddingRight: '32px',
          paddingBottom: '24px',
          paddingLeft: '32px',
          backgroundColor: '#FFFFFF',
          border: `1px solid ${colors.border.light}`,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          zIndex: 10,
          overflow: 'hidden'
        }}
      >
        {/* Back Button and Question Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                color: colors.text.primary
              }}
            >
              <img src={BackwardIcon} alt="Back" style={{ width: '24px', height: '24px' }} />
            </button>
          )}
          <div 
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              color: colors.text.secondary
            }}
          >
            Question {currentStep}/5
          </div>
        </div>

        {/* Form Content */}
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {renderStep()}
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: '12px',
              marginBottom: '12px',
              borderRadius: '8px',
              backgroundColor: '#fee',
              color: '#c33',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
          <Button
            variant="filled"
            onClick={handleNext}
            disabled={isLoading}
            style={{
              width: '100%',
              height: '44px'
            }}
          >
            {isLoading ? 'Submitting...' : currentStep === 5 ? 'COMPLETE' : 'NEXT'}
          </Button>

          <button
            onClick={handleSkip}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              color: colors.primary.main,
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            SKIP
          </button>
        </div>

        {/* Illustration - Show only in step 2 */}
        {currentStep === 2 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            marginTop: '16px',
            width: '100%'
          }}>
            <img 
              src={InfluencerDescriptionImg} 
              alt="Influencer description illustration" 
              style={{ 
                maxWidth: '100%', 
                height: 'auto', 
                maxHeight: '120px',
                display: 'block'
              }}
            />
          </div>
        )}

        {/* Illustration - Show only in step 3 */}
        {currentStep === 3 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            marginTop: '16px',
            width: '100%'
          }}>
            <img 
              src={TagsInfluencerImg} 
              alt="Tags illustration" 
              style={{ 
                maxWidth: '100%', 
                height: 'auto', 
                maxHeight: '120px',
                display: 'block'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

