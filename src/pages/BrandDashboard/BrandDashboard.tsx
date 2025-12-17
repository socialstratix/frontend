import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Avatar, Badge } from '../../components';
import { CampaignList, StatsOverview } from '../../components';
import { Card } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

interface Brand {
  _id: string;
  userId: string;
  description: string;
  website?: string;
  location?: string;
  logo?: string;
  tags?: string[];
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'completed' | 'paused';
}

export const BrandDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrandData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch brand profile
        const brandResponse = await apiService.get<{ brand: Brand }>(`/brand/${user.id}`);
        
        if (brandResponse.success && brandResponse.data) {
          setBrand(brandResponse.data.brand);
        } else {
          setError('Brand profile not found');
        }

        // TODO: Fetch campaigns when campaign API is available
        // For now, using empty array
        setCampaigns([]);
      } catch (err: any) {
        setError(err.message || 'Failed to load brand data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrandData();
  }, [user?.id]);

  // Calculate stats from campaigns (placeholder for now)
  const brandStats = [
    { title: 'Campaigns', value: campaigns.length.toString() },
    { title: 'Total Reach', value: '0' },
    { title: 'Posts', value: '0' },
    { title: 'Total Spend', value: '$0' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <Typography variant="p" className="text-gray-600">
          Loading brand dashboard...
        </Typography>
      </div>
    );
  }

  if (error && !brand) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <Typography variant="h2" className="mb-2 text-gray-900">
            {error}
          </Typography>
          <Typography variant="p" className="text-gray-600 mb-4">
            Please complete your brand profile setup.
          </Typography>
          <button
            onClick={() => navigate('/brand/onboarding')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Setup Brand Profile
          </button>
        </div>
      </div>
    );
  }

  const brandName = brand?.user?.name || 'Your Brand';
  const brandDescription = brand?.description || 'No description available';
  const brandLogo = brand?.logo || brand?.user?.avatar;

  return (
    <div className="min-h-screen py-8" style={{ background: 'linear-gradient(135deg, rgba(235, 188, 254, 0.3) 0%, rgba(240, 196, 105, 0.3) 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start gap-6">
            <Avatar 
              size="xl" 
              fallback={brandName}
              src={brandLogo}
            />
            <div className="flex-1">
              <Typography variant="h1" className="mb-2 text-gray-900">
                {brandName}
              </Typography>
              <Typography variant="p" className="text-gray-600">
                {brandDescription}
              </Typography>
              {brand?.tags && brand.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {brand.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <StatsOverview stats={brandStats} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CampaignList
              title="Your Campaigns"
              campaigns={campaigns}
              onCampaignClick={(campaign) => {
                navigate(`/campaigns/${campaign.id}`);
              }}
              onCampaignEdit={(campaign) => {
                navigate(`/campaigns/${campaign.id}`);
              }}
            />
          </div>

          <div>
            <Card title="Quick Actions">
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/campaigns/create')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Typography variant="p" className="font-medium">
                    Create New Campaign
                  </Typography>
                </button>
                <button
                  onClick={() => navigate('/home/discover')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Typography variant="p" className="font-medium">
                    Browse Influencers
                  </Typography>
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <Typography variant="p" className="font-medium">
                    View Analytics
                  </Typography>
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

