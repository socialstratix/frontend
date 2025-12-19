import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

interface OnboardingFormProps {
  onComplete?: () => void;
}

export const OnboardingForm: React.FC<OnboardingFormProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Form state
  const [country, setCountry] = useState('');
  const [mobile, setMobile] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  
  // Question 2 - Influencer description
  const [influencerDescription, setInfluencerDescription] = useState('');
  
  // Question 3 - Tags
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Question 4 - Social media
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    facebook: '',
    tiktok: '',
    x: '',
    youtube: ''
  });
  
  // Question 5 - Profile pic
  // Note: profilePic stored for future file upload implementation
  const [, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string>('');

  const handleNext = async () => {
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

      // Prepare social media data
      const socialMedia = [];
      if (socialLinks.instagram) {
        socialMedia.push({
          platform: 'instagram' as const,
          username: socialLinks.instagram,
          profileUrl: `https://instagram.com/${socialLinks.instagram}`,
        });
      }
      if (socialLinks.facebook) {
        socialMedia.push({
          platform: 'facebook' as const,
          username: socialLinks.facebook,
          profileUrl: `https://facebook.com/${socialLinks.facebook}`,
        });
      }
      if (socialLinks.tiktok) {
        socialMedia.push({
          platform: 'tiktok' as const,
          username: socialLinks.tiktok,
          profileUrl: `https://tiktok.com/@${socialLinks.tiktok}`,
        });
      }
      if (socialLinks.x) {
        socialMedia.push({
          platform: 'x' as const,
          username: socialLinks.x,
          profileUrl: `https://x.com/${socialLinks.x}`,
        });
      }
      if (socialLinks.youtube) {
        socialMedia.push({
          platform: 'youtube' as const,
          username: socialLinks.youtube,
          profileUrl: `https://youtube.com/@${socialLinks.youtube}`,
        });
      }

      // Prepare onboarding data
      const onboardingData = {
        location: {
          country,
          mobile,
          state,
          pincode,
          city,
          address,
        },
        description: influencerDescription,
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
              <div style={{ display: 'flex', gap: '8px' }}>
                {/* Country Code Dropdown */}
                <div style={{ position: 'relative', width: '80px' }}>
                  <select
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '12px',
                      border: `1px solid ${colors.border.light}`,
                      borderRadius: '4px',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '14px',
                      backgroundColor: colors.primary.white,
                      cursor: 'pointer',
                      appearance: 'none'
                    }}
                  >
                    <option value="+91">🇮🇳</option>
                    <option value="+1">🇺🇸</option>
                    <option value="+44">🇬🇧</option>
                  </select>
                </div>

                {/* Mobile Number Input */}
                <div style={{ flex: 1 }}>
                  <Input
                    type="tel"
                    placeholder="10 digit mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    variant="default"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Select Country Dropdown */}
            <div style={{ marginBottom: '16px' }}>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '12px',
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: '4px',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  color: country ? colors.text.primary : colors.text.secondary,
                  backgroundColor: colors.primary.white,
                  cursor: 'pointer'
                }}
              >
                <option value="">Select country</option>
                <option value="india">India</option>
                <option value="usa">United States</option>
                <option value="uk">United Kingdom</option>
              </select>
            </div>

            {/* State Input */}
            <div style={{ marginBottom: '16px' }}>
              <Input
                type="text"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                variant="default"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Pincode Input */}
            <div style={{ marginBottom: '16px' }}>
              <Input
                type="text"
                placeholder="Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                variant="default"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* City Input */}
            <div style={{ marginBottom: '16px' }}>
              <Input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                variant="default"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Address Textarea */}
            <div style={{ marginBottom: '24px' }}>
              <textarea
                placeholder="Address(optional)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{
                  width: '100%',
                  height: '80px',
                  padding: '12px',
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: '4px',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  resize: 'none',
                  outline: 'none'
                }}
              />
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
              placeholder="Describe the kind of influencer you are"
              value={influencerDescription}
              onChange={(e) => setInfluencerDescription(e.target.value)}
              style={{
                width: '100%',
                height: '56px',
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
            <div style={{ textAlign: 'center', opacity: 0.3 }}>
              <p style={{ fontSize: '100px', margin: 0 }}>👥</p>
            </div>
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

            {/* Illustration */}
            <div style={{ textAlign: 'center', opacity: 0.3, marginTop: '40px' }}>
              <p style={{ fontSize: '80px', margin: 0 }}>💼🔍🚀</p>
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
                  value={socialLinks.instagram}
                  onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                  variant="default"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    width: '100%'
                  }}
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
                  value={socialLinks.facebook}
                  onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                  variant="default"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    width: '100%'
                  }}
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
                  value={socialLinks.tiktok}
                  onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
                  variant="default"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    width: '100%'
                  }}
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
                  value={socialLinks.x}
                  onChange={(e) => setSocialLinks({ ...socialLinks, x: e.target.value })}
                  variant="default"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    width: '100%'
                  }}
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
                  value={socialLinks.youtube}
                  onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                  variant="default"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    width: '100%'
                  }}
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

                {/* Material Icon Placeholder */}
                <div 
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: colors.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.primary.white,
                    fontSize: '24px',
                    fontWeight: 'bold',
                    marginTop: '16px'
                  }}
                >
                  M
                </div>
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
        background: `
          linear-gradient(0deg, #FFFFFF, #FFFFFF),
          linear-gradient(106.35deg, rgba(235, 188, 254, 0.3) 0%, rgba(240, 196, 105, 0.3) 100%),
          linear-gradient(0deg, rgba(250, 249, 246, 0.7), rgba(250, 249, 246, 0.7))
        `,
        zIndex: 1000
      }}
    >
      <div 
        style={{
          width: '522px',
          height: '690px',
          borderRadius: '8px',
          borderWidth: '1px',
          opacity: 1,
          gap: '10px',
          paddingTop: '20px',
          paddingRight: '40px',
          paddingBottom: '40px',
          paddingLeft: '40px',
          background: '#FFFFFF',
          border: `1px solid ${colors.border.light}`,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {/* Back Button and Question Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
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
        <div style={{ flex: 1, overflow: 'auto' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
          <Button
            variant="filled"
            onClick={handleNext}
            disabled={isLoading}
            style={{
              width: '100%',
              height: '48px'
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
      </div>
    </div>
  );
};

