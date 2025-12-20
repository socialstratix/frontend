import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '../../components/atoms/Input';
import { Button } from '../../components/atoms/Button';
import { colors } from '../../constants/colors';
import { OnboardingForm } from '../OnboardingForm';
import { BrandOnboardingForm } from '../BrandOnboardingForm';
import { useAuth } from '../../contexts/AuthContext';

export const Signup: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'brand' | 'influencer' | ''>('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  // Pre-select userType from URL query parameter
  useEffect(() => {
    const typeFromUrl = searchParams.get('userType');
    if (typeFromUrl === 'brand' || typeFromUrl === 'influencer') {
      setUserType(typeFromUrl);
    } else {
      // If no userType is provided in URL, redirect to user type selection
      navigate('/user-type-selection', { replace: true });
    }
  }, [searchParams, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!userType) {
      setError('User type is required. Please go back and select your type.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await signup(email, password, fullName, userType as 'brand' | 'influencer');
      // Show onboarding form after successful signup
      setShowOnboarding(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // Handle Google signup logic here
    // Show onboarding form
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Redirect based on user type
    if (userType === 'brand') {
      navigate('/brand');
    } else if (userType === 'influencer') {
      navigate('/influencer');
    } else {
      navigate('/login');
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <>
    <div className="min-h-screen flex items-center justify-center">
    <div 
      className="flex"
      style={{
        width: '1114px',
        height: '728px',
        opacity: 1,
        transform: 'rotate(0deg)'
      }}
    >
         {/* Left Column - Promotional Section */}
      <div className="hidden lg:flex relative overflow-hidden items-center justify-center">
        <div 
          className="flex flex-col justify-between p-12"
          style={{
            width: '570px',
            height: '728px',
            background: 'linear-gradient(0deg, #EAFFC2 0%, #FFD4F6 100%)',
            opacity: 1,
            gap: '10px'
          }}
        >
          <div className="flex-1 flex flex-col justify-center">
            <h1 
              style={{
                width: '442px',
                height: '198px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                fontSize: '44px',
                lineHeight: '100%',
                letterSpacing: '0%',
                verticalAlign: 'middle',
                opacity: 1,
                transform: 'rotate(0deg)'
              }}
              className="mb-4"
            >
              <span style={{ color: colors.text.primary }}>Right </span>
              <span style={{ color: colors.gold.light }}>
                Voices To
              </span>
            
              <span 
                style={{
                  backgroundImage: `linear-gradient(180deg, ${colors.gold.light} 0%, ${colors.primary.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent',
                  display: 'inline-block'
                }}
              >
              Amplify
              </span>
              <span style={{ color: colors.text.primary }}> Your Brand!</span>
            </h1>
            <div
              style={{
                width: '450px',
                height: '308px',
                gap: '17px',
                opacity: 1,
                transform: 'rotate(0deg)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <p
                style={{
                  width: '450px',
                  height: '21px',
                  fontFamily: 'Poppins',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  color: colors.text.secondary,
                  opacity: 1,
                  transform: 'rotate(0deg)'
                }}
              >
                Join the best influencer finding site
              </p>
              
              <div className="max-w-lg " style={{ flex: 1 }}>
               <div className="flex gap-1 height-450px width-105px">
               <div 
                  className="mb-4"
                  style={{ 
                    color: colors.grey.light,
                    fontSize: '64px',
                    lineHeight: '1',
                    fontFamily: 'serif',
                    fontWeight: 900
                  }}
                >
                  “
                </div>
                <p
                  style={{
                    width: '388px',
                    height: '105px',
                    fontFamily: 'Poppins',
                    fontWeight: 400,
                    fontStyle: 'normal',
                    fontSize: '14px',
                    lineHeight: '100%',
                    letterSpacing: '0%',
                    color: colors.text.primary,
                    opacity: 1,
                    transform: 'rotate(0deg)',
                    marginBottom: '24px'
                  }}
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
               </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
                    <img 
                      src="https://i.pravatar.cc/150?img=12" 
                      alt="Elon Musk" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p 
                      style={{
                        fontFamily: 'Poppins',
                        fontWeight: 700,
                        color: colors.text.primary
                      }}
                    >
                      Elon Musk
                    </p>
                    <p 
                      style={{
                        fontFamily: 'Poppins',
                        fontSize: '14px',
                        color: colors.text.secondary
                      }}
                    >
                      Tesla founder
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex gap-2 justify-center">
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            <div className="w-2 h-2 rounded-full bg-purple-600"></div>
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
          </div>
        </div>
      </div>

        {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white">
        <div 
          style={{
            width: '544px',
            height: '728px',
            paddingTop: '20px',
            paddingRight: '40px',
            paddingBottom: '40px',
            paddingLeft: '40px',
            gap: '10px',
            opacity: 1,
            transform: 'rotate(0deg)',
            borderTopRightRadius: '8px',
            borderBottomRightRadius: '8px',
            borderTopWidth: '1px',
            borderRightWidth: '1px',
            borderBottomWidth: '1px',
            borderLeftWidth: '0px',
            borderStyle: 'solid',
            borderColor: colors.border.light,
            background: `
              linear-gradient(0deg, #FFFFFF, #FFFFFF),
              linear-gradient(106.35deg, rgba(235, 188, 254, 0.3) 0%, rgba(240, 196, 105, 0.3) 100%),
              linear-gradient(0deg, rgba(250, 249, 246, 0.7), rgba(250, 249, 246, 0.7))
            `
          }}
          className="flex flex-col"
        >
          {/* Logo and Brand Name */}
          <div className="flex items-center gap-3" style={{ marginBottom: '16px' }}>
            <div className="w-12 h-12 flex items-center justify-center">
              <span 
                style={{
                  width: '33px',
                  height: '50px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 700,
                  fontSize: '33px',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  verticalAlign: 'middle',
                  opacity: 1,
                  transform: 'rotate(0deg)',
                  color: colors.text.primary
                }}
              >
                ツ
              </span>
            </div>
            <h2 
              style={{
                width: '162px',
                height: '30px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700,
                fontSize: '20px',
                lineHeight: '100%',
                letterSpacing: '0%',
                verticalAlign: 'middle',
                opacity: 1,
                transform: 'rotate(0deg)',
                color: '#1E002B'
              }}
            >
              SOCIAL STRATIX
            </h2>
          </div>

          <div
            style={{
              width: '464px',
              opacity: 1,
              transform: 'rotate(0deg)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <h1 
              style={{
                width: '348px',
                height: '50px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                fontSize: '33px',
                lineHeight: '100%',
                letterSpacing: '0%',
                verticalAlign: 'middle',
                alignContent: 'center',
                textAlign: 'center',
                opacity: 1,
                transform: 'rotate(0deg)',
                color: '#1E002B',
                margin: '0 auto 24px auto',
                alignSelf: 'center'
              }}
            >
              Create your Account
            </h1>

              {/* Google Signup Button */}
              <button
                onClick={handleGoogleSignup}
                type="button"
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: '4px',
                  backgroundColor: colors.primary.white,
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '100%',
                  color: colors.text.primary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '16px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f8f8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary.white;
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.8055 10.2292C19.8055 9.55004 19.7501 8.86671 19.6309 8.19587H10.2V12.0488H15.6014C15.3773 13.2911 14.6571 14.3898 13.6025 15.0875V17.5863H16.8251C18.7172 15.8449 19.8055 13.2728 19.8055 10.2292Z" fill="#4285F4"/>
                  <path d="M10.2 20C12.9573 20 15.2727 19.1045 16.8291 17.5863L13.6064 15.0875C12.7036 15.6967 11.5482 16.0421 10.2041 16.0421C7.54409 16.0421 5.29409 14.2838 4.50545 11.917H1.17773V14.4921C2.77909 17.6771 6.30909 20 10.2 20Z" fill="#34A853"/>
                  <path d="M4.50136 11.9171C4.05818 10.6748 4.05818 9.32986 4.50136 8.08757V5.5125H1.17773C-0.267727 8.38374 -0.267727 11.6204 1.17773 14.4917L4.50136 11.9171Z" fill="#FBBC04"/>
                  <path d="M10.2 3.95794C11.6218 3.93606 13.0009 4.47353 14.0418 5.45794L16.8968 2.60294C15.1827 0.990857 12.7305 0.0999999 10.2 0.125479C6.30909 0.125479 2.77909 2.44835 1.17773 5.51251L4.50136 8.08751C5.28591 5.71667 7.54 3.95794 10.2 3.95794Z" fill="#EA4335"/>
                </svg>
                Sign up with Google
              </button>

              {/* Divider */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '16px'
                }}
              >
                <div style={{ flex: 1, height: '1px', backgroundColor: colors.border.light }} />
                <span 
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 400,
                    fontSize: '14px',
                    color: colors.text.secondary
                  }}
                >
                  Or
                </span>
                <div style={{ flex: 1, height: '1px', backgroundColor: colors.border.light }} />
              </div>

              {/* Signup Form */}
              {error && (
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: '#fee',
                    border: '1px solid #fcc',
                    borderRadius: '4px',
                    color: '#c33',
                    fontSize: '14px',
                    fontFamily: 'Poppins',
                    marginBottom: '16px',
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Inputs Container */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Full Name Input */}
                  <div>
                    <Input
                      type="text"
                      label="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                      variant="login"
                    />
                  </div>

                  {/* Email Input */}
                  <div>
                    <Input
                      type="email"
                      label="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      variant="login"
                    />
                  </div>

                  {/* Password Input */}
                  <div>
                    <Input
                      type="password"
                      label="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password (min 6 characters)"
                      required
                      variant="login"
                    />
                  </div>
                </div>

                {/* Sign Up Button */}
                <Button
                  type="submit"
                  variant="filled"
                  disabled={isLoading}
                  style={{
                    width: '464px',
                    height: '41px',
                    gap: '8px',
                    opacity: isLoading ? 0.6 : 1
                  }}
                  className="text-white font-semibold"
                >
                  {isLoading ? 'SIGNING UP...' : 'SIGN UP'}
                </Button>
              </form>

              {/* Already have account */}
              <div 
                style={{
                  textAlign: 'center',
                  marginTop: '16px'
                }}
              >
                <p 
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 400,
                    fontSize: '14px',
                    color: colors.text.primary,
                    marginBottom: '12px'
                  }}
                >
                  Already have an account
                </p>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLoginClick}
                  style={{
                    width: '464px',
                    height: '41px',
                    gap: '8px',
                    opacity: 1
                  }}
                  className="font-semibold"
                >
                  LOGIN
                </Button>
              </div>

              {/* Terms and Privacy */}
              <p 
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 400,
                  fontSize: '12px',
                  lineHeight: '140%',
                  color: colors.text.secondary,
                  textAlign: 'center',
                  marginTop: '16px'
                }}
              >
                By continuing, you agree to Social Stratix{' '}
                <span 
                  style={{
                    color: colors.primary.main,
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate('/terms')}
                >
                  Terms of Service
                </span>
                {' '}and{' '}
                <span 
                  style={{
                    color: colors.primary.main,
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate('/privacy')}
                >
                  Privacy Policy
                </span>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Onboarding Form Modal */}
      {showOnboarding && userType === 'influencer' && (
        <OnboardingForm onComplete={handleOnboardingComplete} />
      )}
      {showOnboarding && userType === 'brand' && (
        <BrandOnboardingForm onComplete={handleOnboardingComplete} />
      )}
    </>
  );
};

