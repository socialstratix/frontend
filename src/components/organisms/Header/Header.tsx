import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Avatar } from '../../atoms';
import { NotificationsIcon } from '../../../assets/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../../atoms/Button';
import { useDebounce } from '../../../hooks/useDebounce';
import { influencerService } from '../../../services/influencerService';
import type { Influencer } from '../../../services/influencerService';
import { brandService } from '../../../services/brandService';
import type { Brand } from '../../../services/brandService';
import { messageService } from '../../../services/messageService';
import { useSocket } from '../../../contexts/SocketContext';

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
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const baseRoute = location.pathname.split('/')[1]; // Get 'home', 'brand', or 'influencer'
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Influencer[]>([]);
  const [brandSearchResults, setBrandSearchResults] = useState<Brand[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const isInfluencer = user?.userType === 'influencer';
  
  // Unread message count
  const [unreadCount, setUnreadCount] = useState(0);
  
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

  // Search functionality
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchQuery.trim()) {
        setSearchResults([]);
        setBrandSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        if (isInfluencer) {
          // For influencers: ONLY search for brands
          const response = await brandService.getAllBrands({
            search: debouncedSearchQuery,
            limit: 5, // Limit to 5 results for dropdown
          });
          setBrandSearchResults(response.brands || []);
          setSearchResults([]); // Clear influencer results
        } else if (user?.userType === 'brand') {
          // For brands: ONLY search for influencers
          const response = await influencerService.getAllInfluencers({
            search: debouncedSearchQuery,
            limit: 5, // Limit to 5 results for dropdown
          });
          setSearchResults(response.influencers || []);
          setBrandSearchResults([]); // Clear brand results
        } else {
          // For unauthenticated or unknown user types: no search
          setSearchResults([]);
          setBrandSearchResults([]);
        }
      } catch (error) {
        console.error(`Error searching ${isInfluencer ? 'brands' : 'influencers'}:`, error);
        setSearchResults([]);
        setBrandSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery, isInfluencer]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch unread message count on mount
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await messageService.getUnreadCount();
        // Response structure: { success: true, data: { unreadCount: number } }
        if (response && response.success && response.data) {
          setUnreadCount(response.data.unreadCount || 0);
        } else {
          console.warn('Unexpected response format from getUnreadCount:', response);
          setUnreadCount(0);
        }
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
        setUnreadCount(0); // Set to 0 on error
      }
    };

    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  // Listen for new messages via socket to update unread count
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewMessage = () => {
      // Refresh unread count when new message arrives
      messageService.getUnreadCount()
        .then((response) => {
          if (response.success && response.data) {
            setUnreadCount(response.data.unreadCount || 0);
          }
        })
        .catch((error) => {
          console.error('Failed to update unread count:', error);
        });
    };

    const handleMessageRead = () => {
      // Refresh unread count when message is read
      messageService.getUnreadCount()
        .then((response) => {
          if (response.success && response.data) {
            setUnreadCount(response.data.unreadCount || 0);
          }
        })
        .catch((error) => {
          console.error('Failed to update unread count:', error);
        });
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('messageRead', handleMessageRead);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messageRead', handleMessageRead);
    };
  }, [socket, user]);

  // Get influencer detail path based on base route
  const getInfluencerPath = (influencerId: string) => {
    if (baseRoute === 'brand') {
      return `/brand/influencer/${influencerId}`;
    } else if (baseRoute === 'influencer') {
      return `/influencer/influencer/${influencerId}`;
    } else {
      return `/home/influencer/${influencerId}`;
    }
  };

  // Get brand detail path based on base route
  const getBrandPath = (brandId: string) => {
    if (baseRoute === 'brand') {
      return `/brand/brand/${brandId}`;
    } else if (baseRoute === 'influencer') {
      return `/influencer/brand/${brandId}`;
    } else {
      return `/home/brand/${brandId}`;
    }
  };

  const handleInfluencerClick = (influencerId: string) => {
    navigate(getInfluencerPath(influencerId));
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const handleBrandClick = (brandId: string) => {
    navigate(getBrandPath(brandId));
    setShowSearchResults(false);
    setSearchQuery('');
  };

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
            <div 
              ref={searchRef}
              className="relative hidden md:block" 
              style={{ width: 'clamp(200px, 20vw, 272px)' }}
            >
              <input
                type="text"
                placeholder={isInfluencer ? "Search brands" : (user?.userType === 'brand' ? "Search influencers" : "Search")}
                disabled={!isInfluencer && user?.userType !== 'brand'}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => {
                  if (searchResults.length > 0 || brandSearchResults.length > 0 || isSearching) {
                    setShowSearchResults(true);
                  }
                }}
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

              {/* Search Results Dropdown */}
              {showSearchResults && ((isInfluencer ? brandSearchResults.length > 0 : searchResults.length > 0) || isSearching || (debouncedSearchQuery && !isSearching)) && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #AA86B9',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    zIndex: 1000,
                    maxHeight: '400px',
                    overflowY: 'auto',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  {isSearching ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
                      Searching...
                    </div>
                  ) : isInfluencer ? (
                    // Brand search results for influencers
                    brandSearchResults.length > 0 ? (
                      <>
                        {brandSearchResults.map((brand) => (
                          <div
                            key={brand._id}
                            onClick={() => handleBrandClick(brand._id)}
                            style={{
                              padding: '12px 16px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #F0F0F0',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#F8F8F8';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#FFFFFF';
                            }}
                          >
                            <div
                              style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#1E002B',
                                marginBottom: '4px',
                              }}
                            >
                              {brand.user?.name || 'Brand'}
                            </div>
                            {brand.description && (
                              <div
                                style={{
                                  fontSize: '12px',
                                  color: '#666',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {brand.description}
                              </div>
                            )}
                          </div>
                        ))}
                        {debouncedSearchQuery && (
                          <div
                            style={{
                              padding: '12px 16px',
                              borderTop: '1px solid #F0F0F0',
                              fontSize: '12px',
                              color: '#666',
                            }}
                          >
                            <div style={{ marginBottom: '8px', fontWeight: 600, color: '#1E002B' }}>
                              Try searching for
                            </div>
                            <div
                              onClick={() => {
                                setSearchQuery('Fashion brands');
                                setShowSearchResults(true);
                              }}
                              style={{
                                padding: '4px 0',
                                cursor: 'pointer',
                                color: '#783C91',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.textDecoration = 'underline';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.textDecoration = 'none';
                              }}
                            >
                              Fashion brands
                            </div>
                            <div
                              onClick={() => {
                                setSearchQuery('Tech brands');
                                setShowSearchResults(true);
                              }}
                              style={{
                                padding: '4px 0',
                                cursor: 'pointer',
                                color: '#783C91',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.textDecoration = 'underline';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.textDecoration = 'none';
                              }}
                            >
                              Tech brands
                            </div>
                            <div
                              onClick={() => {
                                setSearchQuery('Beauty brands');
                                setShowSearchResults(true);
                              }}
                              style={{
                                padding: '4px 0',
                                cursor: 'pointer',
                                color: '#783C91',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.textDecoration = 'underline';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.textDecoration = 'none';
                              }}
                            >
                              Beauty brands
                            </div>
                          </div>
                        )}
                      </>
                    ) : null
                  ) : (
                    // Influencer search results for brands
                    searchResults.length > 0 ? (
                      <>
                        {searchResults.map((influencer) => (
                          <div
                            key={influencer._id}
                            onClick={() => handleInfluencerClick(influencer._id)}
                            style={{
                              padding: '12px 16px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #F0F0F0',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#F8F8F8';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#FFFFFF';
                            }}
                          >
                            <div
                              style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#1E002B',
                                marginBottom: '4px',
                              }}
                            >
                              {influencer.user?.name || 'Influencer'}
                            </div>
                            {(influencer.description || influencer.bio) && (
                              <div
                                style={{
                                  fontSize: '12px',
                                  color: '#666',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {influencer.description || influencer.bio}
                              </div>
                            )}
                          </div>
                        ))}
                        {debouncedSearchQuery && (
                          <div
                            style={{
                              padding: '12px 16px',
                              borderTop: '1px solid #F0F0F0',
                              fontSize: '12px',
                              color: '#666',
                            }}
                          >
                            <div style={{ marginBottom: '8px', fontWeight: 600, color: '#1E002B' }}>
                              Try searching for
                            </div>
                            <div
                              onClick={() => {
                                setSearchQuery('Fashion influencers');
                                setShowSearchResults(true);
                              }}
                              style={{
                                padding: '4px 0',
                                cursor: 'pointer',
                                color: '#783C91',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.textDecoration = 'underline';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.textDecoration = 'none';
                              }}
                            >
                              Fashion influencers
                            </div>
                            <div
                              onClick={() => {
                                setSearchQuery('Travel Influencers');
                                setShowSearchResults(true);
                              }}
                              style={{
                                padding: '4px 0',
                                cursor: 'pointer',
                                color: '#783C91',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.textDecoration = 'underline';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.textDecoration = 'none';
                              }}
                            >
                              Travel Influencers
                            </div>
                            <div
                              onClick={() => {
                                setSearchQuery('Fitness Influencers');
                                setShowSearchResults(true);
                              }}
                              style={{
                                padding: '4px 0',
                                cursor: 'pointer',
                                color: '#783C91',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.textDecoration = 'underline';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.textDecoration = 'none';
                              }}
                            >
                              Fitness Influencers
                            </div>
                          </div>
                        )}
                      </>
                    ) : null
                  )}
                  {debouncedSearchQuery && (isInfluencer ? brandSearchResults.length === 0 : searchResults.length === 0) && (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
                      {isInfluencer ? 'No brands found' : 'No influencers found'}
                      <div
                        style={{
                          marginTop: '12px',
                          fontSize: '12px',
                          color: '#666',
                        }}
                      >
                        <div style={{ marginBottom: '8px', fontWeight: 600, color: '#1E002B' }}>
                          Try searching for
                        </div>
                        {isInfluencer ? (
                          <>
                            <div
                              onClick={() => {
                                setSearchQuery('Fashion brands');
                                setShowSearchResults(true);
                              }}
                              style={{
                                padding: '4px 0',
                                cursor: 'pointer',
                                color: '#783C91',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.textDecoration = 'underline';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.textDecoration = 'none';
                              }}
                            >
                              Fashion brands
                            </div>
                            <div
                              onClick={() => {
                                setSearchQuery('Tech brands');
                                setShowSearchResults(true);
                              }}
                              style={{
                                padding: '4px 0',
                                cursor: 'pointer',
                                color: '#783C91',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.textDecoration = 'underline';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.textDecoration = 'none';
                              }}
                            >
                              Tech brands
                            </div>
                            <div
                              onClick={() => {
                                setSearchQuery('Beauty brands');
                                setShowSearchResults(true);
                              }}
                              style={{
                                padding: '4px 0',
                                cursor: 'pointer',
                                color: '#783C91',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.textDecoration = 'underline';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.textDecoration = 'none';
                              }}
                            >
                              Beauty brands
                            </div>
                          </>
                        ) : (
                          <>
                            <div
                              onClick={() => {
                                setSearchQuery('Fashion influencers');
                                setShowSearchResults(true);
                              }}
                              style={{
                                padding: '4px 0',
                                cursor: 'pointer',
                                color: '#783C91',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.textDecoration = 'underline';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.textDecoration = 'none';
                              }}
                            >
                              Fashion influencers
                            </div>
                            <div
                              onClick={() => {
                                setSearchQuery('Travel Influencers');
                                setShowSearchResults(true);
                              }}
                              style={{
                                padding: '4px 0',
                                cursor: 'pointer',
                                color: '#783C91',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.textDecoration = 'underline';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.textDecoration = 'none';
                              }}
                            >
                              Travel Influencers
                            </div>
                            <div
                              onClick={() => {
                                setSearchQuery('Fitness Influencers');
                                setShowSearchResults(true);
                              }}
                              style={{
                                padding: '4px 0',
                                cursor: 'pointer',
                                color: '#783C91',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.textDecoration = 'underline';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.textDecoration = 'none';
                              }}
                            >
                              Fitness Influencers
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Navigation Links */}
            <Link
              to={baseRoute === 'influencer' ? `/${baseRoute}` : `/${baseRoute || 'brand'}/campaigns/create`}
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
              to={`/${baseRoute || 'brand'}/messages`}
              className="px-2 md:px-4 py-2 hover:opacity-80 transition-colors text-xs md:text-sm whitespace-nowrap relative"
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
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    backgroundColor: '#EF4444',
                    color: 'white',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 600,
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
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

