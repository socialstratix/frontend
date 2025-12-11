import React from 'react';
import { InfluencerCard } from '../../molecules';
import { Typography } from '../../atoms';

interface Influencer {
  id: string;
  name: string;
  image?: string;
  profileImage?: string;
  rating?: number;
  description?: string;
  platformFollowers?: {
    x?: number;
    youtube?: number;
    facebook?: number;
    instagram?: number;
    tiktok?: number;
  };
  platforms: Array<'instagram' | 'youtube' | 'tiktok' | 'x' | 'facebook'>;
  isTopCreator?: boolean;
}

interface InfluencerGridProps {
  title?: string;
  influencers: Influencer[];
  onInfluencerClick?: (influencer: Influencer) => void
}

export const InfluencerGrid: React.FC<InfluencerGridProps> = ({
  title,
  influencers,
  onInfluencerClick,
}) => {
  return (
    <div>
      {title && (
        <Typography variant="h2" className="mb-6 text-gray-900">
          {title}
        </Typography>
      )}
      <div
        style={{
          width: '1586px',
          maxWidth: '100%',
          height: '1620px',
          gap: '8px',
          paddingTop: '24px',
          paddingRight: '16px',
          paddingLeft: '16px',
          backgroundColor: '#FFFFFF',
          borderRadius: '4px',
          overflowY: 'auto'
        }}
      >
        <div 
          style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(376px, 1fr))',
            gap: '16px',
            width: '100%'
          }}
        >
          {influencers.map((influencer) => (
            <InfluencerCard
              key={influencer.id}
              name={influencer.name}
              image={influencer.image}
              profileImage={influencer.profileImage}
              rating={influencer.rating}
              description={influencer.description}
              isTopCreator={influencer.isTopCreator}
              platformFollowers={influencer.platformFollowers}
              onClick={() => onInfluencerClick?.(influencer)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

