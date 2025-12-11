import React from 'react';
import { CampaignCard } from '../../molecules';
import { Typography } from '../../atoms';

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'completed' | 'paused';
}

interface CampaignListProps {
  title?: string;
  campaigns: Campaign[];
  onCampaignClick?: (campaign: Campaign) => void;
  onCampaignEdit?: (campaign: Campaign) => void;
}

export const CampaignList: React.FC<CampaignListProps> = ({
  title,
  campaigns,
  onCampaignClick,
  onCampaignEdit,
}) => {
  return (
    <div>
      {title && (
        <Typography variant="h2" className="mb-6 text-gray-900">
          {title}
        </Typography>
      )}
      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            name={campaign.name}
            description={campaign.description}
            status={campaign.status}
            onClick={() => onCampaignClick?.(campaign)}
            onEdit={() => onCampaignEdit?.(campaign)}
          />
        ))}
      </div>
    </div>
  );
};

