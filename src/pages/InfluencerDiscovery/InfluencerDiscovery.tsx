import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Typography } from '../../components';
import { InfluencerGrid } from '../../components';
import { useInfluencerList } from '../../hooks';

export const InfluencerDiscovery: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch influencers from API
  const { influencers, isLoading, error } = useInfluencerList({
    limit: 50, // Fetch more influencers for the grid
  });

  // Determine the base path based on current route
  const getBasePath = () => {
    if (location.pathname.startsWith('/brand')) {
      return '/brand';
    } else if (location.pathname.startsWith('/influencer')) {
      return '/influencer';
    } else {
      return '/home';
    }
  };

  // Map API data to InfluencerGrid format
  const mappedInfluencers = useMemo(() => {
    return influencers.map((influencer) => {
      // Determine which platforms the influencer has based on platformFollowers
      const platforms: Array<'instagram' | 'youtube' | 'tiktok' | 'x' | 'facebook'> = [];
      if (influencer.platformFollowers?.x) platforms.push('x');
      if (influencer.platformFollowers?.youtube) platforms.push('youtube');
      if (influencer.platformFollowers?.facebook) platforms.push('facebook');
      if (influencer.platformFollowers?.instagram) platforms.push('instagram');
      if (influencer.platformFollowers?.tiktok) platforms.push('tiktok');

      return {
        id: influencer._id,
        name: influencer.user?.name || 'Influencer',
        image: influencer.coverImage,
        profileImage: influencer.profileImage || influencer.user?.avatar,
        rating: influencer.rating,
        description: influencer.description || influencer.bio,
        platforms,
        platformFollowers: influencer.platformFollowers,
        isTopCreator: influencer.isTopCreator,
      };
    });
  }, [influencers]);

  return (
    <div 
      className="w-full py-4 sm:py-6 md:py-8"
      style={{
        background: 'linear-gradient(135deg, rgba(235, 188, 254, 0.3) 0%, rgba(240, 196, 105, 0.3) 100%)',
        minHeight: 'calc(100vh - 200px)', // Dynamic height: viewport minus header/footer
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="mb-8 text-center">
          <h1
            className="mb-2 font-bold mx-auto"
            style={{
              background: 'linear-gradient(90deg, #DD8AFF 0%, #783C91 20%, #DB9400 95%, #FFC244 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '48px',
              fontWeight: 700,
              lineHeight: '1.2',
              textAlign: 'center'
            }}
          >
            Right Voices to Amplify Your Brand!
          </h1>
          <Typography variant="p" className="text-gray-600 mb-6 text-center">
            Find the perfect influencers for Instagram, YouTube, TikTok, and more
          </Typography>
        </div>

        {isLoading ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '40px',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #783C91',
              borderTop: '4px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ fontFamily: 'Poppins', color: '#666' }}>
              Loading influencers...
            </p>
          </div>
        ) : error ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: '#d32f2f',
            fontFamily: 'Poppins'
          }}>
            <p>Error loading influencers: {error}</p>
          </div>
        ) : mappedInfluencers.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: '#666',
            fontFamily: 'Poppins'
          }}>
            <p>No influencers found.</p>
          </div>
        ) : (
          <InfluencerGrid
            influencers={mappedInfluencers}
            onInfluencerClick={(influencer) => {
              navigate(`${getBasePath()}/influencer/${influencer.id}`);
            }}
          />
        )}
      </div>
    </div>
  );
};

