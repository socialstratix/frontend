import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/atoms/Button';
import { colors } from '../../constants/colors';
import { InfluencerIllustration, BrandIllustration } from '../../assets/images';

export const UserTypeSelection: React.FC = () => {
  const [selectedType, setSelectedType] = useState<'influencer' | 'brand' | null>(null);
  const [hoveredCard, setHoveredCard] = useState<'influencer' | 'brand' | null>(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedType === 'influencer') {
      // Navigate to signup with userType pre-selected
      navigate('/signup?userType=influencer');
    } else if (selectedType === 'brand') {
      // Navigate to signup with userType pre-selected
      navigate('/signup?userType=brand');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, rgba(235, 188, 254, 0.3) 0%, rgba(240, 196, 105, 0.3) 100%)'
      }}
    >
      <div 
        style={{
          width: '90%',
          maxWidth: '1200px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '48px',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              fontSize: '33px',
              lineHeight: '100%',
              letterSpacing: '0%',
              color: colors.text.primary,
              marginBottom: '12px'
            }}
          >
            Tell us who you are
          </h1>
          <p 
            style={{
              fontFamily: 'Poppins',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '140%',
              letterSpacing: '0%',
              color: colors.text.secondary,
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            Knowing whether you're an influencer or a brand helps us tailor the platform experience to suit your needs.
          </p>
        </div>

        {/* User Type Cards */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px',
            marginBottom: '40px'
          }}
        >
          {/* Influencer Card */}
          <div
            onClick={() => setSelectedType('influencer')}
            onMouseEnter={() => setHoveredCard('influencer')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              position: 'relative',
              backgroundColor: selectedType === 'influencer'
                ? 'rgba(240, 226, 246, 1)'
                : hoveredCard === 'influencer'
                ? 'rgba(239, 236, 240, 1)'
                : '#FFFFFF',
              borderRadius: '12px',
              padding: '32px',
              border: selectedType === 'influencer' 
                ? `1px solid rgba(170, 134, 185, 1)` 
                : '2px solid transparent',
              boxShadow: selectedType === 'influencer'
                ? '0px 2px 3px 0px rgba(30, 0, 43, 0.16), 0px -1px 1px 0px rgba(30, 0, 43, 0.05)'
                : hoveredCard === 'influencer'
                ? '0px 2px 3px 0px rgba(30, 0, 43, 0.16), 0px -1px 1px 0px rgba(30, 0, 43, 0.05)'
                : '0px 2px 8px rgba(0, 0, 0, 0.08)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {selectedType === 'influencer' && (
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '24px',
                  height: '24px'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.6 16.6L17.65 9.55L16.25 8.15L10.6 13.8L7.75 10.95L6.35 12.35L10.6 16.6ZM12 22C10.6167 22 9.31667 21.7375 8.1 21.2125C6.88333 20.6875 5.825 19.975 4.925 19.075C4.025 18.175 3.3125 17.1167 2.7875 15.9C2.2625 14.6833 2 13.3833 2 12C2 10.6167 2.2625 9.31667 2.7875 8.1C3.3125 6.88333 4.025 5.825 4.925 4.925C5.825 4.025 6.88333 3.3125 8.1 2.7875C9.31667 2.2625 10.6167 2 12 2C13.3833 2 14.6833 2.2625 15.9 2.7875C17.1167 3.3125 18.175 4.025 19.075 4.925C19.975 5.825 20.6875 6.88333 21.2125 8.1C21.7375 9.31667 22 10.6167 22 12C22 13.3833 21.7375 14.6833 21.2125 15.9C20.6875 17.1167 19.975 18.175 19.075 19.075C18.175 19.975 17.1167 20.6875 15.9 21.2125C14.6833 21.7375 13.3833 22 12 22ZM12 20C14.2333 20 16.125 19.225 17.675 17.675C19.225 16.125 20 14.2333 20 12C20 9.76667 19.225 7.875 17.675 6.325C16.125 4.775 14.2333 4 12 4C9.76667 4 7.875 4.775 6.325 6.325C4.775 7.875 4 9.76667 4 12C4 14.2333 4.775 16.125 6.325 17.675C7.875 19.225 9.76667 20 12 20Z" fill="rgba(170, 134, 185, 1)"/>
                </svg>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <img 
                src={InfluencerIllustration}
                alt="Influencer"
                style={{
                  width: '252.0921630859375px',
                  height: '208px',
                  opacity: 1,
                  transform: 'rotate(0deg)',
                  objectFit: 'contain'
                }}
              />
            </div>
            <h2 
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                fontSize: '24px',
                lineHeight: '100%',
                letterSpacing: '0%',
                color: colors.text.primary,
                marginBottom: '12px'
              }}
            >
              Influencer
            </h2>
            <p 
              style={{
                fontFamily: 'Poppins',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '140%',
                letterSpacing: '0%',
                color: colors.text.secondary
              }}
            >
              A content creator with a dedicated following who influences their audience's opinions, behaviors, and purchasing decisions through social media and digital platforms.
            </p>
          </div>

          {/* Brand Card */}
          <div
            onClick={() => setSelectedType('brand')}
            onMouseEnter={() => setHoveredCard('brand')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              position: 'relative',
              backgroundColor: selectedType === 'brand'
                ? 'rgba(240, 226, 246, 1)'
                : hoveredCard === 'brand'
                ? 'rgba(239, 236, 240, 1)'
                : '#FFFFFF',
              borderRadius: '12px',
              padding: '32px',
              border: selectedType === 'brand' 
                ? `1px solid rgba(170, 134, 185, 1)` 
                : '2px solid transparent',
              boxShadow: selectedType === 'brand'
                ? '0px 2px 3px 0px rgba(30, 0, 43, 0.16), 0px -1px 1px 0px rgba(30, 0, 43, 0.05)'
                : hoveredCard === 'brand'
                ? '0px 2px 3px 0px rgba(30, 0, 43, 0.16), 0px -1px 1px 0px rgba(30, 0, 43, 0.05)'
                : '0px 2px 8px rgba(0, 0, 0, 0.08)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {selectedType === 'brand' && (
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '24px',
                  height: '24px'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.6 16.6L17.65 9.55L16.25 8.15L10.6 13.8L7.75 10.95L6.35 12.35L10.6 16.6ZM12 22C10.6167 22 9.31667 21.7375 8.1 21.2125C6.88333 20.6875 5.825 19.975 4.925 19.075C4.025 18.175 3.3125 17.1167 2.7875 15.9C2.2625 14.6833 2 13.3833 2 12C2 10.6167 2.2625 9.31667 2.7875 8.1C3.3125 6.88333 4.025 5.825 4.925 4.925C5.825 4.025 6.88333 3.3125 8.1 2.7875C9.31667 2.2625 10.6167 2 12 2C13.3833 2 14.6833 2.2625 15.9 2.7875C17.1167 3.3125 18.175 4.025 19.075 4.925C19.975 5.825 20.6875 6.88333 21.2125 8.1C21.7375 9.31667 22 10.6167 22 12C22 13.3833 21.7375 14.6833 21.2125 15.9C20.6875 17.1167 19.975 18.175 19.075 19.075C18.175 19.975 17.1167 20.6875 15.9 21.2125C14.6833 21.7375 13.3833 22 12 22ZM12 20C14.2333 20 16.125 19.225 17.675 17.675C19.225 16.125 20 14.2333 20 12C20 9.76667 19.225 7.875 17.675 6.325C16.125 4.775 14.2333 4 12 4C9.76667 4 7.875 4.775 6.325 6.325C4.775 7.875 4 9.76667 4 12C4 14.2333 4.775 16.125 6.325 17.675C7.875 19.225 9.76667 20 12 20Z" fill="rgba(170, 134, 185, 1)"/>
                </svg>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <img 
                src={BrandIllustration}
                alt="Brand"
                style={{
                  width: '252.0921630859375px',
                  height: '208px',
                  opacity: 1,
                  transform: 'rotate(0deg)',
                  objectFit: 'contain'
                }}
              />
            </div>
            <h2 
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                fontSize: '24px',
                lineHeight: '100%',
                letterSpacing: '0%',
                color: colors.text.primary,
                marginBottom: '12px'
              }}
            >
              Brand
            </h2>
            <p 
              style={{
                fontFamily: 'Poppins',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '140%',
                letterSpacing: '0%',
                color: colors.text.secondary
              }}
            >
              A business or organization that creates a distinct identity through products, services, and marketing to build recognition, trust, and loyalty among its target audience.
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            type="button"
            onClick={handleContinue}
            disabled={!selectedType}
            variant="elevated"
            style={{
              width: '200px',
              height: '48px',
              borderRadius: '8px',
              fontFamily: 'Poppins',
              fontWeight: 600,
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0%'
            }}
          >
            CONTINUE
          </Button>
        </div>
      </div>
    </div>
  );
};

