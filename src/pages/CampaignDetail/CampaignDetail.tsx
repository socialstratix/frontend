import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Button, Badge, Checkbox } from '../../components';
import { Card } from '../../components';

// Mock data
const mockCampaign = {
  id: '1',
  name: 'Summer Collection Launch',
  description:
    'Promoting our new summer collection with lifestyle influencers. This campaign focuses on showcasing our latest products through authentic content from trusted creators.',
  status: 'active' as const,
  platforms: ['instagram', 'youtube', 'tiktok'],
  tags: ['summer', 'fashion', 'lifestyle'],
  publishDate: '2024-06-15',
  publishTime: '10:00',
};

export const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedPlatforms, setSelectedPlatforms] = useState(
    mockCampaign.platforms
  );
  
  // In a real app, you would fetch campaign data based on the id
  // For now, we'll use mock data

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Typography variant="h1" className="mb-2 text-gray-900">
              {mockCampaign.name}
            </Typography>
            <Badge variant="success" size="md">
              {mockCampaign.status.charAt(0).toUpperCase() +
                mockCampaign.status.slice(1)}
            </Badge>
          </div>
          <Button variant="outline">Edit Campaign</Button>
        </div>

        <Card className="mb-6">
          <Typography variant="h3" className="mb-4 text-gray-900">
            Description
          </Typography>
          <Typography variant="p" className="text-gray-600">
            {mockCampaign.description}
          </Typography>
        </Card>

        <Card className="mb-6">
          <Typography variant="h3" className="mb-4 text-gray-900">
            Post on
          </Typography>
          <div className="space-y-2">
            {['Instagram', 'YouTube', 'TikTok'].map((platform) => (
              <Checkbox
                key={platform}
                label={platform}
                checked={selectedPlatforms.includes(platform.toLowerCase())}
                onChange={() => togglePlatform(platform.toLowerCase())}
              />
            ))}
          </div>
        </Card>

        <Card className="mb-6">
          <Typography variant="h3" className="mb-4 text-gray-900">
            Tags
          </Typography>
          <div className="flex flex-wrap gap-2">
            {mockCampaign.tags.map((tag) => (
              <Badge key={tag} variant="info" size="md">
                {tag}
              </Badge>
            ))}
          </div>
        </Card>

        <Card>
          <Typography variant="h3" className="mb-4 text-gray-900">
            Attachments
          </Typography>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Typography variant="p" className="text-gray-500 mb-4">
              Drag and drop files here or click to upload
            </Typography>
            <Button variant="outline" size="sm">
              Choose Files
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

