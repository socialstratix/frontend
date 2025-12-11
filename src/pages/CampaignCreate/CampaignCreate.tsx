import React from 'react';
import { Typography } from '../../components';
import { CampaignForm } from '../../components';

// Mock data
const mockInfluencers = Array.from({ length: 10 }, (_, i) => ({
  id: `inf-${i + 1}`,
  name: `Influencer ${i + 1}`,
  image: undefined,
}));

export const CampaignCreate: React.FC = () => {
  const handleSubmit = (data: any) => {
    // Handle campaign creation
    alert('Campaign created successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Typography variant="h1" className="mb-8 text-gray-900">
          Create New Campaign
        </Typography>
        <div className="bg-white rounded-lg shadow-md p-6">
          <CampaignForm
            onSubmit={handleSubmit}
            availableInfluencers={mockInfluencers}
          />
        </div>
      </div>
    </div>
  );
};

