import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { colors } from '../../constants/colors';
import { BackwardIcon } from '../../assets/icons';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import OnboardingBrandStep2 from '../../assets/images/illustrations/OnbiardingBrandstep2.png';
import TagsInfluencerImg from '../../assets/images/illustrations/TagsInfuencer.png';

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
  
  // Step 2 - Company logo
  const [, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  
  // Step 3 - Tags
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleNext = async () => {
    if (currentStep < 3) {
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
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
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
            <div style={{ textAlign: 'center' }}>
              <img 
                src={OnboardingBrandStep2} 
                alt="Brand onboarding illustration" 
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
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

      case 3:
        return (
          <>
            <h2 
              style={{
                width: '394px',
                height: 'auto',
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
        background: `background: linear-gradient(0deg, #FFFFFF, #FFFFFF),
linear-gradient(106.35deg, rgba(235, 188, 254, 0.3) 0%, rgba(240, 196, 105, 0.3) 100%),
linear-gradient(0deg, rgba(250, 249, 246, 0.7), rgba(250, 249, 246, 0.7));`,

        zIndex: 1000,
        backdropFilter: 'blur(10px)'
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
            Question {currentStep}/3
          </div>
        </div>

        {/* Form Content */}
        <div style={{ flex: 1, overflow: 'visible' }}>
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
            {isLoading ? 'Submitting...' : currentStep === 3 ? 'COMPLETE' : 'NEXT'}
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

        {/* Illustration - Show only in step 3 */}
        {currentStep === 3 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '16px' }}>
            <img 
              src={TagsInfluencerImg} 
              alt="Tags illustration" 
              style={{ maxWidth: '100%', height: 'auto', maxHeight: '120px' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

