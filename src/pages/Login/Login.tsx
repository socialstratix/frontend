import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/atoms/Input';
import { Button } from '../../components/atoms/Button';
import { colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // Redirect based on user type - will be handled by ProtectedRoute
      const user = JSON.parse(localStorage.getItem('stratix_user') || '{}');
      if (user.userType === 'brand') {
        navigate('/brand');
      } else if (user.userType === 'influencer') {
        navigate('/influencer');
      } else {
        navigate('/login');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Handle Google login logic here
    // Redirect to user type selection page
    navigate('/user-type-selection');
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(235, 188, 254, 0.3) 0%, rgba(240, 196, 105, 0.3) 100%)' }}>
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
              height: '608px',
              gap: '16px',
              opacity: 1,
              transform: 'rotate(0deg)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <h1 
              style={{
                width: '263px',
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
                margin: '0 auto',
                alignSelf: 'center'
              }}
            >
              Welcome back!
            </h1>

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
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            {/* Email and Password Inputs Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                  placeholder="Enter your password"
                  required
                  variant="login"
                />
                <div className="mt-2" style={{ width: '464px', textAlign: 'right' }}>
                  <a 
                    href="#" 
                    style={{
                      height: '21px',
                      fontFamily: 'Poppins',
                      fontWeight: 600,
                      fontSize: '14px',
                      lineHeight: '100%',
                      letterSpacing: '0%',
                      verticalAlign: 'middle',
                      color: colors.primary.main,
                      display: 'inline-block'
                    }}
                    className="hover:opacity-80 transition-opacity"
                  >
                    Forgot Password?
                  </a>
                </div>
              </div>
            </div>

            {/* Login Button */}
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
              {isLoading ? 'LOGGING IN...' : 'LOGIN'}
            </Button>
            </form>

            {/* Separator */}
            <div className="relative" style={{ marginTop: '16px', marginBottom: '16px' }}>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or</span>
              </div>
            </div>

            {/* Google Login Button */}
            <Button
              type="button"
              onClick={handleGoogleLogin}
              style={{
                width: '442px',
                height: '56px',
                paddingTop: '8px',
                paddingBottom: '8px',
                borderTopLeftRadius: '4px',
                borderTopRightRadius: '4px',
                border: `1px solid ${colors.secondary.main}`,
                opacity: 1,
                transform: 'rotate(0deg)',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              className="bg-white hover:bg-gray-50 !p-0"
            >
              <div
                style={{
                  width: '442px',
                  height: '40px',
                  opacity: 1,
                  transform: 'rotate(0deg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span
                  style={{
                    fontFamily: 'Poppins',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '100%',
                    letterSpacing: '0%',
                    color: colors.primary.dark,
                    opacity: 1,
                    transform: 'rotate(0deg)'
                  }}
                >
                  Continue with Google
                </span>
              </div>
            </Button>

            {/* Sign Up Prompt */}
            <div className="text-center" style={{ marginTop: '16px' }}>
              <p
                style={{
                  width: '179px',
                  height: '18px',
                  fontFamily: 'Poppins',
                  fontWeight: 600,
                  fontSize: '12px',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  verticalAlign: 'middle',
                  color: colors.text.secondary,
                  opacity: 1,
                  transform: 'rotate(0deg)',
                  margin: '0 auto 16px auto',
                  paddingTop: '8px',
                  paddingBottom: '8px'
                }}
              >
                Don't have a Stratix account?
              </p>
                <Button
                  type="button"
                  onClick={() => navigate('/signup')}
                style={{
                  width: '464px',
                  height: '41px',
                  borderRadius: '100px',
                  border: `1px solid ${colors.primary.main}`,
                  borderWidth: '1px',
                  gap: '8px',
                  opacity: 1,
                  transform: 'rotate(0deg)',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                  color: colors.primary.main
                }}
                className="hover:bg-purple-50 !p-0"
              >
                <span
                  style={{
                    width: '56px',
                    height: '21px',
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    fontSize: '14px',
                    lineHeight: '100%',
                    letterSpacing: '0%',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    textTransform: 'uppercase',
                    color: colors.primary.main,
                    opacity: 1,
                    transform: 'rotate(0deg)'
                  }}
                >
                  SIGN UP
                </span>
              </Button>
            </div>

            {/* Terms and Privacy */}
            <p className="text-xs text-center text-gray-500" style={{ marginTop: '16px' }}>
              By continuing, you agree to Social Stratix{' '}
              <a href="/terms" className="text-purple-600 hover:text-purple-700 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-purple-600 hover:text-purple-700 underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

