import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header, Footer } from '../../organisms';
import { useAuth } from '../../../contexts/AuthContext';
import { useBrand } from '../../../hooks/useBrand';
import { useInfluencer } from '../../../hooks/useInfluencer';

interface BaseLayoutProps {
  headerProps?: React.ComponentProps<typeof Header>;
  footerProps?: React.ComponentProps<typeof Footer>;
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({
  headerProps,
  footerProps,
}) => {
  const location = useLocation();
  const { user } = useAuth();
  const isMessagesPage = location.pathname.includes('/messages');

  // Fetch brand data if user is a brand
  const { brand } = useBrand({
    userId: user?.userType === 'brand' ? user?.id : undefined,
    autoFetch: user?.userType === 'brand' && !!user?.id,
  });

  // Fetch influencer data if user is an influencer
  const { influencer } = useInfluencer({
    userId: user?.userType === 'influencer' ? user?.id : undefined,
    autoFetch: user?.userType === 'influencer' && !!user?.id,
  });

  // Determine avatar: brand logo > influencer profile image > user avatar > headerProps avatar
  const avatar = brand?.logo || influencer?.profileImage || influencer?.user?.avatar || user?.avatar || headerProps?.userAvatar;
  
  // Determine name: brand name > influencer name > user name > headerProps name
  const displayName = brand?.user?.name || influencer?.user?.name || user?.name || headerProps?.userName;

  // Merge user data from auth context with headerProps
  // Use brand._id for brand routes, influencer._id for influencer routes
  // Ensure brandId/influencerId is passed if exists - these are MongoDB _id, NOT userId
  const brandId = brand?._id ? String(brand._id) : (headerProps?.brandId ? String(headerProps.brandId) : undefined);
  const influencerId = influencer?._id ? String(influencer._id) : (headerProps?.influencerId ? String(headerProps.influencerId) : undefined);
  
  const mergedHeaderProps = {
    ...headerProps,
    userAvatar: avatar,
    userName: displayName,
    userId: headerProps?.userId || user?.id,
    // CRITICAL: Always use brand._id (MongoDB _id) for brand routes, NOT userId
    // This ensures the correct API call is made when clicking the brand logo
    brandId: brandId,
    // CRITICAL: Always use influencer._id (MongoDB _id) for influencer routes, NOT userId
    // This ensures the correct API call is made when clicking the influencer avatar
    influencerId: influencerId,
  };

  return (
    <div 
      className="flex flex-col min-h-screen w-full"
      style={{ background: 'linear-gradient(135deg, rgba(235, 188, 254, 0.3) 0%, rgba(240, 196, 105, 0.3) 100%)' }}
    >
      <Header {...mergedHeaderProps} />
      <main className="flex-grow">
        <Outlet />
      </main>
      {!isMessagesPage && <Footer {...footerProps} />}
    </div>
  );
};

