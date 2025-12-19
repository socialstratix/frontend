import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Avatar } from '../../atoms';
import { NotificationsIcon } from '../../../assets/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../../atoms/Button';

interface HeaderProps {
  userAvatar?: string;
  userName?: string;
  userId?: string;
  brandId?: string; // MongoDB brand _id
  influencerId?: string; // MongoDB influencer _id
}

export const Header: React.FC<HeaderProps> = ({
  userAvatar,
  userName,
  userId,
  brandId,
  influencerId,
}) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const baseRoute = location.pathname.split('/')[1]; // Get 'home', 'brand', or 'influencer'
  
  // Get the actual user ID from auth context or props
  const actualUserId = userId || user?.id || '';
  
  // Construct profile path based on route structure
  // For brand routes, MUST use brandId (MongoDB _id), do NOT fall back to userId
  // For influencer routes, MUST use influencerId (MongoDB _id), do NOT fall back to userId
  let profilePath = '';
  if (baseRoute === 'brand') {
    // For brand routes: /brand/brand/:id (MUST use brandId - MongoDB _id)
    // Do NOT use userId as fallback - brandId is required for correct API call
    profilePath = brandId ? `/${baseRoute}/brand/${brandId}` : `/${baseRoute}`;
  } else if (baseRoute === 'influencer') {
    // For influencer routes: /influencer/influencer/:id (MUST use influencerId - MongoDB _id)
    // Do NOT use userId as fallback - influencerId is required for correct API call
    profilePath = influencerId ? `/${baseRoute}/influencer/${influencerId}` : `/${baseRoute}`;
  } else {
    // For home routes: /home/brand/:id or /home/influencer/:id
    // Determine based on user type
    if (user?.userType === 'brand') {
      // For brand users, MUST use brandId (MongoDB _id), do NOT use userId
      profilePath = brandId ? `/${baseRoute}/brand/${brandId}` : `/${baseRoute}`;
    } else if (user?.userType === 'influencer') {
      // For influencer users, MUST use influencerId (MongoDB _id), do NOT use userId
      profilePath = influencerId ? `/${baseRoute}/influencer/${influencerId}` : `/${baseRoute}`;
    } else {
      // Fallback: try brandId first, then influencerId, then userId
      profilePath = brandId ? `/${baseRoute}/brand/${brandId}` : (influencerId ? `/${baseRoute}/influencer/${influencerId}` : (actualUserId ? `/${baseRoute}/brand/${actualUserId}` : `/${baseRoute}`));
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white w-full h-16 md:h-20 border-b border-gray-200" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-6 h-full">
        <div className="flex items-center justify-between h-full gap-2 md:gap-2.5">
          {/* Left Section - Logo */}
          <div className="flex items-center gap-1.5 md:gap-2.5">
            <Link to="/" className="flex items-center gap-1.5 md:gap-2.5">
              {/* Logo Icon */}
              <span
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 700,
                  fontSize: 'clamp(18px, 2vw, 24.75px)',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  verticalAlign: 'middle',
                  color: '#1E002B'
                }}
              >
                ツ
              </span>
              {/* Logo Text */}
              <span 
                className="uppercase hidden sm:inline"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 700,
                  fontSize: 'clamp(12px, 1.5vw, 15px)',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  verticalAlign: 'middle',
                  color: '#3F214C'
                }}
              >
                SOCIAL STRATIX
              </span>
            </Link>
          </div>

          {/* Right Section - Search Bar, Navigation and User Controls */}
          <div className="flex items-center gap-1 md:gap-2.5">
            {/* Search Bar */}
            <div className="relative hidden md:block" style={{ width: 'clamp(200px, 20vw, 272px)' }}>
              <input
                type="text"
                placeholder="Search influencers"
                className="w-full focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-custom"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 400,
                  fontSize: 'clamp(12px, 1.2vw, 14px)',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  color: '#1E002B',
                  width: '100%',
                  height: 'clamp(36px, 4vh, 42px)',
                  borderRadius: '4px',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: '#AA86B9',
                  paddingLeft: '12px',
                  paddingRight: '36px'
                }}
              />
              <div className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: '#1E002B' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            {/* Navigation Links */}
            <Link
              to={baseRoute === 'influencer' ? `/${baseRoute}` : 'campaigns/create'}
              className="px-2 md:px-4 py-2 hover:opacity-80 transition-colors text-xs md:text-sm whitespace-nowrap"
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 400,
                lineHeight: '100%',
                letterSpacing: '0%',
                verticalAlign: 'middle',
                color: '#1E002B'
              }}
            >
              {baseRoute === 'influencer' ? 'Find Work' : 'Post Campaign'}
            </Link>
            <Link
              to="messages"
              className="px-2 md:px-4 py-2 hover:opacity-80 transition-colors text-xs md:text-sm whitespace-nowrap"
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 400,
                lineHeight: '100%',
                letterSpacing: '0%',
                verticalAlign: 'middle',
                color: '#1E002B'
              }}
            >
              Messages
            </Link>

            {/* Notification Bell */}
            <button 
              className="relative p-1.5 md:p-2 hover:opacity-80 transition-colors"
              style={{ color: '#1E002B' }}
            >
              <img 
                src={NotificationsIcon} 
                alt="Notifications" 
                className="w-5 h-5 md:w-6 md:h-6"
              />
            </button>

            {/* User Avatar */}
            <Link to={profilePath} className="ml-1 md:ml-2 hover:opacity-80 transition-opacity cursor-pointer">
              <Avatar
                src={userAvatar}
                size="md"
                fallback={userName || 'U'}
                className="bg-green-700"
              />
            </Link>

            {/* Logout Button */}
            <Button
              variant="outline"
              onClick={logout}
              className="ml-2 md:ml-3 px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm whitespace-nowrap"
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 400,
                lineHeight: '100%',
                letterSpacing: '0%',
                verticalAlign: 'middle',
                color: '#1E002B',
                borderColor: '#AA86B9',
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

