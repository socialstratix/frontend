import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { colors } from '../../constants/colors';
import { INFLUENCER_TAGS } from '../../constants/tags';
import { BackwardIcon, CheckIcon } from '../../assets/icons';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import OnboardingBrandStep2 from '../../assets/images/illustrations/OnbiardingBrandstep2.png';

interface BrandOnboardingFormProps {
  onComplete?: () => void;
}

export const BrandOnboardingForm: React.FC<BrandOnboardingFormProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Step 1 - Brand description
  const [brandDescription, setBrandDescription] = useState('');
  
  // Step 1 - Email OTP verify (static for now)
  const [otp, setOtp] = useState('');
  const OTP_LENGTH = 6;
  
  // Step 3 - Company logo
  const [, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  
  // Step 4 - Tags
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleNext = async () => {
    if (currentStep < 4) {
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

      // Prepare onboarding data
      const onboardingData = {
        description: brandDescription,
        logo: logoPreview, // Base64 encoded image
        tags,
      };

      // Submit to backend
      await apiService.post('/onboarding/brand', onboardingData);

      // Complete onboarding
      onComplete?.();
      
      // Redirect based on user type
      if (user?.userType === 'brand') {
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
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (tags.includes(trimmed)) {
      setTagInput('');
      return;
    }
    if (tags.length >= 6) return;
    setTags([...tags, trimmed]);
    setTagInput('');
  };

  const handleAddTagFromSuggestion = (tag: string) => {
    if (!tags.includes(tag) && tags.length < 6) {
      const newTags = [...tags, tag];
      setTags(newTags);
      setTagInput(newTags.join(', '));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setTagInput('');
  };

  // RESEND: static for now. VERIFY: validate OTP length then advance
  const handleOtpAction = () => {
    const value = otp.trim();
    if (!value) {
      setError('');
      return; // RESEND - no action for now
    }
    // VERIFY - validate OTP
    setError('');
    if (value.length !== OTP_LENGTH) {
      setError(`Please enter a valid ${OTP_LENGTH}-digit OTP.`);
      return;
    }
    if (!/^\d+$/.test(value)) {
      setError('OTP must contain only numbers.');
      return;
    }
    handleNext();
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('Logo size must be less than 10MB');
        return;
      }
      
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
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
                fontFamily: 'Poppins',
                fontWeight: 600,
                fontSize: '24px',
                lineHeight: '100%',
                color: 'rgba(30, 0, 43, 1)',
                marginBottom: '8px',
                opacity: 1
              }}
            >
              Verify your email
            </h2>
            <p 
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                color: colors.text.secondary,
                marginBottom: '24px'
              }}
            >
              We have sent an OTP to your email, please enter it below.
            </p>

            <div style={{ marginBottom: '24px' }}>
              <Input
                type="text"
                label="One Time Password"
                placeholder={`Enter ${OTP_LENGTH}-digit OTP`}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH));
                  if (error) setError('');
                }}
                variant="login"
                error={currentStep === 1 ? error : undefined}
                style={{ width: '100%' }}
              />
            </div>
            <Button
              variant="filled"
              onClick={handleOtpAction}
              style={{ width: '100%', height: '44px' }}
            >
              {otp.trim() ? 'VERIFY' : 'RESEND'}
            </Button>
          </>
        );

      case 2:
        return (
          <>
            <h2 
              style={{
                width: '394px',
                height: '36px',
                fontFamily: 'Poppins',
                fontWeight: 600,
                fontSize: '24px',
                lineHeight: '100%',
                letterSpacing: '0%',
                verticalAlign: 'middle',
                color: 'rgba(30, 0, 43, 1)',
                marginBottom: '8px',
                opacity: 1
              }}
            >
              Describe about your Brand
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
              placeholder="Describe what your company/brand does"
              value={brandDescription}
              onChange={(e) => setBrandDescription(e.target.value)}
              style={{
                width: '100%',
                height: '120px',
                padding: '16px',
                border: `1px solid ${colors.border.light}`,
                borderRadius: '8px',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                resize: 'none',
                outline: 'none',
                marginBottom: '24px'
              }}
            />

            {/* Illustration */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              width: '100%'
            }}>
              <img 
                src={OnboardingBrandStep2} 
                alt="Brand onboarding illustration" 
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto',
                  display: 'block'
                }}
              />
            </div>
          </>
        );

      case 3:
        return (
          <>
            <h2 
              style={{
                width: '394px',
                height: '36px',
                fontFamily: 'Poppins',
                fontWeight: 600,
                fontSize: '24px',
                lineHeight: '100%',
                letterSpacing: '0%',
                verticalAlign: 'middle',
                color: 'rgba(30, 0, 43, 1)',
                marginBottom: '24px',
                opacity: 1
              }}
            >
              Add your company logo
            </h2>

            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
              {/* Upload Area */}
              <div style={{ flex: 1 }}>
                <label
                  htmlFor="logo-upload"
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
                    backgroundColor: logoPreview ? 'transparent' : colors.primary.white,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Logo preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
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
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
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
                  200X200 Min/ 10 MB Max
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
                  Help influencers recognise you easier!
                </h3>

                {/* Logo Preview Sizes */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  {[64, 48, 32].map((size) => (
                    <div
                      key={size}
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        borderRadius: '100%',
                        backgroundColor: logoPreview ? 'transparent' : colors.grey.light,
                        overflow: 'hidden',
                        border: `1px solid ${colors.border.light}`
                      }}
                    >
                      {logoPreview && (
                        <img 
                          src={logoPreview} 
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
                  Must be an actual photo of you. Logos, clip-art, group photos, and digitally-altered images are not recommended.{' '}
                  <span style={{ color: colors.primary.main, cursor: 'pointer', textDecoration: 'underline' }}>
                    Learn more
                  </span>
                </p>
              </div>
            </div>
          </>
        );

      case 4:
        return (
          <>
            <h2 
              style={{
                fontFamily: 'Poppins',
                fontWeight: 600,
                fontSize: '22px',
                lineHeight: 1.3,
                color: 'rgba(30, 0, 43, 1)',
                marginBottom: '6px',
                opacity: 1
              }}
            >
              Add tags that clearly highlight your skills and expertise, making it easy for brands to understand you.
            </h2>
            <p 
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px',
                color: colors.text.secondary,
                marginBottom: '20px'
              }}
            >
              Select up to 6 tags. Click a tag below to add it, or add your own.
            </p>
            <p 
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                color: colors.primary.main,
                marginBottom: '16px',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              View Example
            </p>

            {/* Selected tags - clear display of what's chosen */}
            {tags.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <span 
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: colors.text.secondary,
                    display: 'block',
                    marginBottom: '8px'
                  }}
                >
                  Selected ({tags.length}/6)
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        backgroundColor: colors.primary.main || '#783C91',
                        color: '#FFFFFF',
                        borderRadius: '16px',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '13px'
                      }}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'inherit',
                          cursor: 'pointer',
                          padding: 0,
                          marginLeft: '2px',
                          fontSize: '16px',
                          lineHeight: 1
                        }}
                        aria-label={`Remove ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Add custom tag */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '8px' }}>
              <Input
                type="text"
                placeholder="Add a custom tag"
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
                disabled={tags.length >= 6}
                style={{ height: '44px', padding: '0 20px', minWidth: '72px' }}
              >
                Add
              </Button>
            </div>

            {/* Suggested tags label */}
            <span 
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '12px',
                fontWeight: 600,
                color: colors.text.secondary,
                display: 'block',
                marginBottom: '10px'
              }}
            >
              Suggested tags
            </span>

            {/* Scrollable tag list - subtler scrollbar, clearer chips */}
            <div 
              className="brand-onboarding-tags-scroll"
              style={{ 
                maxHeight: '200px',
                overflowY: 'auto',
                overflowX: 'hidden',
                marginBottom: '8px',
                padding: '8px 4px 8px 0',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {INFLUENCER_TAGS.map((tag, index) => {
                  const isSelected = tags.includes(tag);
                  const disabled = !isSelected && tags.length >= 6;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        if (isSelected) handleRemoveTag(tag);
                        else handleAddTagFromSuggestion(tag);
                      }}
                      disabled={disabled}
                      style={{
                        padding: '10px 18px',
                        backgroundColor: isSelected 
                          ? (colors.primary?.main || '#783C91')
                          : '#FFFFFF',
                        color: isSelected 
                          ? '#FFFFFF'
                          : (colors.text?.secondary || '#676767'),
                        border: `1px solid ${isSelected ? (colors.primary?.main || '#783C91') : colors.border.light}`,
                        borderRadius: '20px',
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '14px',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        opacity: disabled ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (disabled) return;
                        e.currentTarget.style.backgroundColor = isSelected ? (colors.primary?.dark || '#3F214C') : (colors.primary?.main || '#783C91');
                        e.currentTarget.style.color = '#FFFFFF';
                        e.currentTarget.style.borderColor = isSelected ? (colors.primary?.dark || '#3F214C') : (colors.primary?.main || '#783C91');
                      }}
                      onMouseLeave={(e) => {
                        if (disabled) return;
                        e.currentTarget.style.backgroundColor = isSelected ? (colors.primary?.main || '#783C91') : '#FFFFFF';
                        e.currentTarget.style.color = isSelected ? '#FFFFFF' : (colors.text?.secondary || '#676767');
                        e.currentTarget.style.borderColor = isSelected ? (colors.primary?.main || '#783C91') : colors.border.light;
                      }}
                    >
                      {isSelected && (
                        <img 
                          src={CheckIcon} 
                          alt="" 
                          style={{ width: '14px', height: '14px', filter: 'brightness(0) invert(1)' }} 
                        />
                      )}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <style>{`
        .brand-onboarding-tags-scroll {
          scrollbar-width: thin;
          scrollbar-color: #c4b5d0 #f0eaf4;
        }
        .brand-onboarding-tags-scroll::-webkit-scrollbar { width: 6px; }
        .brand-onboarding-tags-scroll::-webkit-scrollbar-track { background: #f0eaf4; border-radius: 3px; }
        .brand-onboarding-tags-scroll::-webkit-scrollbar-thumb { background: #c4b5d0; border-radius: 3px; }
      `}</style>
    <div
  style={{
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, rgb(235,188,254) 0%, rgb(240,196,105) 100%)",
    zIndex: 1000,
  }}
>
      <div 
        style={{
          width: '550px',
          height: '700px',
          borderRadius: '8px',
          borderWidth: '1px',
          opacity: 1,
          gap: '8px',
          paddingTop: '16px',
          paddingRight: '32px',
          paddingBottom: '24px',
          paddingLeft: '32px',
          background: '#FFFFFF',
          backgroundColor: '#FFFFFF',
          border: `1px solid ${colors.border.light}`,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          zIndex: 10
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
            Question {currentStep}/4
          </div>
        </div>

        {/* Form Content */}
        <div style={{ flex: 1, overflow: 'visible' }}>
          {renderStep()}
        </div>

        {/* Error Message */}
        {error && currentStep !== 1 && (
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
            {isLoading ? 'Submitting...' : currentStep === 4 ? 'COMPLETE' : 'NEXT'}
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

      </div>
    </div>
    </>
  );
};

