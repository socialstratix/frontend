import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../../components/atoms/Input';
import { Button } from '../../components/atoms/Button';
import { TestimonialCarousel } from '../../components/molecules/TestimonialCarousel';
import { colors } from '../../constants/colors';
import { OnboardingForm } from '../OnboardingForm';
import { BrandOnboardingForm } from '../BrandOnboardingForm';
import { useAuth } from '../../contexts/AuthContext';
import { signupSchema, validatePassword, formatPasswordErrors } from '../../utils/validationSchemas';
import type { SignupFormData } from '../../utils/validationSchemas';

export const Signup: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [userType, setUserType] = useState<'brand' | 'influencer' | ''>('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const {
    register,
    handleSubmit,
    watch,
    setError: setFieldError,
    formState: { errors, touchedFields },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
  });

  const passwordValue = watch('password');
  const passwordErrors = passwordValue ? validatePassword(passwordValue) : [];
  const hasPasswordErrors = passwordErrors.length > 0;
  const showPasswordErrors = touchedFields.password && hasPasswordErrors;
  const formattedPasswordError = showPasswordErrors ? formatPasswordErrors(passwordErrors) : null;

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

  const onSubmit = async (data: SignupFormData) => {
    setError('');

    if (!userType) {
      setError('User type is required. Please go back and select your type.');
      return;
    }

    // For brand we use brandName as fullName; for influencer we use fullName. Full name is not used for brand (display only for now).
    const fullNameToSend =
      userType === 'brand'
        ? (data.brandName?.trim() ?? '')
        : (data.fullName?.trim() ?? '');
    if (!fullNameToSend) {
      if (userType === 'brand') {
        setFieldError('brandName', { type: 'manual', message: 'Brand name is required.' });
      } else {
        setFieldError('fullName', { type: 'manual', message: 'Full name is required.' });
      }
      return;
    }
    if (fullNameToSend.length < 2) {
      if (userType === 'brand') {
        setFieldError('brandName', { type: 'manual', message: 'Brand name must be at least 2 characters.' });
      } else {
        setFieldError('fullName', { type: 'manual', message: 'Full name must be at least 2 characters.' });
      }
      return;
    }

    setIsLoading(true);

    try {
      await signup(data.email, data.password, fullNameToSend, userType as 'brand' | 'influencer');
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
    <div className="min-h-screen flex items-start justify-center py-4 px-4 overflow-y-auto" style={{ background: 'linear-gradient(135deg, rgba(235, 188, 254, 0.3) 0%, rgba(240, 196, 105, 0.3) 100%)' }}>
    <div 
      className="flex max-w-[1114px] w-full items-stretch"
      style={{ minHeight: 'min(728px, 95vh)' }}
    >
         {/* Left Column - Promotional Section (top-aligned with right) */}
      <div className="hidden lg:flex relative overflow-hidden items-stretch">
        <div 
          className="flex flex-col p-12 w-full min-h-[500px] lg:min-h-[728px]"
          style={{
            width: '570px',
            maxWidth: '100%',
            background: 'linear-gradient(0deg, #EAFFC2 0%, #FFD4F6 100%)',
            gap: '10px'
          }}
        >
          <div className="flex flex-col justify-start">
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
              
              <TestimonialCarousel />
            </div>
          </div>
        </div>
      </div>

        {/* Right Column - Signup Form: top-aligned with left, scroll only when content overflows */}
      <div 
        className="w-full lg:w-1/2 flex items-start justify-center bg-white box-border min-h-0 flex-1"
        style={{ 
          minHeight: 'min(728px, 95vh)',
          paddingTop: '16px',
          paddingBottom: '24px',
          paddingLeft: '24px',
          paddingRight: '24px',
          overflowY: 'auto'
        }}
      >
        <div 
          className="flex flex-col w-full max-w-[544px] shrink-0"
          style={{
            transform: 'scale(0.92)',
            transformOrigin: 'top center',
            padding: '16px 40px 32px',
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
            `,
            boxSizing: 'border-box'
          }}
        >
          {/* Logo and Brand Name */}
          <div className="flex items-center gap-3" style={{ marginBottom: '12px' }}>
            <div className="w-12 h-12 flex items-center justify-center">
              <span 
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 700,
                  fontSize: '33px',
                  lineHeight: '100%',
                  color: colors.text.primary
                }}
              >
                ツ
              </span>
            </div>
            <h2 
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700,
                fontSize: '20px',
                lineHeight: '100%',
                letterSpacing: '0%',
                color: '#1E002B'
              }}
            >
              SOCIAL STRATIX
            </h2>
          </div>

          <div className="flex flex-col w-full">
            {/* Title - Figma: centered, large bold dark purple */}
            <h1 
              className="text-center"
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                fontSize: '33px',
                lineHeight: 1.2,
                color: '#1E002B',
                margin: '0 0 14px 0'
              }}
            >
              Create your Account
            </h1>

              {/* Sign Up with Google - Figma: white, grey border, Google G + text */}
              <button
                onClick={handleGoogleSignup}
                type="button"
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: '8px',
                  backgroundColor: colors.primary.white,
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  color: colors.text.secondary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '12px',
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

              {/* Or separator - Figma: thin grey line, "Or" centered */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
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
                    marginBottom: '12px',
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                >
                  {error}
                </div>
              )}

              {/* Form - Figma: single column, Full Name, Email, Brand name, Password stacked */}
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
                <div className="flex flex-col gap-3">
                  <Input
                    type="text"
                    label="Full Name"
                    placeholder="Full Name"
                    variant="login"
                    error={userType === 'influencer' ? errors.fullName?.message : undefined}
                    {...register('fullName')}
                  />
                  <Input
                    type="email"
                    label="Email"
                    placeholder="Email"
                    variant="login"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                  {userType === 'brand' && (
                    <Input
                      type="text"
                      label="Brand name"
                      placeholder="Brand name"
                      variant="login"
                      error={errors.brandName?.message}
                      {...register('brandName')}
                    />
                  )}
                  <Input
                    type="password"
                    label="Password"
                    placeholder="Password"
                    variant="login"
                    error={formattedPasswordError || errors.password?.message}
                    {...register('password')}
                  />
                  <Input
                    type="password"
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    variant="login"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                  />
                </div>

                {/* SIGN UP - Figma: wide rounded dark purple filled */}
                <Button
                  type="submit"
                  variant="filled"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '8px',
                    marginTop: '14px',
                    opacity: isLoading ? 0.6 : 1
                  }}
                  className="text-white font-semibold"
                >
                  {isLoading ? 'SIGNING UP...' : 'SIGN UP'}
                </Button>
              </form>

              {/* Already have account */}
              <div className="text-center" style={{ marginTop: '14px' }}>
                <p 
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 400,
                    fontSize: '14px',
                    color: colors.text.secondary,
                    marginBottom: '12px'
                  }}
                >
                  <Link
                    to="/login"
                    style={{
                      cursor: 'pointer',
                      color: colors.primary.main,
                      textDecoration: 'underline',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.primary.dark;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = colors.primary.main;
                    }}
                  >
                    Already have an account
                  </Link>
                </p>

                {/* LOGIN - Figma: white, light purple border */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLoginClick}
                  style={{ width: '100%', height: '44px', borderRadius: '8px' }}
                  className="font-semibold"
                >
                  LOGIN
                </Button>
              </div>

              {/* Terms - Figma: small grey, purple links */}
              <p 
                className="text-center"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 400,
                  fontSize: '12px',
                  lineHeight: 1.4,
                  color: colors.text.secondary,
                  marginTop: '12px'
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

